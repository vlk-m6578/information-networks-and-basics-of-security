const net = require('net');
const log = require('../utils/logger');

class VulnerableServer {
    constructor(port = 8081) {
        this.port = port;
        this.server = net.createServer();
        this.setupServer();
    }
    
    setupServer() {
        this.server.on('connection', (socket) => {
            const clientIP = socket.remoteAddress;
            log.warn(`УЯЗВИМЫЙ сервер принял соединение от ${clientIP} (без защиты)`);
            
            socket.on('data', (data) => {
                log.info(`Уязвимый сервер получил данные от ${clientIP}`);
                
                setTimeout(() => {
                    socket.write('HTTP/1.1 200 OK\r\n\r\nVulnerable Server Response\r\n');
                }, 1000);
            });
            
        });
    }
    
    start() {
        this.server.listen(this.port, () => {
            log.section('УЯЗВИМЫЙ СЕРВЕР ЗАПУЩЕН (БЕЗ ЗАЩИТЫ)');
            log.warn(`Порт: ${this.port}`);
            log.warn(`ВНИМАНИЕ: Этот сервер не имеет защиты от атак!`);
            console.log('');
        });
    }
}

module.exports = VulnerableServer;

if (require.main === module) {
    const server = new VulnerableServer(8081);
    server.start();
}