'use strict';

const M = 4;
const N = 16;
const T = 2;
const FIELD_MODULUS = 0b10011;
const GOPPA_A = 1;
const GOPPA_B = 8;

function randomBit() {
  return Math.random() < 0.5 ? 0 : 1;
}

function randomInt(max) {
  return Math.floor(Math.random() * max);
}

function cloneMatrix(A) {
  return A.map(row => row.slice());
}

function zeroMatrix(rows, cols) {
  return Array.from({ length: rows }, () => Array(cols).fill(0));
}

function identityMatrix(n) {
  const I = zeroMatrix(n, n);
  for (let i = 0; i < n; i++) {
    I[i][i] = 1;
  }
  return I;
}

function randomMatrix(rows, cols) {
  return Array.from(
    { length: rows },
    () => Array.from({ length: cols }, () => randomBit())
  );
}

function matrixMultiply(A, B) {
  const rowsA = A.length;
  const colsA = A[0].length;
  const rowsB = B.length;
  const colsB = B[0].length;

  if (colsA !== rowsB) {
    throw new Error(
      `Несовместимые размеры матриц: ${rowsA}x${colsA} * ${rowsB}x${colsB}`
    );
  }

  const C = zeroMatrix(rowsA, colsB);

  for (let i = 0; i < rowsA; i++) {
    for (let k = 0; k < colsA; k++) {
      if (A[i][k] === 1) {
        for (let j = 0; j < colsB; j++) {
          C[i][j] ^= B[k][j];
        }
      }
    }
  }

  return C;
}

function vectorMatrixMultiply(v, A) {
  if (v.length !== A.length) {
    throw new Error(
      `Размер вектора ${v.length} не соответствует матрице ${A.length}x${A[0].length}`
    );
  }

  const result = Array(A[0].length).fill(0);

  for (let i = 0; i < v.length; i++) {
    if (v[i] === 1) {
      for (let j = 0; j < A[0].length; j++) {
        result[j] ^= A[i][j];
      }
    }
  }

  return result;
}

function xorVectors(a, b) {
  if (a.length !== b.length) {
    throw new Error('Векторы имеют разные размеры');
  }

  return a.map((x, i) => x ^ b[i]);
}

function hammingWeight(v) {
  return v.reduce((sum, x) => sum + x, 0);
}

function inverseMatrix(A) {
  const n = A.length;

  if (n === 0 || A[0].length !== n) {
    throw new Error('Для обращения нужна квадратная матрица');
  }

  const aug = A.map((row, i) => [
    ...row,
    ...identityMatrix(n)[i]
  ]);

  for (let col = 0; col < n; col++) {
    let pivot = -1;

    for (let row = col; row < n; row++) {
      if (aug[row][col] === 1) {
        pivot = row;
        break;
      }
    }

    if (pivot === -1) {
      throw new Error('Матрица вырождена');
    }

    if (pivot !== col) {
      [aug[pivot], aug[col]] = [aug[col], aug[pivot]];
    }

    for (let row = 0; row < n; row++) {
      if (row !== col && aug[row][col] === 1) {
        for (let j = 0; j < 2 * n; j++) {
          aug[row][j] ^= aug[col][j];
        }
      }
    }
  }

  return aug.map(row => row.slice(n));
}

function isInvertible(A) {
  try {
    inverseMatrix(A);
    return true;
  } catch {
    return false;
  }
}

function randomInvertibleMatrix(n) {
  while (true) {
    const S = randomMatrix(n, n);
    if (isInvertible(S)) {
      return S;
    }
  }
}

function randomPermutation(n) {
  const p = Array.from({ length: n }, (_, i) => i);

  for (let i = n - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [p[i], p[j]] = [p[j], p[i]];
  }

  return p;
}

function applyPermutation(v, p) {
  if (v.length !== p.length) {
    throw new Error('Неверный размер перестановки');
  }

  return p.map(index => v[index]);
}

function inversePermutation(p) {
  const inv = Array(p.length);

  for (let i = 0; i < p.length; i++) {
    inv[p[i]] = i;
  }

  return inv;
}

function applyInversePermutation(v, p) {
  return applyPermutation(v, inversePermutation(p));
}

function permutationToMatrix(p) {
  const P = zeroMatrix(p.length, p.length);

  for (let j = 0; j < p.length; j++) {
    P[p[j]][j] = 1;
  }

  return P;
}

function gfAdd(a, b) {
  return a ^ b;
}

function gfMultiply(a, b) {
  let result = 0;
  let aa = a;
  let bb = b;

  while (bb > 0) {
    if (bb & 1) {
      result ^= aa;
    }

    bb >>= 1;
    aa <<= 1;

    if (aa & 0b10000) {
      aa ^= FIELD_MODULUS;
    }
  }

  return result & 0b1111;
}

