const fs = require('fs');
const crypto = require('crypto');

function extendedGcd(a, b) {
  if (b === 0n) {
    return [a, 1n, 0n];
  }

  const [g, x1, y1] = extendedGcd(b, a % b);

  return [g, y1, x1 - (a / b) * y1];
}

function modPow(base, exponent, modulus) {
  let result = 1n;

  base %= modulus;

  while (exponent > 0n) {
    if (exponent % 2n === 1n) {
      result = (result * base) % modulus;
    }

    base = (base * base) % modulus;
    exponent /= 2n;
  }

  return result;
}

function randomBigInt(bits) {
  const bytes = Math.ceil(bits / 8);

  const buffer = crypto.randomBytes(bytes);

  buffer[0] |= 0x80;

  buffer[buffer.length - 1] |= 1;

  return BigInt('0x' + buffer.toString('hex'));
}

function randomBetween(min, max) {
  const range = max - min + 1n;
  const bits = range.toString(2).length;

  while (true) {
    const bytes = Math.ceil(bits / 8);
    const buffer = crypto.randomBytes(bytes);

    let value = BigInt('0x' + buffer.toString('hex'));

    if (value < range) {
      return min + value;
    }
  }
}

function isPrime(n, rounds = 20) {
  if (n < 2n) {
    return false;
  }

  const smallPrimes = [
    2n, 3n, 5n, 7n, 11n, 13n,
    17n, 19n, 23n, 29n, 31n, 37n
  ];

  for (const p of smallPrimes) {
    if (n === p) {
      return true;
    }

    if (n % p === 0n) {
      return false;
    }
  }

  let d = n - 1n;
  let s = 0;

  while (d % 2n === 0n) {
    d /= 2n;
    s++;
  }

  for (let i = 0; i < rounds; i++) {
    const a = randomBetween(2n, n - 2n);

    let x = modPow(a, d, n);

    if (x === 1n || x === n - 1n) {
      continue;
    }

    let probablyPrime = false;

    for (let r = 1; r < s; r++) {
      x = modPow(x, 2n, n);

      if (x === n - 1n) {
        probablyPrime = true;
        break;
      }
    }

    if (!probablyPrime) {
      return false;
    }
  }

  return true;
}

function generatePrime(bits) {
  while (true) {
    let p = randomBigInt(bits);

    const remainder = p % 4n;

    if (remainder !== 3n) {
      p += 3n - remainder;
    }

    if (isPrime(p)) {
      return p;
    }
  }
}

function generateKeys() {
  const p = generatePrime(512);

  let q;

  do {
    q = generatePrime(512);
  } while (q === p);

  const n = p * q;

  fs.writeFileSync(
    'public.key',
    JSON.stringify({
      n: n.toString()
    }, null, 4)
  );

  fs.writeFileSync(
    'private.key',
    JSON.stringify({
      p: p.toString(),
      q: q.toString()
    }, null, 4)
  );

  console.log('Открытый ключ:  public.key');
  console.log('Закрытый ключ: private.key');
  // console.log('Размер n:', n.toString(2).length, 'бит');
}

function bufferToBigInt(buffer) {
  if (buffer.length === 0) {
    return 0n;
  }

  return BigInt('0x' + buffer.toString('hex'));
}

function bigIntToBuffer(value, size) {
  let hex = value.toString(16);

  if (hex.length % 2 !== 0) {
    hex = '0' + hex;
  }

  const buffer = Buffer.from(hex, 'hex');

  if (buffer.length > size) {
    throw new Error('Число слишком большое для блока');
  }

  const result = Buffer.alloc(size);

  buffer.copy(result, size - buffer.length);

  return result;
}

function createBlock(data, blockSize) {
  const block = Buffer.alloc(blockSize);

  block[0] = 0x52;
  block[1] = 0x42;

  block.writeUInt16BE(data.length, 2);

  data.copy(block, 4);

  return block;
}

function checkBlock(block) {
  if (block.length < 4) {
    return false;
  }

  if (block[0] !== 0x52 || block[1] !== 0x42) {
    return false;
  }

  const length = block.readUInt16BE(2);

  if (length > block.length - 4) {
    return false;
  }

  return true;
}

function extractBlockData(block) {
  const length = block.readUInt16BE(2);

  return block.subarray(4, 4 + length);
}

