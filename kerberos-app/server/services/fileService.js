const crypto = require('crypto');

class FileService {
  constructor(tgs) {
    this.tgs = tgs;
    this.serviceName = 'files';

    this.userFiles = {
      'alice': [
        { name: 'document1.txt', size: '2.3 KB', modified: '2024-01-15' },
        { name: 'photo.jpg', size: '1.2 MB', modified: '2024-01-14' },
        { name: 'notes.pdf', size: '456 KB', modified: '2024-01-13' }
      ],
      'bob': [
        { name: 'lecture.pptx', size: '3.1 MB', modified: '2024-01-15' },
        { name: 'grades.xlsx', size: '156 KB', modified: '2024-01-12' },
        { name: 'research.pdf', size: '2.8 MB', modified: '2024-01-10' }
      ]
    };
  }

  accessFiles(encryptedTicket, authenticator) {
    try {
      const ticketValidation = this.tgs.validateServiceTicket(
        encryptedTicket,
        this.serviceName
      );

      if (!ticketValidation.valid) {
        return {
          success: false,
          message: `Invalid ticket: ${ticketValidation.reason}`
        };
      }

      const authValidation = this.verifyAuthenticator(
        authenticator,
        ticketValidation.serviceSessionKey,
        ticketValidation.username
      );

      if (!authValidation.valid) {
        return {
          success: false,
          message: `Invalid authenticator: ${authValidation.reason}`
        };
      }

      const username = ticketValidation.username;
      const files = this.userFiles[username] || [];

      return {
        success: true,
        username: username,
        files: files,
        count: files.length
      };

    } catch (error) {
      return {
        success: false,
        message: `File service error: ${error.message}`
      };
    }
  }

  verifyAuthenticator(encryptedAuthenticator, serviceSessionKey, expectedUsername) {
    try {
      const decoded = Buffer.from(encryptedAuthenticator, 'base64').toString('utf8');

      let decrypted = '';
      for (let i = 0; i < decoded.length; i++) {
        const charCode = decoded.charCodeAt(i) ^ serviceSessionKey.charCodeAt(i % serviceSessionKey.length);
        decrypted += String.fromCharCode(charCode);
      }

      const authData = JSON.parse(decrypted);

      if (authData.username !== expectedUsername) {
        return { valid: false, reason: 'Username mismatch' };
      }

      const authTime = new Date(authData.timestamp);
      const now = new Date();
      const diffMinutes = (now - authTime) / (60 * 1000);

      if (diffMinutes > 5) {
        return { valid: false, reason: 'Timestamp expired' };
      }

      return { valid: true };

    } catch (error) {
      return { valid: false, reason: 'Authentication failed' };
    }
  }

  static createAuthenticator(username, serviceSessionKey) {
    const authData = {
      username: username,
      timestamp: new Date().toISOString()
    };

    const jsonStr = JSON.stringify(authData);
    let encrypted = '';
    for (let i = 0; i < jsonStr.length; i++) {
      const charCode = jsonStr.charCodeAt(i) ^ serviceSessionKey.charCodeAt(i % serviceSessionKey.length);
      encrypted += String.fromCharCode(charCode);
    }

    return Buffer.from(encrypted).toString('base64');
  }
}

module.exports = FileService;