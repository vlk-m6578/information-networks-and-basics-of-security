const express = require('express');
const path = require('path');
const as = require('./kerberos/as')

const TicketGrantingServer = require('./kerberos/tgs');
const FileService = require('./services/fileService');
const AttackManager = require('./attacks/attackManager');

const app = express();
const PORT = process.env.PORT || 3000;

const tgs = new TicketGrantingServer(as);
const fileService = new FileService(tgs);
const attackManager = new AttackManager(as, tgs, fileService);

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.get('/', (request, respond) => {
  respond.send('Server server is working')
})

app.post('/api/authenticate', (request, respond) => {
  try {
    const { username, password } = request.body;

    console.log(`Request to authentification from ${username}`);

    const result = as.authenticate(username, password);

    respond.json({
      success: true,
      message: 'Authentification success',
      data: result
    })
  } catch (error) {
    respond.status(401).json({
      success: false,
      message: error.message
    })
  }
})

app.post('/api/validate-tgt', (request, respond) => {
  try {
    const { tgtId } = request.body;

    const result = as.validateTGT(tgtId);

    respond.json({
      success: result.valid,
      message: result.valid ? 'TGT valid' : result.reason,
      data: result
    });

  } catch (error) {
    respond.status(401).json({
      success: false,
      message: error.message
    })
  }
})

app.get('/api/debug/tickets', (req, res) => {
  res.json({
    tickets: as.issuedTickets,
    count: Object.keys(as.issuedTickets).length
  });
});

app.post('/api/request-service-ticket', (req, res) => {
  try {
    const { tgtId, serviceName } = req.body;

    if (!tgtId || !serviceName) {
      return res.status(400).json({
        success: false,
        message: 'tgtId and serviceName are required'
      });
    }

    const result = tgs.requestServiceTicket(tgtId, serviceName);

    res.json({
      success: true,
      message: 'Service ticket issued',
      data: result
    });

  } catch (error) {
    console.error('TGS error:', error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

app.get('/api/debug/tgs', (req, res) => {
  const services = Object.keys(tgs.serviceKeys);
  const ticketsCount = Object.keys(tgs.issuedServiceTickets).length;

  res.json({
    availableServices: services,
    issuedTicketsCount: ticketsCount,
    activeTickets: tgs.issuedServiceTickets
  });
});

app.post('/api/access-files', (req, res) => {
  try {
    const { encryptedTicket, authenticator } = req.body;

    const result = fileService.accessFiles(encryptedTicket, authenticator);

    res.json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// app.get('/attacks', (req, res) => {
//   res.sendFile(path.join(__dirname, '../public/attacks.html'));
// });
// app.post('/api/attack/replay', async (req, res) => {
//   try {
//     // Используем тестовые данные
//     const testAuth = FileService.createAuthenticator('alice', 'test-key-123');
//     const testTicket = { encrypted: 'test-ticket' };

//     const result = await attackManager.demonstrateReplayAttack(testAuth, testTicket);
//     res.json({
//       protected: result.protected,
//       message: result.message
//     });
//   } catch (error) {
//     res.json({ protected: true, message: 'Attack blocked' });
//   }
// });

// app.get('/api/attack/log', (req, res) => {
//   const logs = attackManager.getAttackLog();
//   res.json({ logs });
// });

// app.post('/api/attack/tgt-theft', async (req, res) => {
//   try {
//     const { tgtId } = req.body;

//     const testTGTId = tgtId || 'stolen-tgt-12345';

//     const result = await attackManager.demonstrateTGTTheftAttack(testTGTId);
//     res.json(result);
//   } catch (error) {
//     res.json({
//       success: false,
//       protected: true,
//       message: 'PROTECTED: Attack blocked'
//     });
//   }
// });

app.listen(PORT, () => {
  console.log(`Server is running: ${PORT}`);
})

