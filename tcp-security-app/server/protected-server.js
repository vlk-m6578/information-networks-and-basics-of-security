const net = require('net');
const log = require('../utils/logger');

class ProtectedServer {
    constructor(port = 8080) {
        this.port = port;
        this.server = net.createServer();
        this.connections = new Map();
        this.maxPerIP = 5;
        this.setupServer();
    }
    
    setupServer() {
        this.server.on('connection', (socket) => {
            const clientIP = socket.remoteAddress || 'unknown';
            
            const currentCount = this.connections.get(clientIP) || 0;
            
            if (currentCount >= this.maxPerIP) {
                log.defense(`IP ${clientIP} превысил лимит (${this.maxPerIP})`);
                try { 
                    socket.write('HTTP/1.1 429 Too Many Connections\r\n\r\n');
                    socket.end();
                } catch (e) {}
                socket.destroy();
                return;
            }
            
            this.connections.set(clientIP, currentCount + 1);
            log.success(`IP ${clientIP} подключился (всего от IP: ${currentCount + 1})`);
            
            const timeout = setTimeout(() => {
                if (this.connections.has(clientIP)) {
                    const count = this.connections.get(clientIP) || 1;
                    if (count <= 1) {
                        this.connections.delete(clientIP);
                    } else {
                        this.connections.set(clientIP, count - 1);
                    }
                    log.defense(`Таймаут соединения с ${clientIP}`);
                    socket.destroy();
                }
            }, 5000); 
            
            socket.once('data', (data) => {
                clearTimeout(timeout); 
                
                if (data.toString().includes('GET /')) {
                    try {
                        socket.write('HTTP/1.1 200 OK\r\n');
                        socket.write('Content-Type: text/plain\r\n');
                        socket.write('\r\n');
                        socket.write('OK');
                        socket.end();
                        
                        setTimeout(() => {
                            const count = this.connections.get(clientIP) || 1;
                            if (count <= 1) {
                                this.connections.delete(clientIP);
                            } else {
                                this.connections.set(clientIP, count - 1);
                            }
                        }, 100);
                    } catch (e) {}
                }
            });
            
            socket.on('close', () => {
                clearTimeout(timeout);
                const count = this.connections.get(clientIP) || 1;
                if (count <= 1) {
                    this.connections.delete(clientIP);
                } else {
                    this.connections.set(clientIP, count - 1);
                }
            });
            
            socket.on('error', () => {
                clearTimeout(timeout);
            });
        });
    }
    
    start() {
        this.server.listen(this.port, () => {
            log.section('ЗАЩИЩЕННЫЙ СЕРВЕР');
            log.info(`Порт: ${this.port}`);
            log.info(`Лимит соединений с одного IP: ${this.maxPerIP}`);
            log.info(`Таймаут: 5 секунд`);
        });
    }
    
    stop() {
        this.server.close();
        log.warn('Защищенный сервер остановлен');
    }
}

module.exports = ProtectedServer;

if (require.main === module) {
    const server = new ProtectedServer(8080);
    server.start();
}