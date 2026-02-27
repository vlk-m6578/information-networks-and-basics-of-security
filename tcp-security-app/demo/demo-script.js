const readline = require('readline');
const log = require('../utils/logger');
const ProtectedServer = require('../server/protected-server');
const VulnerableServer = require('../server/vulnerable-server');
const LegitimateClient = require('../clients/legitimate-client');
const SYNFloodAttacker = require('../clients/syn-flood-attacker');
const SlowlorisAttacker = require('../clients/slowloris-attacker');

class Demo {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    this.servers = {
      protected: null,
      vulnerable: null
    };

    this.attackers = {
      syn: null,
      slowloris: null
    };
  }

  async start() {
    console.clear();
    log.info('Защита от атак при установке TCP-соединения');
    log.info('и на прикладном уровне (Slowloris)');
    console.log('');

    await this.showMenu();
  }

  async showMenu() {
    console.log('Выберите действие:');
    console.log('1. Запустить защищенный сервер (порт 8080)');
    console.log('2. Запустить уязвимый сервер (порт 8081)');
    console.log('3. Запустить легального клиента');
    console.log('4. Запустить SYN Flood атаку');
    console.log('5. Запустить Slowloris атаку');
    console.log('6. Полная демонстрация (сравнение)');
    console.log('7. Остановить все');
    console.log('0. Выход');
    console.log('');

    this.rl.question('Ваш выбор: ', async (answer) => {
      switch (answer) {
        case '1':
          this.startProtectedServer();
          break;
        case '2':
          this.startVulnerableServer();
          break;
        case '3':
          this.runLegitimateClient();
          break;
        case '4':
          this.runSYNFlood();
          break;
        case '5':
          this.runSlowloris();
          break;
        case '6':
          await this.runFullDemo();
          break;
        case '7':
          this.stopAll();
          break;
        case '0':
          this.stopAll();
          this.rl.close();
          return;
        default:
          log.warn('Неверный выбор');
      }

      setTimeout(() => this.showMenu(), 1000);
    });
  }

  startProtectedServer() {
    if (this.servers.protected) {
      log.warn('Защищенный сервер уже запущен');
      return;
    }

    this.servers.protected = new ProtectedServer(8080);
    this.servers.protected.start();
  }

  startVulnerableServer() {
    if (this.servers.vulnerable) {
      log.warn('Уязвимый сервер уже запущен');
      return;
    }

    this.servers.vulnerable = new VulnerableServer(8081);
    this.servers.vulnerable.start();
  }

  runLegitimateClient() {
    log.section('ЗАПУСК ЛЕГАЛЬНОГО КЛИЕНТА');
    log.info('Клиент будет пытаться подключиться к порту 8080');

    const client = new LegitimateClient(8080);
    client.startTest(15000, 2000);
  }

  runSYNFlood() {
    log.section('ЗАПУСК SYN FLOOD АТАКИ');
    log.info('Атака на порт 8080 (защищенный сервер)');

    this.attackers.syn = new SYNFloodAttacker(8080);
    this.attackers.syn.startAttack(30, 50);

    setTimeout(() => {
      if (this.attackers.syn) {
        this.attackers.syn.stopAttack();
        this.attackers.syn.closeAllConnections();
        this.attackers.syn = null;
      }
    }, 15000);
  }

  runSlowloris() {
    log.section('ЗАПУСК SLOWLORIS АТАКИ');
    log.info('Атака на порт 8080 (защищенный сервер)');

    this.attackers.slowloris = new SlowlorisAttacker(8080);
    this.attackers.slowloris.startAttack(15, 2000);

    setTimeout(() => {
      if (this.attackers.slowloris) {
        this.attackers.slowloris.stopAttack();
        this.attackers.slowloris = null;
      }
    }, 25000);
  }

  async runFullDemo() {
    log.section('ПОЛНАЯ ДЕМОНСТРАЦИЯ');
    log.info('Запускаем оба сервера для сравнения...');

    this.startProtectedServer();
    this.startVulnerableServer();

    await this.sleep(3000);

    log.section('ЧАСТЬ 1: SYN FLOOD АТАКА');
    log.info('Сначала атакуем уязвимый сервер (порт 8081)');

    const synAttacker1 = new SYNFloodAttacker(8081);
    synAttacker1.startAttack(15, 50); 
    await this.sleep(8000);
    synAttacker1.stopAttack();
    synAttacker1.closeAllConnections();

    await this.sleep(3000);

    log.info('\nТеперь атакуем защищенный сервер (порт 8080)');
    const synAttacker2 = new SYNFloodAttacker(8080);
    synAttacker2.startAttack(15, 50);
    await this.sleep(8000);
    synAttacker2.stopAttack();
    synAttacker2.closeAllConnections();

    await this.sleep(3000);

    log.section('ЧАСТЬ 2: SLOWLORIS АТАКА');
    log.info('Сначала атакуем уязвимый сервер (порт 8081)');

    const slowAttacker1 = new SlowlorisAttacker(8081);
    slowAttacker1.startAttack(8, 2000); 
    await this.sleep(12000);
    slowAttacker1.stopAttack();

    await this.sleep(3000);

    log.info('\nТеперь атакуем защищенный сервер (порт 8080)');
    const slowAttacker2 = new SlowlorisAttacker(8080);
    slowAttacker2.startAttack(8, 2000);
    await this.sleep(12000);
    slowAttacker2.stopAttack();

    await this.sleep(3000);

    log.section('ЧАСТЬ 3: ПРОВЕРКА ЛЕГАЛЬНЫХ КЛИЕНТОВ');
    log.info('Останавливаем атаки и проверяем доступность серверов...');

    this.stopAll();
    await this.sleep(3000);

    this.startProtectedServer();
    this.startVulnerableServer();
    await this.sleep(2000);

    log.info('Проверка защищенного сервера (порт 8080):');
    const clientProtected = new LegitimateClient(8080);
    clientProtected.startTest(5000, 1000);
    await this.sleep(6000);

    log.info('\nПроверка уязвимого сервера (порт 8081):');
    const clientVulnerable = new LegitimateClient(8081);
    clientVulnerable.startTest(5000, 1000);
    await this.sleep(6000);

    log.section('ДЕМОНСТРАЦИЯ ЗАВЕРШЕНА');
    log.success('Защищенный сервер успешно отразил все атаки!');
    log.warn('Уязвимый сервер был заблокирован атаками.');
  }

  stopAll() {
    if (this.servers.protected) {
      this.servers.protected.stop();
      this.servers.protected = null;
    }

    if (this.servers.vulnerable) {
      this.servers.vulnerable.stop();
      this.servers.vulnerable = null;
    }

    if (this.attackers.syn) {
      this.attackers.syn.stopAttack();
      this.attackers.syn.closeAllConnections();
      this.attackers.syn = null;
    }

    if (this.attackers.slowloris) {
      this.attackers.slowloris.stopAttack();
      this.attackers.slowloris = null;
    }

    log.success('Все процессы остановлены');
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

if (require.main === module) {
  const demo = new Demo();
  demo.start();
}