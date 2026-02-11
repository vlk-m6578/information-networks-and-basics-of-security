const crypto = require("crypto");
const { userInfo } = require("os");

class TicketGrantingServer {
  constructor(as) {
    this.as = as;

    this.serviceKeys = {
      'files': crypto.randomBytes(32),
      'email': crypto.randomBytes(32),
      'print': crypto.randomBytes(32)
    };

    this.issuedServiceTickets = {};
  }

  requestServiceTicket(tgtId, serviceName) {
    const tgtValidation = this.as.validateTGT(tgtId);

    if (!tgtValidation.valid) throw new Error(`Invalid TGT: ${tgtValidation.reason}`);

    if (!this.serviceKeys[serviceName]) throw new Error(`Service "${serviceName}" not available`);

    const serviceSessionKey = crypto.randomBytes(32).toString('hex');
    console.log(`TGS: Create a key for service: ${serviceSessionKey.substring(0, 16)}...`);

    const serviceTicket = this.generateServiceTicket(
      tgtValidation.username,
      serviceName,
      serviceSessionKey,
      tgtValidation.sessionkey
    );

    this.issuedServiceTickets[serviceTicket.id] = {
      username: tgtValidation.username,
      serviceName: serviceName,
      issuedAt: new Date(),
      serviceSessionKey: serviceSessionKey
    };

    console.log(`TGS: ticket ID: ${serviceTicket.id.substring(0, 16)}...`);

    return {
      serviceTicket: {
        encrypted: serviceTicket.encrypted,
        id: serviceTicket.id,
        expiresAt: serviceTicket.expiresAt
      },
      serviceSessionKey: serviceSessionKey,
      serviceName: serviceName,
      expiresAt: serviceTicket.expiresAt
    };
  }

  generateServiceTicket(username, serviceName, serviceSessionKey, clientSessionKey) {
    const ticketData = {
      id: crypto.randomBytes(16).toString('hex'), 
      username: username,
      serviceName: serviceName,
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 300000).toISOString(), 
      serviceSessionKey: serviceSessionKey
    };

    const serviceKey = this.serviceKeys[serviceName];

    const encryptedTicket = this.encrypt(
      JSON.stringify(ticketData),
      serviceKey
    );

    return {
      encrypted: encryptedTicket,
      id: ticketData.id,
      expiresAt: ticketData.expiresAt
    };
  }

  encrypt(text, key) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  validateServiceTicket(encryptedTicket, serviceName) {
    try {
      const serviceKey = this.serviceKeys[serviceName];
      if (!serviceKey) {
        console.log(`TGS: Unknown service: ${serviceName}`);
        return { valid: false, reason: 'Unknown service' };
      }

      const parts = encryptedTicket.split(':');
      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];

      const decipher = crypto.createDecipheriv('aes-256-cbc', serviceKey, iv);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      const ticketData = JSON.parse(decrypted);

      const expiresAt = new Date(ticketData.expiresAt);
      if (new Date() > expiresAt) {
        console.log(`TGS: The ticket is expired`);
        return { valid: false, reason: 'Ticket expired' };
      }

      console.log(`TGS: The ticket is valid for ${ticketData.username}`);

      return {
        valid: true,
        username: ticketData.username,
        serviceName: ticketData.serviceName,
        serviceSessionKey: ticketData.serviceSessionKey,
        ticketId: ticketData.id
      };

    } catch (error) {
      console.log(`TGS: Check ticket error: ${error.message}`);
      return { valid: false, reason: 'Invalid ticket' };
    }
  }

}

module.exports = TicketGrantingServer;