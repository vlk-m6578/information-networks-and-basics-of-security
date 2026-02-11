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
      ],
      'eva': [
        { name: 'hack.txt', size: '1 KB', modified: '2024-01-15' }
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
        console.log('Invalid ticket:', ticketValidation.reason);
        return {
          success: false,
          message: `Invalid ticket: ${ticketValidation.reason}`
        };
      }

      console.log(`Ticket is valid for ${ticketValidation.username}`);
      console.log(`Service key: ${ticketValidation.serviceSessionKey.substring(0, 16)}...`);

      if (!this.verifyAuthenticator(authenticator, ticketValidation.serviceSessionKey, ticketValidation.username)) {
        return {
          success: false,
          message: 'Invalid authenticator'
        };
      }

      const username = ticketValidation.username;
      const files = this.userFiles[username] || [];

      console.log(`Give ${files.length} files for ${username}`);

      return {
        success: true,
        username: username,
        files: files,
        count: files.length,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('File service error:', error.message);
      return {
        success: false,
        message: `File service error: ${error.message}`
      };
    }
  }

  // Проверка authenticator'а
  verifyAuthenticator(encryptedAuthenticator, serviceSessionKey, expectedUsername) {
    try {
      try {
        const decoded = Buffer.from(encryptedAuthenticator, 'base64').toString('utf8');
        let decrypted = '';
        for (let i = 0; i < decoded.length; i++) {
          const charCode = decoded.charCodeAt(i) ^ serviceSessionKey.charCodeAt(i % serviceSessionKey.length);
          decrypted += String.fromCharCode(charCode);
        }

        const authData = JSON.parse(decrypted);

        if (authData.username !== expectedUsername) {
          console.log(`Authenticator: username mismatch`);
          return false;
        }

        const authTime = new Date(authData.timestamp);
        const now = new Date();
        const diffMinutes = (now - authTime) / (60 * 1000);

        if (diffMinutes > 5) {
          console.log(`Authenticator: too old (${diffMinutes.toFixed(1)} minutes)`);
          return false;
        }

        console.log(`📁 ✅ Authenticator valid! Age: ${diffMinutes.toFixed(1)} minutes`);
        return true;

      } catch (e) {
        console.log(`XOR no work, try base64...`);
      }

      try {
        const decoded = Buffer.from(encryptedAuthenticator, 'base64').toString('utf8');
        const authData = JSON.parse(decoded);

        if (authData.username === expectedUsername) {
          console.log(`Authenticator valid (base64)`);
          return true;
        }
      } catch (e) {
        console.log(`base64 no working`);
      }

      return false;

    } catch (error) {
      console.error('Authenticator check error:', error.message);
      return false;
    }
  }

  static createAuthenticator(username, serviceSessionKey) {
    const authData = {
      username: username,
      timestamp: new Date().toISOString(),
      random: crypto.randomBytes(8).toString('hex')
    };

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      Buffer.from(serviceSessionKey, 'hex'),
      iv
    );

    let encrypted = cipher.update(JSON.stringify(authData), 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return iv.toString('hex') + ':' + encrypted;
  }
}

module.exports = FileService;