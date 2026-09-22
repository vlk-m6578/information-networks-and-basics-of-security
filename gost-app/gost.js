'use strict';

const fs = require('fs');

const BLOCK_SIZE = 8;
const C1 = 0x01010104;
const C2 = 0x01010101;
const SBOX = [
  [4, 10, 9, 2, 13, 8, 0, 14, 6, 11, 1, 12, 7, 15, 5, 3],
  [14, 11, 4, 12, 6, 13, 15, 10, 2, 3, 8, 1, 0, 7, 5, 9],
  [5, 8, 1, 13, 10, 3, 4, 2, 14, 15, 12, 7, 6, 0, 9, 11],
  [7, 13, 10, 1, 0, 8, 9, 15, 14, 4, 6, 12, 11, 2, 5, 3],
  [6, 12, 7, 1, 5, 15, 13, 8, 4, 10, 9, 14, 0, 3, 11, 2],
  [4, 11, 10, 0, 7, 2, 1, 13, 3, 6, 8, 5, 9, 12, 15, 14],
  [13, 11, 4, 1, 3, 15, 5, 9, 0, 10, 14, 7, 6, 8, 2, 12],
  [1, 15, 13, 0, 5, 7, 10, 4, 9, 2, 3, 14, 6, 11, 8, 12]
];

const ENC_KEYS = [
  0, 1, 2, 3, 4, 5, 6, 7,
  0, 1, 2, 3, 4, 5, 6, 7,
  0, 1, 2, 3, 4, 5, 6, 7,
  7, 6, 5, 4, 3, 2, 1, 0
];

const DEC_KEYS = [
  0, 1, 2, 3, 4, 5, 6, 7,
  7, 6, 5, 4, 3, 2, 1, 0,
  7, 6, 5, 4, 3, 2, 1, 0,
  7, 6, 5, 4, 3, 2, 1, 0
];

function rotateLeft32(value, bits) {
  return ((value << bits) | (value >>> (32 - bits))) >>> 0;
}

function parseHex(value, byteLength, name) {
  if (typeof value !== 'string' || value.length !== byteLength * 2 || !/^[0-9a-fA-F]+$/.test(value)) {
    throw new Error(`${name} must contain exactly ${byteLength * 2} hexadecimal characters`);
  }
  return Buffer.from(value, 'hex');
}

function addMod32Minus1(a, b) {
  const sum = a + b;
  let result = sum % 0xFFFFFFFF;
  if (result === 0 && sum !== 0) result = 0xFFFFFFFF;
  return result >>> 0;
}

class Gost28147 {
  constructor(key) {
    this.key = new Array(8);
    for (let i = 0; i < 8; i++) {
      this.key[i] = key.readUInt32LE(i * 4);
    }
  }

  substitute(value) {
    let result = 0;
    for (let i = 0; i < 8; i++) {
      const nibble = (value >>> (4 * i)) & 0x0F;
      result |= SBOX[i][nibble] << (4 * i);
    }
    return result >>> 0;
  }

  round(left, right, keyIndex) {
    const x = (left + this.key[keyIndex]) >>> 0;
    const y = rotateLeft32(this.substitute(x), 11);
    return [(y ^ right) >>> 0, left >>> 0];
  }

  transform(block, sequence) {
    let left = block.readUInt32LE(0);
    let right = block.readUInt32LE(4);

    for (let i = 0; i < 31; i++) {
      [left, right] = this.round(left, right, sequence[i]);
    }

    right = this.round(left, right, sequence[31])[0];

    const result = Buffer.alloc(BLOCK_SIZE);
    result.writeUInt32LE(left >>> 0, 0);
    result.writeUInt32LE(right >>> 0, 4);
    return result;
  }

  encryptBlock(block) {
    if (block.length !== BLOCK_SIZE) throw new Error('Invalid block length');
    return this.transform(block, ENC_KEYS);
  }

