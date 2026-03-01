const readline = require('readline');
const log = require('../utils/logger');
const ProtectedServer = require('../server/protected-server');
const VulnerableServer = require('../server/vulnerable-server');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let protectedServer = null;
let vulnerableServer = null;

function showMenu() {
    console.log('\n1. Запустить ЗАЩИЩЕННЫЙ сервер (порт 8080)');
    console.log('2. Запустить УЯЗВИМЫЙ сервер (порт 8081)');
    console.log('3. Остановить все');
    console.log('0. Выход\n');
    console.log('Другие запуски:');
    console.log('  SYN Flood: node clients/syn-flood-attacker.js [порт]');
    console.log('  Slowloris: node clients/slowloris-attacker.js [порт]');
    console.log('  Клиент: node clients/legitimate-client.js [порт]\n');
    
    rl.question('Выбор: ', (answer) => {
        switch(answer) {
            case '1':
                if (!protectedServer) {
                    protectedServer = new ProtectedServer(8080);
                    protectedServer.start();
                } else {
                    log.warn('Сервер уже запущен');
                }
                break;
            case '2':
                if (!vulnerableServer) {
                    vulnerableServer = new VulnerableServer(8081);
                    vulnerableServer.start();
                } else {
                    log.warn('Сервер уже запущен');
                }
                break;
            case '3':
                if (protectedServer) {
                    protectedServer.stop();
                    protectedServer = null;
                }
                if (vulnerableServer) {
                    vulnerableServer.stop();
                    vulnerableServer = null;
                }
                log.success('Все серверы остановлены');
                break;
            case '0':
                if (protectedServer) protectedServer.stop();
                if (vulnerableServer) vulnerableServer.stop();
                process.exit();
            default:
                log.warn('Неверный выбор');
        }
        setTimeout(showMenu, 500);
    });
}

console.clear();
showMenu();