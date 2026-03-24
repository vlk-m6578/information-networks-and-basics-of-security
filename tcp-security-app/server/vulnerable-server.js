const net = require('net');
const log = require('../utils/logger');

class VulnerableServer {
    constructor(port = 8081) {
        this.port = port;
        this.server = net.createServer();
        this.connections = [];
        this.attackMode = false; 
        this.setupServer();
    }
    
    setupServer() {
        this.server.on('connection', (socket) => {
            const clientIP = socket.remoteAddress;
            this.connections.push(socket);
            
            log.warn(`УЯЗВИМЫЙ: подключился ${clientIP} (всего: ${this.connections.length})`);
            
            if (this.connections.length > 5) {
                this.attackMode = true;
                log.warn(`РЕЖИМ АТАКИ АКТИВИРОВАН! (${this.connections.length} соединений)`);
            }
            
            socket.once('data', (data) => {
                if (!this.attackMode && data.toString().includes('GET /')) {
                    try {
                        socket.write('HTTP/1.1 200 OK\r\n');
                        socket.write('Content-Type: text/plain\r\n');
                        socket.write('\r\n');
                        socket.write('OK');
                        socket.end();
                        log.success(`УЯЗВИМЫЙ: ответил клиенту ${clientIP}`);
                    } catch (e) {}
                } else if (this.attackMode) {
                    log.attack(`УЯЗВИМЫЙ: игнорирую запрос (режим атаки)`);
                }
            });
            
            socket.on('close', () => {
                const index = this.connections.indexOf(socket);
                if (index > -1) this.connections.splice(index, 1);
                
                if (this.connections.length <= 5) {
                    this.attackMode = false;
                    log.warn(`Режим атаки отключен (осталось: ${this.connections.length})`);
                }
                
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