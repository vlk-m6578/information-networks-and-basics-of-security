const axios = require('axios');
const AttackClient = require('./client/attack-client');

class ProtectedAttackTester {
    constructor() {
        this.protectedServer = 'http://localhost:3001';
        this.attacker = new AttackClient(this.protectedServer);
    }
    
    async testAllAttacks() {
        console.log('\n' + '='.repeat(70));
        console.log('🛡️  TESTING ALL ATTACKS ON PROTECTED SERVER');
        console.log('='.repeat(70));
        
        const attacks = [
            { name: 'BASIC OVERFLOW', type: 'basic', size: 1500 },
            { name: 'SHELLCODE', type: 'shellcode', size: 2000 },
            { name: 'RETURN ADDRESS', type: 'returnAddress', size: 3000 },
        ];
        
        for (const attack of attacks) {
            console.log('\n' + '📌'.repeat(30));
            console.log(`🎯 TEST: ${attack.name}`);
            console.log(`📦 Payload size: ${attack.size} bytes`);
            
            await this.sendAttackToProtected(attack.type, attack.size);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        console.log('\n' + '='.repeat(70));
        console.log('📊 SUMMARY: PROTECTED SERVER RESULTS');
        console.log('='.repeat(70));
    }
    
    async sendAttackToProtected(attackType, size) {
        const payload = this.attacker.generateOverflowPayload(size, attackType);
        
        try {
            const response = await axios.post(
                `${this.protectedServer}/api/protected/process`, 
                payload,
                { headers: { 'Content-Type': 'text/plain' } }
            );
            
            console.log('📥 Response:', response.data);
            
            if (response.data.status === 'error') {
                console.log('🛡️  ATTACK BLOCKED: Input size exceeds buffer limit');
            } else if (response.data.warning) {
                console.log('⚠️  Suspicious pattern detected but request processed');
            } else {
                console.log('✅ Request processed (but was it an attack?)');
            }
            
        } catch (error) {
            if (error.response) {
                console.log('🛡️  ATTACK BLOCKED! Status:', error.response.status);
                if (error.response.status === 413) {
                    console.log('   Reason: Payload too large (body-parser limit)');
                }
            } else {
                console.log('❌ Error:', error.message);
            }
        }
    }
}

// Запуск
const tester = new ProtectedAttackTester();
tester.testAllAttacks();