function gfPower(a, exponent) {
  let result = 1;
  let base = a;

  while (exponent > 0) {
    if (exponent & 1) {
      result = gfMultiply(result, base);
    }

    base = gfMultiply(base, base);
    exponent >>= 1;
  }

  return result;
}

function gfInverse(a) {
  if (a === 0) {
    throw new Error('Нельзя обратить 0 в GF(16)');
  }

  return gfPower(a, 14);
}

function gfDivide(a, b) {
  if (b === 0) {
    throw new Error('Деление на ноль в GF(16)');
  }

  return gfMultiply(a, gfInverse(b));
}

function goppaPolynomial(x) {
  return gfAdd(
    gfAdd(
      gfMultiply(x, x),
      gfMultiply(GOPPA_A, x)
    ),
    GOPPA_B
  );
}

function validateGoppaPolynomial() {
  for (let x = 0; x < N; x++) {
    if (goppaPolynomial(x) === 0) {
      throw new Error(`Полином Гоппы имеет корень x=${x}`);
    }
  }

  return true;
}

function fieldElementToBits(value) {
  const bits = [];

  for (let i = 0; i < M; i++) {
    bits.push((value >> i) & 1);
  }

  return bits;
}

function buildGoppaParityCheckMatrix() {
  validateGoppaPolynomial();

  const H = zeroMatrix(M * T, N);

  for (let i = 0; i < N; i++) {
    const L_i = i;
    const gValue = goppaPolynomial(L_i);
    const gInverse = gfInverse(gValue);

    for (let j = 0; j < T; j++) {
      const power = gfPower(L_i, j);
      const value = gfMultiply(power, gInverse);
      const bits = fieldElementToBits(value);

      for (let b = 0; b < M; b++) {
        H[j * M + b][i] = bits[b];
      }
    }
  }

  return H;
}

function rrefGF2(A) {
  const matrix = cloneMatrix(A);
  const rows = matrix.length;
  const cols = matrix[0].length;
  const pivotColumns = [];
  let pivotRow = 0;

  for (let col = 0; col < cols; col++) {
    let row = pivotRow;

    while (row < rows && matrix[row][col] === 0) {
      row++;
    }

    if (row === rows) {
      continue;
    }

    [matrix[pivotRow], matrix[row]] = [
      matrix[row],
      matrix[pivotRow]
    ];

    for (let r = 0; r < rows; r++) {
      if (r !== pivotRow && matrix[r][col] === 1) {
        for (let c = 0; c < cols; c++) {
          matrix[r][c] ^= matrix[pivotRow][c];
        }
      }
    }

    pivotColumns.push(col);
    pivotRow++;

    if (pivotRow === rows) {
      break;
    }
  }

  return {
    matrix,
    pivotColumns
  };
}

function transpose(A) {
  const rows = A.length;
  const cols = A[0].length;
  const Tm = zeroMatrix(cols, rows);

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      Tm[j][i] = A[i][j];
    }
  }

  return Tm;
}

function nullSpaceGF2(H) {
  const {
    matrix: R,
    pivotColumns
  } = rrefGF2(H);

  const rows = R.length;
  const cols = R[0].length;
  const pivotSet = new Set(pivotColumns);
  const freeColumns = [];

  for (let c = 0; c < cols; c++) {
    if (!pivotSet.has(c)) {
      freeColumns.push(c);
    }
  }

  const basis = [];

  for (const free of freeColumns) {
    const vector = Array(cols).fill(0);
    vector[free] = 1;

    for (let row = 0; row < pivotColumns.length; row++) {
      const pivot = pivotColumns[row];
      vector[pivot] = R[row][free];
    }

    basis.push(vector);
  }

  return basis;
}

function verifyGeneratorAndParityCheck(G, H) {
  const product = matrixMultiply(G, transpose(H));

  for (const row of product) {
    for (const value of row) {
      if (value !== 0) {
        return false;
      }
    }
  }

  return true;
}

function buildGoppaCode() {
  const H = buildGoppaParityCheckMatrix();
  const G = nullSpaceGF2(H);
  const k = G.length;

  if (k === 0) {
    throw new Error('Не удалось получить G');
  }

  if (!verifyGeneratorAndParityCheck(G, H)) {
    throw new Error('Ошибка: G * H^T != 0');
  }

  return {
    G,
    H,
    k
  };
}

function syndrome(H, vector) {
  const result = Array(H.length).fill(0);

  for (let i = 0; i < H.length; i++) {
    let value = 0;

    for (let j = 0; j < H[i].length; j++) {
      value ^= H[i][j] & vector[j];
    }

    result[i] = value;
  }

  return result;
}

