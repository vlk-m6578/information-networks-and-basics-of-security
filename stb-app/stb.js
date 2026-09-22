const fs = require('fs');

const H = [
    0xB1, 0x94, 0xBA, 0xC8, 0x0A, 0x8B, 0xF5, 0x3B,
    0x36, 0x60, 0x00, 0xBE, 0x68, 0x4A, 0x5D, 0xEA,

    0xB5, 0x64, 0xFA, 0x90, 0x1B, 0xB6, 0xC7, 0xAC,
    0x25, 0x2E, 0x72, 0xC2, 0x02, 0xFD, 0xC2, 0x00,

    0xBB, 0xE4, 0xD6, 0x12, 0x17, 0xB0, 0x61, 0x31,
    0xFE, 0x47, 0xD0, 0x06, 0x48, 0xAB, 0x71, 0x8D,

    0x4C, 0xD3, 0xF9, 0xC0, 0x33, 0xC3, 0x56, 0xB8,
    0x35, 0xC4, 0x05, 0xAE, 0xD8, 0xE0, 0x7F, 0x99,

    0xE1, 0x2B, 0xDC, 0x1A, 0xE2, 0x82, 0x57, 0xEC,
    0x70, 0x3F, 0xCC, 0xF0, 0x95, 0xEE, 0x80, 0xF1,

    0xC1, 0xAB, 0x76, 0x38, 0x9F, 0xE6, 0x78, 0xCA,
    0xF7, 0xC8, 0xF8, 0x60, 0xD5, 0xBB, 0x5C, 0x4F,

    0xF3, 0x3C, 0x65, 0x7B, 0x43, 0x7C, 0x39, 0x6A,
    0x69, 0x4E, 0xA7, 0x79, 0x96, 0xB2, 0x3D, 0x31,

    0x3E, 0x98, 0xB6, 0x6E, 0x27, 0xD3, 0xBC, 0xCF,
    0x59, 0x1E, 0x1B, 0x1F, 0x4C, 0x5A, 0xB7, 0x93,

    0xE9, 0xBE, 0xE7, 0x2C, 0x89, 0x0C, 0x6E, 0xA6,
    0x20, 0xCE, 0x49, 0xF4, 0x6F, 0x73, 0x96, 0x47,

    0x06, 0x07, 0x93, 0x1E, 0xB3, 0x24, 0x7A, 0x37,
    0x39, 0xC8, 0xA3, 0x83, 0x03, 0xAD, 0x88, 0xF6,

    0x92, 0x80, 0x9B, 0x1C, 0xE5, 0xD1, 0x41, 0x01,
    0x54, 0x45, 0xFB, 0xC9, 0x6E, 0x40, 0xCE, 0xF2,

    0x68, 0x20, 0x80, 0xAA, 0x22, 0x7D, 0x64, 0x2F,
    0x26, 0x87, 0xF9, 0x34, 0x90, 0x40, 0xE5, 0x11,

    0xBC, 0x32, 0x97, 0x13, 0x43, 0xFC, 0x9A, 0x48,
    0xA0, 0x2A, 0x88, 0x57, 0x19, 0x48, 0xC9, 0xA1,

    0x7E, 0xCD, 0xA4, 0xD9, 0x15, 0x44, 0x4F, 0xBC,
    0xA3, 0x84, 0x50, 0xBF, 0x66, 0xD2, 0xD3, 0x8A,

    0xA2, 0xB7, 0x46, 0x52, 0x42, 0xA8, 0xBF, 0xE3,
    0x69, 0x74, 0xC5, 0x51, 0xE8, 0x23, 0x29, 0x21,

    0xD4, 0x5F, 0xD9, 0xB4, 0x3A, 0x62, 0x28, 0x75,
    0x91, 0x14, 0x10, 0xEA, 0x77, 0x6C, 0xDA, 0x1D
];

function add32(a, b) {
    return (a + b) >>> 0;
}

function sub32(a, b) {
    return (a - b) >>> 0;
}

function rotl32(x, n) {
    return ((x << n) | (x >>> (32 - n))) >>> 0;
}

function H32(x) {
    const b1 = (x >>> 24) & 0xff;
    const b2 = (x >>> 16) & 0xff;
    const b3 = (x >>> 8) & 0xff;
    const b4 = x & 0xff;

    return (
        (H[b1] << 24) |
        (H[b2] << 16) |
        (H[b3] << 8) |
        H[b4]
    ) >>> 0;
}