function encrypt(inputFile, outputFile) {
  if (!fs.existsSync('public.key')) {
    throw new Error(
      'Не найден public.key. Сначала выполните: node rabin.js keygen'
    );
  }

  const publicKey = JSON.parse(
    fs.readFileSync('public.key', 'utf8')
  );

  const n = BigInt(publicKey.n);

  const input = fs.readFileSync(inputFile);

  const nBytes = Math.ceil(n.toString(2).length / 8);

  const dataSize = Math.min(nBytes - 5, 65535);

  const blocks = [];

  for (let i = 0; i < input.length; i += dataSize) {
    const part = input.subarray(i, i + dataSize);

    const block = createBlock(part, nBytes - 1);

    const m = bufferToBigInt(block);

    const c = (m * m) % n;

    blocks.push(
      c.toString(16).padStart(nBytes * 2, '0')
    );
  }

  fs.writeFileSync(
    outputFile,
    blocks.join('\n'),
    'utf8'
  );

  console.log('Результат в', outputFile);
}

function decryptBlock(c, p, q, n) {
  const mp = modPow(
    c % p,
    (p + 1n) / 4n,
    p
  );

  const mq = modPow(
    c % q,
    (q + 1n) / 4n,
    q
  );

  const [g, yp, yq] = extendedGcd(p, q);

  if (g !== 1n) {
    throw new Error('p и q должны быть простыми');
  }

  const r = (
    yp * p * mq +
    yq * q * mp
  ) % n;

  const root1 = (r + n) % n;

  const root2 = (n - root1) % n;

  const s = (
    yp * p * mq -
    yq * q * mp
  ) % n;

  const root3 = (s + n) % n;

  const root4 = (n - root3) % n;

  return [
    root1,
    root2,
    root3,
    root4
  ];
}

function decrypt(inputFile, outputFile) {
  if (!fs.existsSync('private.key')) {
    throw new Error(
      'Не найден private.key. Сначала выполните: node rabin.js keygen'
    );
  }

  const privateKey = JSON.parse(
    fs.readFileSync('private.key', 'utf8')
  );

  const p = BigInt(privateKey.p);
  const q = BigInt(privateKey.q);
  const n = p * q;

  const encrypted = fs.readFileSync(
    inputFile,
    'utf8'
  ).trim();

  if (!encrypted) {
    fs.writeFileSync(outputFile, '');

    console.log('Результат в', outputFile);

    return;
  }

  const encryptedBlocks = encrypted.split('\n');

  const nBytes = Math.ceil(
    n.toString(2).length / 8
  );

  const result = [];

  console.log('Количество блоков:', encryptedBlocks.length);

  for (let i = 0; i < encryptedBlocks.length; i++) {
    const hex = encryptedBlocks[i].trim();

    const c = BigInt('0x' + hex);

    console.log(`Блок ${i + 1}:`);
    console.log(`  Шифротекст c: ${hex}`);

    const roots = decryptBlock(
      c,
      p,
      q,
      n
    );

    let found = null;
    let foundNumber = 0;

    const maxBlockValue =
      1n << BigInt(8 * (nBytes - 1));

    for (let j = 0; j < roots.length; j++) {
      const root = roots[j];

      console.log(
        `    Корень ${j + 1}: ${root.toString(16)}`
      );

      if (root >= maxBlockValue) {
        continue;
      }

      const block = bigIntToBuffer(
        root,
        nBytes - 1
      );

      if (checkBlock(block)) {
        found = extractBlockData(block);
        foundNumber = j + 1;
      }
    }

    if (found === null) {
      throw new Error(
        `Не удалось определить исходный текст блока ${i + 1}`
      );
    }

    console.log(
      `  Выбран корень ${foundNumber} - исходное сообщение`
    );

    console.log(
      `  Длина данных: ${found.length} байт`
    );

    console.log('');

    result.push(found);
  }

  fs.writeFileSync(
    outputFile,
    Buffer.concat(result)
  );

  console.log('Результат в', outputFile);
}

function showHelp() {
  console.log(`
Use:

  node rabin.js --help

  node rabin.js keygen

  node rabin.js encrypt <input> <output>

  node rabin.js decrypt <input> <output>

`);
}

function main() {
  const args = process.argv.slice(2);

  if (
    args.length === 0 ||
    args[0] === '--help' ||
    args[0] === '-h'
  ) {
    showHelp();
    return;
  }

  try {
    switch (args[0]) {
      case 'keygen':
        generateKeys();
        break;

      case 'encrypt':
        if (args.length !== 3) {
          console.log(
            'Использование: node rabin.js encrypt <input> <output>'
          );
          return;
        }

        encrypt(args[1], args[2]);
        break;

      case 'decrypt':
        if (args.length !== 3) {
          console.log(
            'Использование: node rabin.js decrypt <input> <output>'
          );
          return;
        }

        decrypt(args[1], args[2]);
        break;

      default:
        console.log('Неизвестная команда.');
        showHelp();
    }
  } catch (error) {
    console.error('Ошибка:', error.message);
  }
}

main();