function syndromeToString(s) {
  return s.join('');
}

function generateErrorsOfWeight(n, weight) {
  const errors = [];

  function recursive(start, remaining, vector) {
    if (remaining === 0) {
      errors.push(vector.slice());
      return;
    }

    for (let i = start; i <= n - remaining; i++) {
      vector[i] = 1;

      recursive(
        i + 1,
        remaining - 1,
        vector
      );

      vector[i] = 0;
    }
  }

  recursive(0, weight, Array(n).fill(0));

  return errors;
}

function generateAllErrors(n, t) {
  const errors = [];

  for (let weight = 0; weight <= t; weight++) {
    errors.push(...generateErrorsOfWeight(n, weight));
  }

  return errors;
}

function buildSyndromeTable(H, n, t) {
  const table = {};
  const errors = generateAllErrors(n, t);

  for (const error of errors) {
    const s = syndrome(H, error);
    const key = syndromeToString(s);

    if (table[key]) {
      throw new Error(
        `Коллизия синдромов для ошибок веса <= ${t}`
      );
    }

    table[key] = error;
  }

  return table;
}

function decodeWord(H, syndromeTable, received) {
  const s = syndrome(H, received);
  const key = syndromeToString(s);
  const error = syndromeTable[key];

  if (!error) {
    throw new Error(
      'Синдром не найден: количество ошибок превышает допустимое t'
    );
  }

  const corrected = xorVectors(received, error);

  return {
    corrected,
    error,
    syndrome: s
  };
}

function findIndependentColumns(G) {
  const k = G.length;
  const n = G[0].length;
  const selected = [];
  let currentRank = 0;

  for (let col = 0; col < n; col++) {
    const candidate = selected.concat([col]);

    const submatrix = G.map(row =>
      candidate.map(c => row[c])
    );

    const rank = rrefGF2(submatrix).pivotColumns.length;

    if (rank > currentRank) {
      selected.push(col);
      currentRank = rank;
    }

    if (currentRank === k) {
      break;
    }
  }

  if (selected.length !== k) {
    throw new Error('Не удалось найти независимые столбцы G');
  }

  return selected;
}

function selectColumns(G, columns) {
  return G.map(row =>
    columns.map(c => row[c])
  );
}

function recoverMessageFromCodeword(G, codeword) {
  const pivotColumns = findIndependentColumns(G);
  const squareG = selectColumns(G, pivotColumns);
  const squareGInverse = inverseMatrix(squareG);
  const part = pivotColumns.map(index => codeword[index]);

  return vectorMatrixMultiply(part, squareGInverse);
}

function randomError(n, t) {
  const weight = randomInt(t + 1);

  const positions = Array.from(
    { length: n },
    (_, i) => i
  );

  for (let i = n - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [positions[i], positions[j]] = [
      positions[j],
      positions[i]
    ];
  }

  const error = Array(n).fill(0);

  for (let i = 0; i < weight; i++) {
    error[positions[i]] = 1;
  }

  return error;
}

function bufferToBits(buffer) {
  const bits = [];

  for (const byte of buffer) {
    for (let bit = 7; bit >= 0; bit--) {
      bits.push((byte >> bit) & 1);
    }
  }

  return bits;
}

function bitsToBuffer(bits) {
  if (bits.length % 8 !== 0) {
    throw new Error('Количество бит не кратно 8');
  }

  const bytes = Buffer.alloc(bits.length / 8);

  for (let i = 0; i < bytes.length; i++) {
    let value = 0;

    for (let b = 0; b < 8; b++) {
      value = (value << 1) | bits[i * 8 + b];
    }

    bytes[i] = value;
  }

  return bytes;
}

function splitIntoBlocks(bits, k) {
  const blocks = [];

  for (let i = 0; i < bits.length; i += k) {
    const block = bits.slice(i, i + k);

    while (block.length < k) {
      block.push(0);
    }

    blocks.push(block);
  }

  return blocks;
}

function generateKeys() {
  const { G, H, k } = buildGoppaCode();

  console.log(`n=${N}, k=${k}, t=${T}`);

  const S = randomInvertibleMatrix(k);
  const SInverse = inverseMatrix(S);

  const permutation = randomPermutation(N);
  const P = permutationToMatrix(permutation);

  const SG = matrixMultiply(S, G);
  const G1 = matrixMultiply(SG, P);

  if (G1.length !== k) {
    throw new Error('Неверное число строк G1');
  }

  if (G1[0].length !== N) {
    throw new Error('Неверное число столбцов G1');
  }

  const syndromeTable = buildSyndromeTable(H, N, T);

  return {
    publicKey: {
      n: N,
      k,
      t: T,
      m: M,
      G1
    },
    secretKey: {
      n: N,
      k,
      t: T,
      m: M,
      S,
      SInverse,
      G,
      H,
      permutation,
      P
    },
    internal: {
      syndromeTable
    }
  };
}

