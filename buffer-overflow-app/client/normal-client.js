const axios = require('axios');

class NormalClient {
    constructor(serverUrl) {
        this.serverUrl = serverUrl;
    }
    
    async sendNormalRequest(data) {
        try {
            console.log('\nSending normal request...');
            console.log(`Data size: ${data.length} bytes`);
            
            const response = await axios.post(`${this.serverUrl}/api/protected/process`, data, {
                headers: { 'Content-Type': 'text/plain' }
            });
            
            console.log('Response:', response.data);
            return response.data;
            
        } catch (error) {
            if (error.response) {
                console.error('Server error:', error.response.data);
            } else {
                console.error('Request failed:', error.message);
            }
        }
    }
    
    async testVariousInputs() {
        const testCases = [
            'Hello, World!',
            'A'.repeat(500),  
            'B'.repeat(1024), 
            JSON.stringify({ user: 'admin', action: 'login' }),
            'Normal text with no exploit'
        ];
        
        console.log('\n=== TESTING NORMAL INPUTS ===');
        
        for (const test of testCases) {
            console.log('\n' + '='.repeat(50));
            console.log(`Testing: ${test.substring(0, 50)}${test.length > 50 ? '...' : ''}`);
            await this.sendNormalRequest(test);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
}

async function runNormalClient() {
    const client = new NormalClient('http://localhost:3001');
    await client.testVariousInputs();
}

if (require.main === module) {
    runNormalClient();
}

module.exports = NormalClient;