function G(x, r) {
    return rotl32(H32(x), r);
}

function read32(buf, pos) {
    return buf.readUInt32BE(pos);
}

function write32(buf, pos, value) {
    buf.writeUInt32BE(value >>> 0, pos);
}

function encryptBlock(block, key) {
    let a = read32(block, 0);
    let b = read32(block, 4);
    let c = read32(block, 8);
    let d = read32(block, 12);

    const K = [];

    for (let i = 0; i < 8; i++) {
        K.push(read32(key, i * 4));
    }

    for (let i = 1; i <= 8; i++) {
        const k1 = K[(7 * i - 6 - 1) % 8];
        const k2 = K[(7 * i - 5 - 1) % 8];
        const k3 = K[(7 * i - 4 - 1) % 8];
        const k4 = K[(7 * i - 3 - 1) % 8];
        const k5 = K[(7 * i - 2 - 1) % 8];
        const k6 = K[(7 * i - 1 - 1) % 8];
        const k7 = K[(7 * i - 1) % 8];

        b = (b ^ G(add32(a, k1), 5)) >>> 0;

        c = (c ^ G(add32(d, k2), 21)) >>> 0;

        a = sub32(a, G(add32(b, k3), 13));

        let e = (
            G(
                add32(add32(b, c), k4),
                21
            ) ^ i
        ) >>> 0;

        b = add32(b, e);

        c = sub32(c, e);

        d = add32(d, G(add32(c, k5), 13));

        b = (b ^ G(add32(a, k6), 21)) >>> 0;

        c = (c ^ G(add32(d, k7), 5)) >>> 0;

        [a, b] = [b, a];

        [c, d] = [d, c];

        [b, c] = [c, b];
    }

    const result = Buffer.alloc(16);

    write32(result, 0, b);
    write32(result, 4, d);
    write32(result, 8, a);
    write32(result, 12, c);

    return result;
}

function decryptBlock(block, key) {
    let a = read32(block, 0);
    let b = read32(block, 4);
    let c = read32(block, 8);
    let d = read32(block, 12);

    const K = [];

    for (let i = 0; i < 8; i++) {
        K.push(read32(key, i * 4));
    }

    for (let i = 8; i >= 1; i--) {
        const k1 = K[(7 * i - 1) % 8];
        const k2 = K[(7 * i - 2) % 8];
        const k3 = K[(7 * i - 3) % 8];
        const k4 = K[(7 * i - 4) % 8];
        const k5 = K[(7 * i - 5) % 8];
        const k6 = K[(7 * i - 6) % 8];
        const k7 = K[(7 * i - 7) % 8];

        b = (b ^ G(add32(a, k1), 5)) >>> 0;

        c = (c ^ G(add32(d, k2), 21)) >>> 0;

        a = sub32(a, G(add32(b, k3), 13));

        let e = (
            G(
                add32(add32(b, c), k4),
                21
            ) ^ i
        ) >>> 0;

        b = add32(b, e);

        c = sub32(c, e);

        d = add32(d, G(add32(c, k5), 13));

        b = (b ^ G(add32(a, k6), 21)) >>> 0;

        c = (c ^ G(add32(d, k7), 5)) >>> 0;

        [a, b] = [b, a];

        [c, d] = [d, c];

        [a, d] = [d, a];
    }

    const result = Buffer.alloc(16);

    write32(result, 0, c);
    write32(result, 4, a);
    write32(result, 8, d);
    write32(result, 12, b);

    return result;
}

function encryptSimple(data, key) {
    if (data.length === 0 || data.length % 16 !== 0) {
        throw new Error(
            'Для простого режима размер файла должен быть кратен 16 байтам'
        );
    }

    const result = Buffer.alloc(data.length);

    for (let i = 0; i < data.length; i += 16) {
        const block = data.subarray(i, i + 16);
        const encrypted = encryptBlock(block, key);
        encrypted.copy(result, i);
    }

    return result;
}

