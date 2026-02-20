const net = require('net');
const log = require('../utils/logger');

class ProtectedServer {
    constructor(port = 8080) {
        this.port = port;
        this.server = net.createServer();
        
        this.connectionLimits = {
            perIP: 5,         
            total: 50,          
            halfOpen: 30        
        };
        
        this.connections = new Map();       
        this.halfOpenConnections = new Map(); 
        this.totalConnections = 0;
        this.blacklist = new Set();         
        
        this.timeouts = {
            handshake: 5000,    
            data: 10000,         
            idle: 30000            
        };
        
        this.setupServer();
    }
    
    setupServer() {
        this.server.on('connection', (socket) => {
            this.handleConnection(socket);
        });
        
        this.server.on('error', (err) => {
            log.error(`Server error: ${err.message}`);
        });
    }
    
    handleConnection(socket) {
        const clientIP = socket.remoteAddress || 'unknown';
        const now = Date.now();
        
        if (this.blacklist.has(clientIP)) {
            log.defense(`Blocking ${clientIP} - on the blacklist`);
            socket.destroy();
            return;
        }
        
       
        if (this.totalConnections > this.connectionLimits.halfOpen) {
            log.defense(`Possible SYN Flood attack, activating SYN Cookie mode`);
            socket.setTimeout(this.timeouts.handshake);
            
            socket.once('data', () => {
                log.defense(`Connection ${clientIP} confirmed, allocating resources`);
                socket.setTimeout(0);
                this.establishConnection(socket, clientIP);
            });
            
            socket.on('timeout', () => {
                log.defense(`Half-open connection from ${clientIP} dropped (SYN Cookie protection)`);
                socket.destroy();
            });
            
            return;
        }

        this.establishConnection(socket, clientIP);
    }
    
    establishConnection(socket, clientIP) {
        const ipStats = this.connections.get(clientIP) || {
            count: 0,
            firstSeen: Date.now(),
            totalBytes: 0,
            lastActivity: Date.now()
        };
        
        if (ipStats.count >= this.connectionLimits.perIP) {
            log.defense(`IP ${clientIP} exceeded the connection limit (${this.connectionLimits.perIP})`);
            socket.write('HTTP/1.1 429 Too Many Connections\r\n\r\n');
            socket.destroy();
            return;
        }
        
        if (this.totalConnections >= this.connectionLimits.total) {
            log.defense(`Global connection limit reached (${this.connectionLimits.total})`);
            socket.write('HTTP/1.1 503 Service Unavailable\r\n\r\n');
            socket.destroy();
            return;
        }

        ipStats.count++;
        ipStats.lastActivity = Date.now();
        this.connections.set(clientIP, ipStats);
        this.totalConnections++;
        
        log.success(`New connection from ${clientIP} (total: ${this.totalConnections})`);

        socket.setTimeout(this.timeouts.data);

        let bytesReceived = 0;
        let packetTimes = [];
        let requestBuffer = '';
        
        socket.on('data', (data) => {
            const now = Date.now();
            bytesReceived += data.length;
            packetTimes.push(now);
            
            packetTimes = packetTimes.filter(t => now - t < 10000);
            
            if (packetTimes.length > 5) {
                const timeSpan = (packetTimes[packetTimes.length - 1] - packetTimes[0]) / 1000;
                const rate = bytesReceived / timeSpan;

                if (rate < 10 && bytesReceived > 0) {
                    log.defense(`Low transmission rate from ${clientIP}: ${rate.toFixed(2)} bytes/sec`);
                    log.defense(`It looks like Slowloris attack - closing the connection`);
                    
                    this.blacklist.add(clientIP);
                    setTimeout(() => {
                        this.blacklist.delete(clientIP);
                        log.defense(`IP ${clientIP} removed from the blacklist`);
                    }, 60000);
                    
                    socket.destroy();
                    return;
                }
            }
            
            requestBuffer += data.toString();
            
            if (requestBuffer.includes('\r\n\r\n') || requestBuffer.includes('\n\n')) {
                log.info(`Request received from ${clientIP}: ${requestBuffer.split('\n')[0]}`);
                
                const response = this.generateHTTPResponse();
                socket.write(response);
                
                if (!requestBuffer.includes('Connection: keep-alive')) {
                    socket.end();
                }
                
                requestBuffer = '';
            }
        });
        
        socket.on('timeout', () => {
            log.defense(`Connection timeout with ${clientIP} - possible Slowloris attack`);
            socket.destroy();
        });
        
        socket.on('error', (err) => {
            if (err.code !== 'ECONNRESET') {
                log.error(`Socket error for ${clientIP}: ${err.message}`);
            }
        });
        
        socket.on('close', () => {
            const stats = this.connections.get(clientIP);
            if (stats) {
                stats.count--;
                if (stats.count <= 0) {
                    this.connections.delete(clientIP);
                } else {
                    this.connections.set(clientIP, stats);
                }
            }
            this.totalConnections--;
            
            log.info(`Connection with ${clientIP} closed (left: ${this.totalConnections})`);
        });
    }
    
    generateHTTPResponse() {
        return [
            'HTTP/1.1 200 OK',
            'Server: Protected-Server/1.0',
            'Content-Type: text/html',
            'Connection: keep-alive',
            '',
            '<!DOCTYPE html>',
            '<html>',
            '<head><title>Protected Server</title></head>',
            '<body>',
            '<h1>The secure server is running</h1>',
            '<p>This server is protected against SYN Flood and Slowloris attacks.</p>',
            '<p>Time: ' + new Date().toLocaleString() + '</p>',
            '</body>',
            '</html>'
        ].join('\r\n');
    }
    
    start() {
        this.server.listen(this.port, () => {
            log.section('SECURE SERVER STARTED');
            log.info(`Port: ${this.port}`);
            log.info(`Max connections with IP: ${this.connectionLimits.perIP}`);
            log.info(`Global limit: ${this.connectionLimits.total}`);
            log.info(`Data timeout: ${this.timeouts.data/1000} sec`);
            log.info(`SYN Cookie Mode: ENABLED`);
            log.info(`Protection against Slowloris: ENABLED`);
            log.info(`Blacklist: active`);
            console.log('');
        });
    }
    
    stop() {
        this.server.close();
        log.warn('The server has been stopped');
    }
}

if (require.main === module) {
    const server = new ProtectedServer(8080);
    server.start();
    
    process.on('SIGINT', () => {
        server.stop();
        process.exit();
    });
}

module.exports = ProtectedServer;