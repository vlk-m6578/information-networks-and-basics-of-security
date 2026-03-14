const axios = require('axios');
const AttackClient = require('../client/attack-client');

class ProtectionDemonstration {
    constructor() {
        this.protectedServer = 'http://localhost:3001';
        this.vulnerableServer = 'http://localhost:3000';
    }
    
    async demonstrateProtections() {
        console.log('\n' + '='.repeat(70));
        console.log('BUFFER OVERFLOW PROTECTION MECHANISMS');
        console.log('='.repeat(70));
        
        // Test 1: Size limits
        console.log('\nTEST 1: Input Size Validation');
        console.log('Attempting to send oversized payload...');
        
        try {
            await axios.post(`${this.protectedServer}/api/protected/process`, 
                'A'.repeat(2000), {
                headers: { 'Content-Type': 'text/plain' }
            });
        } catch (error) {
            if (error.response) {
                console.log('Protection active:', error.response.data);
            }
        }
        
        // Test 2: Shellcode detection
        console.log('\nTEST 2: Shellcode Detection');
        const shellcodePayload = '\\x31\\xc0\\x50\\x68//sh\\x68/bin\\x89\\xe3\\x50\\x53\\x89\\xe1\\x99\\xb0\\x0b\\xcd\\x80';
        
        try {
            const response = await axios.post(`${this.protectedServer}/api/protected/process`, 
                shellcodePayload, {
                headers: { 'Content-Type': 'text/plain' }
            });
            console.log('Response with shellcode detection:', response.data);
        } catch (error) {
            if (error.response) {
                console.log('Shellcode blocked:', error.response.data);
            }
        }
        
        // Test 3: Rate limiting
        console.log('\nTEST 3: Rate Limiting');
        console.log('Sending multiple rapid requests...');
        
        for (let i = 0; i < 5; i++) {
            try {
                await axios.post(`${this.protectedServer}/api/protected/process`, 
                    `Request ${i + 1}`, {
                    headers: { 'Content-Type': 'text/plain' }
                });
                console.log(`Request ${i + 1} sent`);
            } catch (error) {
                console.log(`Request ${i + 1} blocked by rate limiter:`, 
                    error.response?.data || error.message);
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Test 4: Null byte protection
        console.log('\nTEST 4: Null Byte Protection');
        try {
            await axios.post(`${this.protectedServer}/api/protected/secure-process`, 
                'test\0exploit', {
                headers: { 'Content-Type': 'text/plain' }
            });
        } catch (error) {
            console.log('Null byte detected and blocked:', error.response?.data);
        }
        
        // Compare with vulnerable server
        console.log('\nCOMPARISON WITH VULNERABLE SERVER:');
        console.log('Testing same attack on vulnerable server...');
        
        const attacker = new AttackClient(this.vulnerableServer);
        await attacker.attemptBufferOverflow('basic', 2000);
    }
    
    async run() {
        await this.demonstrateProtections();
    }
}

// Run demonstration
const demo = new ProtectionDemonstration();
demo.run().catch(console.error);