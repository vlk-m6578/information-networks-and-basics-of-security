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
            
            socket.setTimeout(15000);
            
            socket.on('data', (data) => {
                log.info(`Уязвимый сервер получил данные от ${clientIP}`);
                
                const response = [
                    'HTTP/1.1 200 OK',
                    'Content-Type: text/plain',
                    '',
                    'Vulnerable Server Response'
                ].join('\r\n');
                
                socket.write(response);
                socket.end();
            });
            
            socket.on('timeout', () => {
                log.warn(`УЯЗВИМЫЙ сервер: таймаут соединения с ${clientIP}`);
                socket.destroy();
            });
            
            socket.on('close', () => {
                log.info(`УЯЗВИМЫЙ сервер: соединение с ${clientIP} закрыто`);
            });
            
            socket.on('error', (err) => {
                log.error(`УЯЗВИМЫЙ сервер ошибка: ${err.message}`);
            });
        });
    }
    
    start() {
        this.server.listen(this.port, () => {
            log.section('УЯЗВИМЫЙ СЕРВЕР ЗАПУЩЕН (БЕЗ ЗАЩИТЫ)');
            log.warn(`Порт: ${this.port}`);
            log.warn(`ВНИМАНИЕ: Этот сервер не имеет защиты от атак!`);
            log.warn(`(только базовый таймаут 15 сек для избежания вечных соединений)`);
            console.log('');
        });
    }
    
    stop() {
        this.server.close();
        log.warn('УЯЗВИМЫЙ сервер остановлен');
    }
}

module.exports = VulnerableServer;

if (require.main === module) {
    const server = new VulnerableServer(8081);
    server.start();
    
    process.on('SIGINT', () => {
        server.stop();
        process.exit();
    });
}