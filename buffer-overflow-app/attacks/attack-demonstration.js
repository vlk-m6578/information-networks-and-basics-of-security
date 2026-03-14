const { spawn } = require('child_process');
const AttackClient = require('../client/attack-client');
const NormalClient = require('../client/normal-client');

class FullDemonstration {
    constructor() {
        this.servers = [];
    }
    
    async startServers() {
        console.log('Starting servers...');
        
        // Start vulnerable server
        this.vulnerableServer = spawn('node', ['server/vulnerable-server.js']);
        this.vulnerableServer.stdout.on('data', (data) => {
            console.log(`[Vulnerable Server]: ${data}`);
        });
        
        // Start protected server
        this.protectedServer = spawn('node', ['server/protected-server.js']);
        this.protectedServer.stdout.on('data', (data) => {
            console.log(`[Protected Server]: ${data}`);
        });
        
        // Wait for servers to start
        await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    async stopServers() {
        console.log('\n🛑 Stopping servers...');
        this.vulnerableServer.kill();
        this.protectedServer.kill();
    }
    
    async runDemonstration() {
        console.log('\n' + '='.repeat(80));
        console.log('COMPREHENSIVE BUFFER OVERFLOW ATTACK DEMONSTRATION');
        console.log('='.repeat(80));
        
        try {
            await this.startServers();
            
            // Part 1: Normal behavior
            console.log('\nPART 1: NORMAL CLIENT BEHAVIOR');
            console.log('-' .repeat(40));
            
            const normalClient = new NormalClient('http://localhost:3001');
            await normalClient.testVariousInputs();
            
            // Part 2: Attack demonstration on vulnerable server
            console.log('\nPART 2: ATTACKING VULNERABLE SERVER');
            console.log('-' .repeat(40));
            
            const attacker = new AttackClient('http://localhost:3000');
            await attacker.runAttackSuite();
            
            // Part 3: Protection demonstration
            console.log('\nPART 3: PROTECTION MECHANISMS IN ACTION');
            console.log('-' .repeat(40));
            
            const protectedAttacker = new AttackClient('http://localhost:3001');
            await protectedAttacker.attemptBypassProtection();
            
            // Part 4: Comparison
            console.log('\nPART 4: COMPARISON SUMMARY');
            console.log('-' .repeat(40));
            
            console.log('\nVULNERABLE SERVER:');
            console.log('Buffer overflow attacks succeed');
            console.log('No input validation');
            console.log('No bounds checking');
            console.log('No rate limiting');
            console.log('Memory corruption possible');
            
            console.log('\nPROTECTED SERVER:');
            console.log('Buffer overflow attacks blocked');
            console.log('Input validation active');
            console.log('Bounds checking enforced');
            console.log('Rate limiting implemented');
            console.log('Shellcode detection active');
            console.log('Null byte filtering');
            console.log('Security headers (Helmet)');
            
            console.log('\n' + '='.repeat(80));
            console.log('DEMONSTRATION COMPLETE');
            console.log('='.repeat(80));
            
        } catch (error) {
            console.error('Demonstration error:', error);
        } finally {
            await this.stopServers();
        }
    }
}

// Run complete demonstration
const demo = new FullDemonstration();
demo.runDemonstration();