const crypto = require('crypto');

class AttackManager {
  constructor(as, tgs, fileService) {
    this.as = as;
    this.tgs = tgs;
    this.fileService = fileService;
    this.attackLog = [];
  }

  // ============= 1. REPLAY ATTACK - РАБОТАЕТ =============
  async demonstrateReplayAttack(authenticator, ticket) {
    await new Promise(resolve => setTimeout(resolve, 10000));

    try {
      const response = await this.fileService.accessFiles(ticket, authenticator);

      return {
        success: response.success,
        protected: !response.success,
        message: response.success
          ? '❌ VULNERABLE: Replay attack succeeded!'
          : '✅ PROTECTED: Replay attack blocked - timestamp expired'
      };
    } catch (error) {
      return {
        success: false,
        protected: true,
        message: '✅ PROTECTED: Replay attack blocked'
      };
    }
  }

  // ============= 2. TGT THEFT ATTACK - 100% РАБОТАЕТ =============
  // Атака: злоумышленник украл TGT ID и пытается использовать
  async demonstrateTGTTheftAttack(stolenTGTId, serviceName = 'files') {
    const result = {
      attack: 'TGT Theft Attack',
      success: false,
      protected: true,
      message: ''
    };

    try {
      // Пытаемся получить сервисный билет с украденным TGT
      const serviceTicket = await this.tgs.requestServiceTicket(stolenTGTId, serviceName);

      if (serviceTicket) {
        result.success = true;
        result.protected = false;
        result.message = '❌ VULNERABLE: TGT theft succeeded! Attacker got service ticket!';
      }
    } catch (error) {
      // TGS должен отклонить запрос - TGT привязан к конкретному клиенту
      result.success = false;
      result.protected = true;
      result.message = '✅ PROTECTED: TGT theft blocked - invalid authenticator';
    }

    return result;
  }

  getAttackLog() {
    return this.attackLog;
  }
}

module.exports = AttackManager;