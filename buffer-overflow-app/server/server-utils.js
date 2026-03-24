class BufferUtils {
    static vulnerableBufferHandler(input, bufferSize = 1024) {
        console.log(`[VULNERABLE] Processing input of size: ${input.length} bytes`);
        console.log(`[VULNERABLE] Buffer size limit: ${bufferSize} bytes`);

        if (input.length > bufferSize) {
            console.warn(`[VULNERABLE] BUFFER OVERFLOW DETECTED! Input exceeds buffer size by ${input.length - bufferSize} bytes`);

            const overflowEffect = this.simulateOverflowEffects(input, bufferSize);
            
            return {
                status: 'overflow_detected',
                message: 'Buffer overflow occurred!',
                overflowSize: input.length - bufferSize,
                effects: overflowEffect,
                data: input.substring(0, bufferSize) 
            };
        }
        
        return {
            status: 'success',
            message: 'Data processed safely',
            data: input
        };
    }

    static protectedBufferHandler(input, bufferSize = 1024) {
        console.log(`[PROTECTED] Processing input of size: ${input.length} bytes`);
        console.log(`[PROTECTED] Buffer size limit: ${bufferSize} bytes`);

        if (!input || typeof input !== 'string') {
            throw new Error('Invalid input type');
        }
        
        if (input.length > bufferSize) {
            console.warn(`[PROTECTED] INPUT REJECTED: Size exceeds buffer limit by ${input.length - bufferSize} bytes`);
            
            return {
                status: 'error',
                message: 'Input size exceeds buffer limit',
                maxAllowedSize: bufferSize,
                receivedSize: input.length
            };
        }

        return {
            status: 'success',
            message: 'Data processed safely with bounds checking',
            data: input
        };
    }
    
    static simulateOverflowEffects(input, bufferSize) {
        const effects = [];
        const overflowData = input.substring(bufferSize);

        if (overflowData.includes('0x')) {
            effects.push('Memory address corruption detected');
        }
        if (overflowData.includes('return')) {
            effects.push('Return address overwritten');
        }
        if (overflowData.includes('exec')) {
            effects.push('Arbitrary code execution attempt');
        }
        if (overflowData.includes('shell')) {
            effects.push('Shell code injection detected');
        }

        if (overflowData.length > 100) {
            effects.push('Stack canary value corrupted');
            effects.push('Adjacent variables overwritten');
        }
        
        return effects.length > 0 ? effects : ['Memory corruption in adjacent memory regions'];
    }

    static detectShellcode(input) {
        const shellcodePatterns = [
            /\\x[0-9a-f]{2}/gi, 
            /shell/i,
            /exec/i,
            /bin\/sh/i,
            /system/i,
            /0x[0-9a-f]{8}/i 
        ];
        
        const detected = [];
        shellcodePatterns.forEach(pattern => {
            if (pattern.test(input)) {
                detected.push(`Pattern matched: ${pattern}`);
            }
        });
        
        return detected;
    }
}

module.exports = BufferUtils;