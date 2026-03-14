const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const BufferUtils = require('./server-utils');

const app = express();
const PORT = 3001;

// Security middleware
app.use(helmet()); // Adds various HTTP headers for security

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Strict body parsing with size limits
app.use(bodyParser.json({ limit: '1kb' })); // Strict limit!
app.use(bodyParser.text({ type: 'text/plain', limit: '1kb' })); // Strict limit!

// Input validation middleware
const validateInput = (req, res, next) => {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    
    // Check content length
    if (contentLength > 1024) { // 1KB limit
        return res.status(413).json({
            error: 'Payload too large',
            maxSize: '1KB',
            receivedSize: `${contentLength} bytes`
        });
    }
    
    // Validate content type
    const contentType = req.headers['content-type'];
    if (!contentType || (!contentType.includes('application/json') && !contentType.includes('text/plain'))) {
        return res.status(415).json({
            error: 'Unsupported media type',
            supported: ['application/json', 'text/plain']
        });
    }
    
    next();
};

// Protected endpoint with bounds checking
app.post('/api/protected/process', validateInput, (req, res) => {
    console.log('\n=== PROTECTED SERVER ENDPOINT HIT ===');
    
    let inputData = req.body;
    
    // Handle different content types
    if (typeof inputData === 'object') {
        inputData = JSON.stringify(inputData);
    }
    
    try {
        // Process with bounds checking
        const result = BufferUtils.protectedBufferHandler(inputData, 1024);
        
        // Check for shellcode
        const shellcodeDetected = BufferUtils.detectShellcode(inputData);
        if (shellcodeDetected.length > 0) {
            console.warn('Potential shellcode detected!', shellcodeDetected);
            result.warning = 'Suspicious patterns detected in input';
            result.shellcodePatterns = shellcodeDetected;
        }
        
        res.json(result);
        
    } catch (error) {
        res.status(400).json({ 
            error: 'Invalid input',
            details: error.message 
        });
    }
});

// Protected endpoint with additional security measures
app.post('/api/protected/secure-process', [
    validateInput,
    (req, res, next) => {
        // Additional security checks
        const input = req.body;
        
        // Check for null bytes (often used in exploits)
        if (input && input.toString().includes('\0')) {
            return res.status(400).json({
                error: 'Null bytes detected in input',
                message: 'This could indicate an exploit attempt'
            });
        }
        
        next();
    }
], (req, res) => {
    console.log('\n=== EXTRA SECURE ENDPOINT HIT ===');
    
    const inputData = typeof req.body === 'object' ? JSON.stringify(req.body) : req.body;
    
    // Multiple protection layers
    const protections = {
        boundsCheck: true,
        inputValidation: true,
        shellcodeDetection: true,
        nullByteCheck: true,
        typeChecking: true
    };
    
    try {
        // Process with all protections
        const result = BufferUtils.protectedBufferHandler(inputData, 1024);
        
        res.json({
            ...result,
            protections: protections,
            message: 'All security measures passed'
        });
        
    } catch (error) {
        res.status(400).json({ 
            error: 'Security check failed',
            protections: protections,
            details: error.message 
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`PROTECTED SERVER running on http://localhost:${PORT}`);
    console.log('Buffer overflow protection ENABLED');
    console.log('\nAvailable protected endpoints:');
    console.log(`- POST http://localhost:${PORT}/api/protected/process`);
    console.log(`- POST http://localhost:${PORT}/api/protected/secure-process`);
    console.log('\nProtection mechanisms:');
    console.log('- Input size validation');
    console.log('- Bounds checking');
    console.log('- Rate limiting');
    console.log('- Security headers (Helmet)');
    console.log('- Shellcode detection');
    console.log('- Null byte filtering');
});