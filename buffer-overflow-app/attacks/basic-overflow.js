const axios = require('axios');
const AttackClient = require('../client/attack-client');

class BasicOverflowDemonstration {
    constructor() {
        this.vulnerableServer = 'http://localhost:3000';
        this.attackClient = new AttackClient(this.vulnerableServer);
    }
    
    async demonstrateBasicOverflow() {
        console.log('\n' + '='.repeat(70));
        console.log('BASIC BUFFER OVERFLOW DEMONSTRATION');
        console.log('='.repeat(70));
        
        console.log('\nNormal request (within buffer limits):');
        try {
            const normalResponse = await axios.post(`${this.vulnerableServer}/api/vulnerable/process`, 
                'Normal request within limits', {
                headers: { 'Content-Type': 'text/plain' }
            });
            console.log('Success:', normalResponse.data);
        } catch (error) {
            console.log('Error:', error.message);
        }
        
        console.log('\nBuffer overflow attempt (exceeds buffer):');
        await this.attackClient.attemptBufferOverflow('basic', 2000);
        
        console.log('\nMemory corruption demonstration:');
        try {
            const corruptionResponse = await axios.post(`${this.vulnerableServer}/api/vulnerable/memory-corruption`, {
                data: 'A'.repeat(1000)
            });
            console.log('Memory corruption result:', corruptionResponse.data);
        } catch (error) {
            console.log('Error:', error.message);
        }
        
        console.log('\nEXPLANATION:');
        console.log('- Buffer overflow occurs when input exceeds allocated buffer size');
        console.log('- This can corrupt adjacent memory and lead to arbitrary code execution');
        console.log('- Attackers can overwrite return addresses and execute malicious code');
    }
    
    async run() {
        await this.demonstrateBasicOverflow();
    }
}

// Run demonstration
const demo = new BasicOverflowDemonstration();
demo.run().catch(console.error);