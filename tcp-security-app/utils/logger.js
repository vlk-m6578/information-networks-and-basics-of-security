const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

const log = {
    info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
    success: (msg) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${msg}`),
    warn: (msg) => console.log(`${colors.yellow}[WARN]${colors.reset} ${msg}`),
    error: (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`),
    attack: (msg) => console.log(`${colors.magenta}[ATTACK]${colors.reset} ${msg}`),
    defense: (msg) => console.log(`${colors.cyan}[DEFENSE]${colors.reset} ${msg}`),

    section: (title) => {
        console.log('\n' + '='.repeat(60));
        console.log(`${colors.green}${title}${colors.reset}`);
        console.log('='.repeat(60));
    }
};

module.exports = log;