function decryptSimple(data, key) {
    if (data.length === 0 || data.length % 16 !== 0) {
        throw new Error(
            'Для простого режима размер файла должен быть кратен 16 байтам'
        );
    }

    const result = Buffer.alloc(data.length);

    for (let i = 0; i < data.length; i += 16) {
        const block = data.subarray(i, i + 16);
        const decrypted = decryptBlock(block, key);
        decrypted.copy(result, i);
    }

    return result;
}

function encryptCFB(data, key, iv) {
    const result = Buffer.alloc(data.length);

    let previous = Buffer.from(iv);

    for (let i = 0; i < data.length; i += 16) {
        const encrypted = encryptBlock(previous, key);

        const length = Math.min(16, data.length - i);

        for (let j = 0; j < length; j++) {
            result[i + j] = data[i + j] ^ encrypted[j];
        }

        if (length === 16) {
            previous = result.subarray(i, i + 16);
        }
    }

    return result;
}

function decryptCFB(data, key, iv) {
    const result = Buffer.alloc(data.length);

    let previous = Buffer.from(iv);

    for (let i = 0; i < data.length; i += 16) {
        const encrypted = encryptBlock(previous, key);

        const length = Math.min(16, data.length - i);

        for (let j = 0; j < length; j++) {
            result[i + j] = data[i + j] ^ encrypted[j];
        }

        if (length === 16) {
            previous = data.subarray(i, i + 16);
        }
    }

    return result;
}

function printHelp() {
    console.log(`

Use:

  node stb.js --mode simple --action encrypt --in input.txt --out output.bin --key KEY
  node stb.js --mode simple --action decrypt --in input.bin --out output.txt --key KEY

  node stb.js --mode cfb --action encrypt --in input.txt --out output.bin --key KEY --iv IV
  node stb.js --mode cfb --action decrypt --in output.bin --out output.txt --key KEY --iv IV

  --key        256

  --iv         128

Key example:

  00112233445566778899aabbccddeeff
  00112233445566778899aabbccddeeff

IV example:

  000102030405060708090a0b0c0d0e0f
`);
}

function getArg(name) {
    const index = process.argv.indexOf(name);

    if (index === -1) {
        return null;
    }

    return process.argv[index + 1];
}

function hexToBuffer(value, size, name) {
    if (!value) {
        throw new Error(`Не указан параметр ${name}`);
    }

    if (!/^[0-9a-fA-F]+$/.test(value)) {
        throw new Error(`${name} должен содержать только HEX-символы`);
    }

    if (value.length !== size * 2) {
        throw new Error(
            `${name} должен иметь размер ${size} байт (${size * 2} HEX-символов)`
        );
    }

    return Buffer.from(value, 'hex');
}

function main() {
    if (process.argv.includes('--help') || process.argv.length === 2) {
        printHelp();
        return;
    }

    const mode = getArg('--mode');
    const action = getArg('--action');
    const inputFile = getArg('--in');
    const outputFile = getArg('--out');
    const keyText = getArg('--key');
    const ivText = getArg('--iv');

    if (mode !== 'simple' && mode !== 'cfb') {
        throw new Error(
            'Параметр --mode должен быть simple или cfb'
        );
    }

    if (action !== 'encrypt' && action !== 'decrypt') {
        throw new Error(
            'Параметр --action должен быть encrypt или decrypt'
        );
    }

    if (!inputFile) {
        throw new Error('Не указан входной файл --in');
    }

    if (!outputFile) {
        throw new Error('Не указан выходной файл --out');
    }

    const key = hexToBuffer(keyText, 32, '--key');

    let iv = null;

    if (mode === 'cfb') {
        iv = hexToBuffer(ivText, 16, '--iv');
    }

    const data = fs.readFileSync(inputFile);

    let result;

    if (mode === 'simple') {
        if (action === 'encrypt') {
            result = encryptSimple(data, key);
        } else {
            result = decryptSimple(data, key);
        }
    } else {
        if (action === 'encrypt') {
            result = encryptCFB(data, key, iv);
        } else {
            result = decryptCFB(data, key, iv);
        }
    }

    fs.writeFileSync(outputFile, result);

    console.log('Done.');
    console.log(`mode: ${mode}`);
    console.log(`action: ${action}`);
    console.log(`input: ${inputFile}`);
    console.log(`output: ${outputFile}`);
    console.log(`size: ${result.length} bytes`);
}

try {
    main();
} catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
}