function encryptBlock(MBlock, publicKey) {
  const codeword = vectorMatrixMultiply(
    MBlock,
    publicKey.G1
  );

  const error = randomError(
    publicKey.n,
    publicKey.t
  );

  const ciphertext = xorVectors(
    codeword,
    error
  );

  return {
    ciphertext,
    error
  };
}

function encryptBuffer(buffer, publicKey) {
  const bits = bufferToBits(buffer);
  const k = publicKey.k;
  const blocks = splitIntoBlocks(bits, k);
  const ciphertextBlocks = [];

  for (const block of blocks) {
    const { ciphertext } = encryptBlock(
      block,
      publicKey
    );

    ciphertextBlocks.push(ciphertext);
  }

  return {
    originalLength: buffer.length,
    blocks: ciphertextBlocks
  };
}

function decryptBlock(
  ciphertext,
  publicKey,
  secretKey,
  syndromeTable
) {
  const afterPermutation = applyInversePermutation(
    ciphertext,
    secretKey.permutation
  );

  const { corrected } = decodeWord(
    secretKey.H,
    syndromeTable,
    afterPermutation
  );

  const M1 = recoverMessageFromCodeword(
    secretKey.G,
    corrected
  );

  return vectorMatrixMultiply(
    M1,
    secretKey.SInverse
  );
}

function decryptCiphertext(
  cipherData,
  publicKey,
  secretKey,
  syndromeTable
) {
  const allBits = [];

  for (const ciphertext of cipherData.blocks) {
    const M = decryptBlock(
      ciphertext,
      publicKey,
      secretKey,
      syndromeTable
    );

    allBits.push(...M);
  }

  const usefulBits = allBits.slice(
    0,
    cipherData.originalLength * 8
  );

  return bitsToBuffer(usefulBits);
}

const fs = require('fs');

function saveJson(filename, object) {
  fs.writeFileSync(
    filename,
    JSON.stringify(object, null, 2),
    'utf8'
  );
}

function loadJson(filename) {
  return JSON.parse(
    fs.readFileSync(filename, 'utf8')
  );
}

function commandGenerate() {
  const { publicKey, secretKey } = generateKeys();

  saveJson('publicKey.json', publicKey);
  saveJson('secretKey.json', secretKey);

  console.log('publicKey.json, secretKey.json');
}

function commandEncrypt(
  publicKeyFile,
  inputFile,
  outputFile
) {
  const publicKey = loadJson(publicKeyFile);
  const input = fs.readFileSync(inputFile);

  console.log(`Input: ${inputFile}`);

  const encrypted = encryptBuffer(
    input,
    publicKey
  );

  saveJson(outputFile, encrypted);

  console.log(
    `Encrypted file: ${outputFile}, count of blocks: ${encrypted.blocks.length}`
  );
}

function commandDecrypt(
  secretKeyFile,
  cipherFile,
  outputFile
) {
  const secretKey = loadJson(secretKeyFile);
  const cipherData = loadJson(cipherFile);

  console.log(`Input: ${cipherFile}`);

  const syndromeTable = buildSyndromeTable(
    secretKey.H,
    secretKey.n,
    secretKey.t
  );

  const publicKey = {
    n: secretKey.n,
    k: secretKey.k,
    t: secretKey.t
  };

  const output = decryptCiphertext(
    cipherData,
    publicKey,
    secretKey,
    syndromeTable
  );

  fs.writeFileSync(outputFile, output);

  console.log(
    `Decrypted file: ${outputFile}, size: ${output.length} bytes`
  );
}

function printHelp() {
  console.log(`
Использование:

  node mceliece.js generate
  node mceliece.js encrypt publicKey.json message.txt cipher.json
  node mceliece.js decrypt secretKey.json cipher.json result.txt
`);
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case 'generate':
        commandGenerate();
        break;

      case 'encrypt':
        if (args.length !== 4) {
          printHelp();
          process.exit(1);
        }

        commandEncrypt(
          args[1],
          args[2],
          args[3]
        );
        break;

      case 'decrypt':
        if (args.length !== 4) {
          printHelp();
          process.exit(1);
        }

        commandDecrypt(
          args[1],
          args[2],
          args[3]
        );
        break;

      default:
        printHelp();
    }
  } catch (error) {
    console.error('ОШИБКА:', error.message);
    process.exit(1);
  }
}

main();