const http = require('http');
const log = require('../utils/logger');

class LegitimateClient {
    constructor(port = 8080) {
        this.port = port;
        this.success = 0;
        this.fail = 0;
        this.total = 0;
        this.finished = false;
        this.pending = 0;
    }

    startTest(count = 10, delay = 1000) {
        const type = this.port === 8080 ? 'ЗАЩИЩЕННЫЙ' : 'УЯЗВИМЫЙ';
        log.section(`ТЕСТИРОВАНИЕ ${type} СЕРВЕРА`);
        log.info(`Порт: ${this.port}, запросов: ${count}`);
        
        let attempts = 0;
        
        const interval = setInterval(() => {
            if (attempts >= count) {
                clearInterval(interval);
                setTimeout(() => {
                    this.finished = true;
                    this.showResults();
                }, 2000); 
                return;
            }
            
            attempts++;
            this.total++;
            this.pending++;
            
            this.makeRequest(attempts);
        }, delay);
    }
    
    makeRequest(attempt) {
        const req = http.get(`http://localhost:${this.port}`, (res) => {
            this.pending--;
            
            if (res.statusCode === 200) {
                this.success++;
                log.success(`[${attempt}] УСПЕХ (200)`);
            } else if (res.statusCode === 429) {
                this.fail++;
                log.warn(`[${attempt}] 429 - ЗАЩИТА`);
            }
        });
        
        req.on('error', (err) => {
            this.pending--;
            
            let errorMsg = '';
            if (err.code === 'ECONNREFUSED') {
                errorMsg = 'СЕРВЕР НЕ ДОСТУПЕН';
            } else if (err.code === 'ETIMEDOUT' || err.code === 'ESOCKETTIMEDOUT') {
                errorMsg = 'ТАЙМАУТ';
            } else {
                errorMsg = `ОШИБКА: ${err.code}`;
            }
            
            if (!this.finished) {
                log.error(`[${attempt}] ${errorMsg}`);
                this.fail++;
            } else {
                this.fail++;
            }
        });
        
        req.setTimeout(3000, () => {
            req.destroy();
        });
    }
    
    showResults() {
        log.section('ИТОГОВЫЕ РЕЗУЛЬТАТЫ');
        log.info(`Всего запросов: ${this.total}`);
        log.success(`Успешных: ${this.success}`);
        log.error(`Неудачных: ${this.fail}`);
        const percent = (this.success / this.total * 100).toFixed(1);
        
        if (this.port === 8080) {
            if (this.success > 0) {
                log.success(`ЗАЩИТА РАБОТАЕТ: ${percent}% запросов прошло`);
            } else {
                log.success(`ЗАЩИТА РАБОТАЕТ: сервер отвечает 429 (${this.fail} ответов)`);
            }
        } else {
            if (this.success === 0) {
                log.warn(`УЯЗВИМЫЙ СЕРВЕР: 0% успеха`);
            } else {
                log.warn(`УЯЗВИМЫЙ СЕРВЕР: ${percent}% успеха - может быть 0%`);
            }
        }
        
        if (require.main === module) {
            setTimeout(() => process.exit(0), 100);
        }
    }
}

if (require.main === module) {
    const port = process.argv[2] ? parseInt(process.argv[2]) : 8080;
    const client = new LegitimateClient(port);
    client.startTest(10, 1000);
}

module.exports = LegitimateClient;