const express = require('express');
// const WebSocket = require('ws');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// const wss = new WebSocket.Server({port: 8080});

app.get('/', (request, respond) => {
  respond.send('Kerberos server is working')
})

app.listen(PORT, () => {
  console.log(`Server is running: ${PORT}`);
})

