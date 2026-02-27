const http = require('http');
const log = require('../utils/logger');

class LegitimateClient {
    constructor(serverPort = 8080, serverHost = 'localhost') {
        this.serverPort = serverPort;
        this.serverHost = serverHost;
        this.stats = {
            successful: 0,
            failed: 0,
            total: 0
        };
    }
    
    makeRequest(id = 1) {
        this.stats.total++;
        
        const options = {
            hostname: this.serverHost,
            port: this.serverPort,
            path: '/',
            method: 'GET',
            timeout: 5000
        };
        
        const req = http.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                if (res.statusCode === 200) {
                    this.stats.successful++;
                    log.success(`[Клиент ${id}] УСПЕХ: Статус ${res.statusCode}`);
                } else {
                    this.stats.failed++;
                    log.warn(`[Клиент ${id}] Ошибка: Статус ${res.statusCode}`);
                }
            });
        });
        
        req.on('error', (err) => {
            this.stats.failed++;
            if (err.code === 'ECONNREFUSED') {
                log.error(`[Клиент ${id}] Сервер недоступен`);
            } else if (err.code === 'ETIMEDOUT') {
                log.error(`[Клиент ${id}] Таймаут - сервер перегружен`);
            } else {
                log.error(`[Клиент ${id}] Ошибка: ${err.message}`);
            }
        });
        
        req.setTimeout(5000, () => {
            req.destroy();
            log.error(`[Клиент ${id}] Таймаут запроса`);
        });
        
        req.end();
        
        return this.stats;
    }
    
    startTest(duration = 10000, interval = 1000) {
        log.section('ЗАПУСК ЛЕГАЛЬНОГО КЛИЕНТА');
        log.info(`Будет выполнено ${duration/interval} запросов с интервалом ${interval}мс`);
        
        let counter = 0;
        const testInterval = setInterval(() => {
            counter++;
            this.makeRequest(counter);
        }, interval);
        
        setTimeout(() => {
            clearInterval(testInterval);
            this.showResults();
        }, duration);
    }
    
    showResults() {
        log.section('РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ');
        log.info(`Всего запросов: ${this.stats.total}`);
        log.success(`Успешных: ${this.stats.successful}`);
        log.error(`Неудачных: ${this.stats.failed}`);
        
        const successRate = (this.stats.successful / this.stats.total * 100).toFixed(1);
        log.info(`Процент успеха: ${successRate}%`);
    }
}

if (require.main === module) {
    const client = new LegitimateClient(8080);
    client.startTest(10000, 1000); 
}

module.exports = LegitimateClient;