  decryptBlock(block) {
    if (block.length !== BLOCK_SIZE) throw new Error('Invalid block length');
    return this.transform(block, DEC_KEYS);
  }

  macBlock(block) {
    let left = block.readUInt32LE(0);
    let right = block.readUInt32LE(4);

    for (let i = 0; i < 16; i++) {
      [left, right] = this.round(left, right, ENC_KEYS[i]);
    }

    const result = Buffer.alloc(BLOCK_SIZE);
    result.writeUInt32LE(left >>> 0, 0);
    result.writeUInt32LE(right >>> 0, 4);
    return result;
  }
}

function xorBlock(a, b) {
  const result = Buffer.alloc(a.length);
  for (let i = 0; i < a.length; i++) result[i] = a[i] ^ b[i];
  return result;
}

function padEcb(data) {
  const padding = BLOCK_SIZE - (data.length % BLOCK_SIZE);
  return Buffer.concat([data, Buffer.alloc(padding, padding)]);
}

function unpadEcb(data) {
  if (data.length === 0 || data.length % BLOCK_SIZE !== 0) {
    throw new Error('Invalid ECB ciphertext length');
  }
  const padding = data[data.length - 1];
  if (padding < 1 || padding > BLOCK_SIZE) throw new Error('Invalid ECB padding');
  for (let i = data.length - padding; i < data.length; i++) {
    if (data[i] !== padding) throw new Error('Invalid ECB padding');
  }
  return data.subarray(0, data.length - padding);
}

function ecbEncrypt(data, cipher) {
  const input = padEcb(data);
  const output = Buffer.alloc(input.length);
  for (let i = 0; i < input.length; i += BLOCK_SIZE) {
    cipher.encryptBlock(input.subarray(i, i + BLOCK_SIZE)).copy(output, i);
  }
  return output;
}

function ecbDecrypt(data, cipher) {
  if (data.length === 0 || data.length % BLOCK_SIZE !== 0) {
    throw new Error('Invalid ECB ciphertext length');
  }
  const output = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i += BLOCK_SIZE) {
    cipher.decryptBlock(data.subarray(i, i + BLOCK_SIZE)).copy(output, i);
  }
  return unpadEcb(output);
}

function generateCounterGamma(data, cipher, iv) {
  let state = cipher.encryptBlock(iv);
  let n3 = state.readUInt32LE(0);
  let n4 = state.readUInt32LE(4);
  const output = Buffer.alloc(data.length);

  for (let offset = 0; offset < data.length; offset += BLOCK_SIZE) {
    n3 = (n3 + C2) >>> 0;
    n4 = addMod32Minus1(n4, C1);

    const counter = Buffer.alloc(BLOCK_SIZE);
    counter.writeUInt32LE(n3, 0);
    counter.writeUInt32LE(n4, 4);

    const gamma = cipher.encryptBlock(counter);
    const length = Math.min(BLOCK_SIZE, data.length - offset);
    for (let i = 0; i < length; i++) {
      output[offset + i] = data[offset + i] ^ gamma[i];
    }
  }

  return output;
}

function cfbEncrypt(data, cipher, iv) {
  let feedback = Buffer.from(iv);
  const output = Buffer.alloc(data.length);

  for (let offset = 0; offset < data.length; offset += BLOCK_SIZE) {
    const gamma = cipher.encryptBlock(feedback);
    const length = Math.min(BLOCK_SIZE, data.length - offset);
    const block = Buffer.alloc(length);

    for (let i = 0; i < length; i++) {
      block[i] = data[offset + i] ^ gamma[i];
      output[offset + i] = block[i];
    }

    feedback = length === BLOCK_SIZE
      ? block
      : Buffer.concat([block, Buffer.alloc(BLOCK_SIZE - length)]);
  }

  return output;
}

