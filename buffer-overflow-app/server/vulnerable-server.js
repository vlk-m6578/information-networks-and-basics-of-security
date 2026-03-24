const express = require('express');
const bodyParser = require('body-parser');
const BufferUtils = require('./server-utils');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.text({ type: 'text/plain', limit: '10mb' })); 

app.post('/api/vulnerable/process', (req, res) => {
    console.log('\n=== VULNERABLE SERVER ENDPOINT HIT ===');
    
    let inputData = req.body;

    if (typeof inputData === 'object') {
        inputData = JSON.stringify(inputData);
    }
    
    try {
        const result = BufferUtils.vulnerableBufferHandler(inputData, 1024);
        
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

app.post('/api/vulnerable/memory-corruption', (req, res) => {
    console.log('\n=== MEMORY CORRUPTION SIMULATION ===');
    
    const data = req.body.data || '';
    const bufferSize = 512;

    if (data.length > bufferSize) {
        console.error('!!! CRITICAL: Buffer overflow detected - corrupting adjacent memory !!!');
        
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

app.listen(PORT, () => {
    console.log(`VULNERABLE SERVER running on http://localhost:${PORT}`);
    console.log('WARNING: This server has NO buffer overflow protection!');
    console.log('\nAvailable vulnerable endpoints:');
    console.log(`- POST http://localhost:${PORT}/api/vulnerable/process`);
    console.log(`- POST http://localhost:${PORT}/api/vulnerable/memory-corruption`);
});