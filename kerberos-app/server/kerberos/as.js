const crypto = require('crypto');

class AuthenticationServer {
  constructor() {
    this.secretKey = crypto.randomBytes(32);
    this.algorithm = 'aes-256-cbc';
    this.issuedTickets = {};
    this.failedLogins = {};
    this.lockedAccounts = {};
    this.lockoutTime = 5 * 60 * 1000;
  }

  authenticate(username, password) {
    if (this.lockedAccounts[username]) {
      throw new Error('Account locked');
    }

    const validUsers = {
      'alice': 'password123',
      'bob': 'qwerty123'
    };

    if (!validUsers[username] || validUsers[username] !== password) {
      this.failedLogins[username] = (this.failedLogins[username] || 0) + 1;

      if (this.failedLogins[username] >= 5) {
        this.lockedAccounts[username] = true;
      }

      throw new Error('Invalid credentials');
    }

    delete this.lockedAccounts[username];

    const tgt = this.generateTGT(username);
    const sessionKey = this.generateSessionKey();

    this.issuedTickets[tgt.id] = {
      username: username,
      issuedAt: new Date(),
      sessionKey: sessionKey
    };

    return { tgt, sessionKey };
  }

  getAccountStatus(username) {
    return {
      locked: !!this.lockedAccounts[username],
      failedAttempts: this.failedLogins[username] || 0
    };
  }

  recordFailedLogin(username) {
    this.failedLogins[username] = (this.failedLogins[username] || 0) + 1;

    if (this.failedLogins[username] >= 5) {
      this.lockedAccounts[username] = Date.now();
    }
  }

  generateTGT(username) {
    const tgtData = {
      id: crypto.randomBytes(16).toString('hex'),
      username: username,
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
    };

    let encryptedTGT = this.encrypt(JSON.stringify(tgtData));

    return {
      encrypted: encryptedTGT,
      id: tgtData.id
    };
  }

  generateSessionKey() {
    return crypto.randomBytes(32).toString('hex');
  }

  encrypt(text) {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(this.algorithm, this.secretKey, iv);
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
      throw new Error('Encryption failed');
    }
  }

  decrypt(encryptedText) {
    try {
      const parts = encryptedText.split(':');
      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];
      const decipher = crypto.createDecipheriv(this.algorithm, this.secretKey, iv);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      throw new Error('Decryption failed');
    }
  }

  validateTGT(tgtId) {
    const ticket = this.issuedTickets[tgtId];
    if (!ticket) return { valid: false, reason: 'TGT not found' };

    const issuedTime = new Date(ticket.issuedAt);
    const currentTime = new Date();
    const minutesDiff = (currentTime - issuedTime) / (60 * 1000);

    if (minutesDiff > 60) return { valid: false, reason: 'TGT expired' };

    return {
      valid: true,
      username: ticket.username,
      sessionKey: ticket.sessionKey
    };
  }
}

const as = new AuthenticationServer();
module.exports = as;