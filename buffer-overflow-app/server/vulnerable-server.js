const express = require('express');
const bodyParser = require('body-parser');
const BufferUtils = require('./server-utils');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.text({ type: 'text/plain', limit: '10mb' })); // No limit - vulnerable!

// Vulnerable endpoint - no input validation
app.post('/api/vulnerable/process', (req, res) => {
    console.log('\n=== VULNERABLE SERVER ENDPOINT HIT ===');
    
    let inputData = req.body;
    
    // Handle different content types
    if (typeof inputData === 'object') {
        inputData = JSON.stringify(inputData);
    }
    
    try {
        // Process without protection
        const result = BufferUtils.vulnerableBufferHandler(inputData, 1024);
        
        // Send response based on result
        if (result.status === 'overflow_detected') {
            res.status(200).json({
                warning: 'Buffer overflow simulated',
                details: result
            });
        } else {
            res.json(result);
        }
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint that simulates memory corruption
app.post('/api/vulnerable/memory-corruption', (req, res) => {
    console.log('\n=== MEMORY CORRUPTION SIMULATION ===');
    
    const data = req.body.data || '';
    const bufferSize = 512;
    
    // Simulate buffer overflow that corrupts adjacent memory
    if (data.length > bufferSize) {
        console.error('!!! CRITICAL: Buffer overflow detected - corrupting adjacent memory !!!');
        
        // Simulate corruption of:
        // 1. Return address
        // 2. Function pointers
        // 3. Adjacent variables
        
        const corruption = {
            returnAddress: '0x7fff0000 corrupted',
            functionPointer: 'redirected to 0xdeadbeef',
            adjacentVariable1: 'admin_privileges set to true',
            adjacentVariable2: 'authentication bypassed',
            stackCanary: 'overwritten'
        };
        
        res.status(200).json({
            status: 'memory_corrupted',
            message: 'Buffer overflow led to memory corruption',
            corruption: corruption,
            https: '//github.com/sultanmurat20/OWLtop_security_lab5.git',      
            exploitSuccess: true
        });
    } else {
        res.json({ status: 'ok', message: 'No corruption' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`VULNERABLE SERVER running on http://localhost:${PORT}`);
    console.log('WARNING: This server has NO buffer overflow protection!');
    console.log('\nAvailable vulnerable endpoints:');
    console.log(`- POST http://localhost:${PORT}/api/vulnerable/process`);
    console.log(`- POST http://localhost:${PORT}/api/vulnerable/memory-corruption`);
});