function cfbDecrypt(data, cipher, iv) {
  let feedback = Buffer.from(iv);
  const output = Buffer.alloc(data.length);

  for (let offset = 0; offset < data.length; offset += BLOCK_SIZE) {
    const gamma = cipher.encryptBlock(feedback);
    const length = Math.min(BLOCK_SIZE, data.length - offset);
    const ciphertextBlock = data.subarray(offset, offset + length);

    for (let i = 0; i < length; i++) {
      output[offset + i] = ciphertextBlock[i] ^ gamma[i];
    }

    feedback = length === BLOCK_SIZE
      ? Buffer.from(ciphertextBlock)
      : Buffer.concat([ciphertextBlock, Buffer.alloc(BLOCK_SIZE - length)]);
  }

  return output;
}

function generateImit(data, cipher) {
  if (data.length === 0) throw new Error('Input file must not be empty');

  const blockCount = Math.max(2, Math.ceil(data.length / BLOCK_SIZE));
  const padded = Buffer.alloc(blockCount * BLOCK_SIZE);
  data.copy(padded);

  let state = Buffer.alloc(BLOCK_SIZE);

  for (let offset = 0; offset < padded.length; offset += BLOCK_SIZE) {
    state = cipher.macBlock(xorBlock(state, padded.subarray(offset, offset + BLOCK_SIZE)));
  }

  return state.subarray(0, 4);
}

function parseArguments(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (token === '--help' || token === '-h') {
      args.help = true;
      continue;
    }
    if (!token.startsWith('--')) throw new Error(`Unknown argument: ${token}`);
    const name = token.slice(2);
    if (i + 1 >= argv.length || argv[i + 1].startsWith('--')) {
      throw new Error(`Missing value for --${name}`);
    }
    args[name] = argv[++i];
  }
  return args;
}

function printHelp() {
  console.log(`Usage:
  node gost.js encrypt --mode <ecb|cnt|cfb> --in <file> --out <file> --key <64-hex> [--iv <16-hex>]
  node gost.js decrypt --mode <ecb|cnt|cfb> --in <file> --out <file> --key <64-hex> [--iv <16-hex>]
  node gost.js mac --in <file> --out <file> --key <64-hex>

Key: 256 bits
IV: 64 bits, required for CNT and CFB`);
}

function main() {
  const argv = process.argv.slice(2);
  const command = argv[0];

  if (!command || command === '--help' || command === '-h') {
    printHelp();
    return;
  }

  if (!['encrypt', 'decrypt', 'mac'].includes(command)) {
    throw new Error('Command must be encrypt, decrypt or mac');
  }

  const args = parseArguments(argv.slice(1));
  if (args.help) {
    printHelp();
    return;
  }

  if (!args.in || !args.out || !args.key) {
    throw new Error('Required options: --in, --out, --key');
  }

  const key = parseHex(args.key, 32, 'Key');
  const cipher = new Gost28147(key);
  const input = fs.readFileSync(args.in);
  let output;

  if (command === 'mac') {
    output = generateImit(input, cipher);
    fs.writeFileSync(args.out, output);
    console.log(`MAC: ${output.toString('hex').toUpperCase()}`);
    return;
  }

  const mode = String(args.mode || '').toLowerCase();
  if (!['ecb', 'cnt', 'cfb'].includes(mode)) {
    throw new Error('Mode must be ecb, cnt or cfb');
  }

  if ((mode === 'cnt' || mode === 'cfb') && !args.iv) {
    throw new Error('Option --iv is required for CNT and CFB');
  }

  let iv;
  if (mode === 'cnt' || mode === 'cfb') iv = parseHex(args.iv, 8, 'IV');

  if (mode === 'ecb') {
    output = command === 'encrypt'
      ? ecbEncrypt(input, cipher)
      : ecbDecrypt(input, cipher);
  } else if (mode === 'cnt') {
    output = generateCounterGamma(input, cipher, iv);
  } else {
    output = command === 'encrypt'
      ? cfbEncrypt(input, cipher, iv)
      : cfbDecrypt(input, cipher, iv);
  }

  fs.writeFileSync(args.out, output);
  console.log(`Output: ${args.out}`);
}

try {
  main();
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}
