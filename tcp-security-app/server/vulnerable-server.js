const net = require('net');
const log = require('../utils/logger');

class VulnerableServer {
    constructor(port = 8081) {
        this.port = port;
        this.server = net.createServer();
        this.connections = [];
        this.setupServer();
    }
    
    setupServer() {
        this.server.on('connection', (socket) => {
            const clientIP = socket.remoteAddress;
            this.connections.push(socket);
            
            log.warn(`УЯЗВИМЫЙ: подключился ${clientIP} (всего: ${this.connections.length})`);
            
            socket.on('data', () => {
                // атака: ничего не делаем с данными
                // просто держим соединение открытым
            });
            
            socket.on('close', () => {
                const index = this.connections.indexOf(socket);
                if (index > -1) this.connections.splice(index, 1);
                log.warn(`УЯЗВИМЫЙ: соединение закрыто (осталось: ${this.connections.length})`);
            });
            
            socket.on('error', () => {});
        });
    }
    
    start() {
        this.server.listen(this.port, () => {
            log.section('УЯЗВИМЫЙ СЕРВЕР');
            log.warn(`Порт: ${this.port}`);
            log.warn(`НЕТ ЗАЩИТЫ. Принимает ВСЕ соединения`);
            log.warn(`НЕ ОТВЕЧАЕТ на запросы`);
        });
    }
    
    stop() {
        log.warn(`🛑 Закрываю ${this.connections.length} соединений...`);
        this.connections.forEach(s => s.destroy());
        this.server.close();
        log.warn('Уязвимый сервер остановлен');
    }
}

module.exports = VulnerableServer;

if (require.main === module) {
    const server = new VulnerableServer(8081);
    server.start();
}