const fs = require("fs");

function xorBytes(a, b) {
  const r = new Uint8Array(a.length);
  for (let i = 0; i < a.length; i++) {
    r[i] = a[i] ^ b[i];
  }
  return r;
}

function add512(a, b) {
  const r = new Uint8Array(64);
  let carry = 0;
  for (let i = 63; i >= 0; i--) {
    const x = a[i] + b[i] + carry;

    r[i] = x & 0xff;
    carry = x >>> 8;
  }
  return r;
}

function reverseBytes(a) {
  const r = new Uint8Array(a.length);
  for (let i = 0; i < a.length; i++) {
    r[i] = a[a.length - 1 - i];
  }
  return r;
}

function hex(bytes) {
  let s = "";
  for (const b of bytes) {
    s += b.toString(16).padStart(2, "0");
  }
  return s;
}

function bytesFromHex(s) {
  const r = new Uint8Array(s.length / 2);
  for (let i = 0; i < r.length; i++) {
    r[i] = parseInt(
      s.slice(i * 2, i * 2 + 2),
      16
    );
  }

  return r;
}

function stringToBytes(s) {
  const out = [];

  for (let i = 0; i < s.length; i++) {
    let c = s.charCodeAt(i);
    if (c >= 0xd800 && c <= 0xdbff) {
      const low = s.charCodeAt(++i);
      c =
        0x10000 +
        ((c - 0xd800) << 10) +
        (low - 0xdc00);
    }

    if (c <= 0x7f) {
      out.push(c);
    }
    else if (c <= 0x7ff) {
      out.push(
        0xc0 | (c >> 6),
        0x80 | (c & 0x3f)
      );
    }
    else if (c <= 0xffff) {
      out.push(
        0xe0 | (c >> 12),
        0x80 | ((c >> 6) & 0x3f),
        0x80 | (c & 0x3f)
      );
    }
    else {
      out.push(
        0xf0 | (c >> 18),
        0x80 | ((c >> 12) & 0x3f),
        0x80 | ((c >> 6) & 0x3f),
        0x80 | (c & 0x3f)
      );
    }
  }

  return new Uint8Array(out);
}

function rotl32(x, n) {
  return (
    (x << n) |
    (x >>> (32 - n))
  ) >>> 0;
}

function sha1(bytes) {
  const bitLength = bytes.length * 8;
  const zeroBytes =
    (64 - ((bytes.length + 9) % 64)) % 64;

  const total =
    bytes.length +
    1 +
    zeroBytes +
    8;
  const m = new Uint8Array(total);

  m.set(bytes);

  m[bytes.length] = 0x80;

  let len = BigInt(bitLength);

  for (let i = 0; i < 8; i++) {
    m[total - 1 - i] =
      Number(len & 0xffn);
    len >>= 8n;
  }

  let h0 = 0x67452301;
  let h1 = 0xefcdab89;
  let h2 = 0x98badcfe;
  let h3 = 0x10325476;
  let h4 = 0xc3d2e1f0;

  for (
    let pos = 0;
    pos < m.length;
    pos += 64
  ) {
    const w = new Uint32Array(80);
    for (let i = 0; i < 16; i++) {
      const p = pos + i * 4;
      w[i] =
        (m[p] << 24) |
        (m[p + 1] << 16) |
        (m[p + 2] << 8) |
        m[p + 3];
    }

    for (let t = 16; t < 80; t++) {

      w[t] = rotl32(
        w[t - 16] ^
        w[t - 14] ^
        w[t - 8] ^
        w[t - 3],
        1
      );
    }

    let A = h0;
    let B = h1;
    let Cc = h2;
    let D = h3;
    let E = h4;

    for (let t = 0; t < 80; t++) {
      let f;
      let K;
      if (t <= 19) {
        f =
          (
            (B & Cc) |
            ((~B) & D)
          ) >>> 0;
        K = 0x5a827999;
      }
      else if (t <= 39) {

        f =
          (B ^ Cc ^ D) >>> 0;

        K = 0x6ed9eba1;
      }
      else if (t <= 59) {
        f =
          (
            (B & Cc) |
            (B & D) |
            (Cc & D)
          ) >>> 0;

        K = 0x8f1bbcdc;
      }
      else {
        f =
          (B ^ Cc ^ D) >>> 0;

        K = 0xca62c1d6;
      }
      const temp =
        (
          rotl32(A, 5) +
          f +
          E +
          w[t] +
          K
        ) >>> 0;

      E = D;
      D = Cc;
      Cc = rotl32(B, 30);
      B = A;
      A = temp;
    }

    h0 = (h0 + A) >>> 0;
    h1 = (h1 + B) >>> 0;
    h2 = (h2 + Cc) >>> 0;
    h3 = (h3 + D) >>> 0;
    h4 = (h4 + E) >>> 0;
  }

  const result = new Uint8Array(20);

  const words = [
    h0,
    h1,
    h2,
    h3,
    h4
  ];

  for (let i = 0; i < 5; i++) {

    result[i * 4] =
      words[i] >>> 24;

    result[i * 4 + 1] =
      words[i] >>> 16;

    result[i * 4 + 2] =
      words[i] >>> 8;

    result[i * 4 + 3] =
      words[i];
  }
  return result;
}

const SBOX = [
  0xFC, 0xEE, 0xDD, 0x11, 0xCF, 0x6E, 0x31, 0x16,
  0xFB, 0xC4, 0xFA, 0xDA, 0x23, 0xC5, 0x04, 0x4D,
  0xE9, 0x77, 0xF0, 0xDB, 0x93, 0x2E, 0x99, 0xBA,
  0x17, 0x36, 0xF1, 0xBB, 0x14, 0xCD, 0x5F, 0xC1,
  0xF9, 0x18, 0x65, 0x5A, 0xE2, 0x5C, 0xEF, 0x21,
  0x81, 0x1C, 0x3C, 0x42, 0x8B, 0x01, 0x8E, 0x4F,
  0x05, 0x84, 0x02, 0xAE, 0xE3, 0x6A, 0x8F, 0xA0,
  0x06, 0x0B, 0xED, 0x98, 0x7F, 0xD4, 0xD3, 0x1F,
  0xEB, 0x34, 0x2C, 0x51, 0xEA, 0xC8, 0x48, 0xAB,
  0xF2, 0x2A, 0x68, 0xA2, 0xFD, 0x3A, 0xCE, 0xCC,
  0xB5, 0x70, 0x0E, 0x56, 0x08, 0x0C, 0x76, 0x12,
  0xBF, 0x72, 0x13, 0x47, 0x9C, 0xB7, 0x5D, 0x87,
  0x15, 0xA1, 0x96, 0x29, 0x10, 0x7B, 0x9A, 0xC7,
  0xF3, 0x91, 0x78, 0x6F, 0x9D, 0x9E, 0xB2, 0xB1,
  0x32, 0x75, 0x19, 0x3D, 0xFF, 0x35, 0x8A, 0x7E,
  0x6D, 0x54, 0xC6, 0x80, 0xC3, 0xBD, 0x0D, 0x57,
  0xDF, 0xF5, 0x24, 0xA9, 0x3E, 0xA8, 0x43, 0xC9,
  0xD7, 0x79, 0xD6, 0xF6, 0x7C, 0x22, 0xB9, 0x03,
  0xE0, 0x0F, 0xEC, 0xDE, 0x7A, 0x94, 0xB0, 0xBC,
  0xDC, 0xE8, 0x28, 0x50, 0x4E, 0x33, 0x0A, 0x4A,
  0xA7, 0x97, 0x60, 0x73, 0x1E, 0x00, 0x62, 0x44,
  0x1A, 0xB8, 0x38, 0x82, 0x64, 0x9F, 0x26, 0x41,
  0xAD, 0x45, 0x46, 0x92, 0x27, 0x5E, 0x55, 0x2F,
  0x8C, 0xA3, 0xA5, 0x7D, 0x69, 0xD5, 0x95, 0x3B,
  0x07, 0x58, 0xB3, 0x40, 0x86, 0xAC, 0x1D, 0xF7,
  0x30, 0x37, 0x6B, 0xE4, 0x88, 0xD9, 0xE7, 0x89,
  0xE1, 0x1B, 0x83, 0x49, 0x4C, 0x3F, 0xF8, 0xFE,
  0x8D, 0x53, 0xAA, 0x90, 0xCA, 0xD8, 0x85, 0x61,
  0x20, 0x71, 0x67, 0xA4, 0x2D, 0x2B, 0x09, 0x5B,
  0xCB, 0x9B, 0x25, 0xD0, 0xBE, 0xE5, 0x6C, 0x52,
  0x59, 0xA6, 0x74, 0xD2, 0xE6, 0xF4, 0xB4, 0xC0,
  0xD1, 0x66, 0xAF, 0xC2, 0x39, 0x4B, 0x63, 0xB6
];

const TAU = [
  0, 8, 16, 24, 32, 40, 48, 56,
  1, 9, 17, 25, 33, 41, 49, 57,
  2, 10, 18, 26, 34, 42, 50, 58,
  3, 11, 19, 27, 35, 43, 51, 59,
  4, 12, 20, 28, 36, 44, 52, 60,
  5, 13, 21, 29, 37, 45, 53, 61,
  6, 14, 22, 30, 38, 46, 54, 62,
  7, 15, 23, 31, 39, 47, 55, 63
];

const A_MATRIX = [
  0x8e20faa72ba0b470n,
  0x47107ddd9b505a38n,
  0xad08b0e0c3282d1cn,
  0xd8045870ef14980en,
  0x6c022c38f90a4c07n,
  0x3601161cf205268dn,
  0x1b8e0b0e798c13c8n,
  0x83478b07b2468764n,
  0xa011d380818e8f40n,
  0x5086e740ce47c920n,
  0x2843fd2067adea10n,
  0x14aff010bdd87508n,
  0x0ad97808d06cb404n,
  0x05e23c0468365a02n,
  0x8c711e02341b2d01n,
  0x46b60f011a83988en,
  0x90dab52a387ae76fn,
  0x486dd4151c3dfdb9n,
  0x24b86a840e90f0d2n,
  0x125c354207487869n,
  0x092e94218d243cban,
  0x8a174a9ec8121e5dn,
  0x4585254f64090fa0n,
  0xaccc9ca9328a8950n,
  0x9d4df05d5f661451n,
  0xc0a878a0a1330aa6n,
  0x60543c50de970553n,
  0x302a1e286fc58ca7n,
  0x18150f14b9ec46ddn,
  0x0c84890ad27623e0n,
  0x0642ca05693b9f70n,
  0x0321658cba93c138n,
  0x86275df09ce8aaa8n,
  0x439da0784e745554n,
  0xafc0503c273aa42an,
  0xd960281e9d1d5215n,
  0xe230140fc0802984n,
  0x71180a8960409a42n,
  0xb60c05ca30204d21n,
  0x5b068c651810a89en,
  0x456c34887a3805b9n,
  0xac361a443d1c8cd2n,
  0x561b0d22900e4669n,
  0x2b838811480723ban,
  0x9bcf4486248d9f5dn,
  0xc3e9224312c8c1a0n,
  0xeffa11af0964ee50n,
  0xf97d86d98a327728n,
  0xe4fa2054a80b329cn,
  0x727d102a548b194en,
  0x39b008152acb8227n,
  0x9258048415eb419dn,
  0x492c024284fbaec0n,
  0xaa16012142f35760n,
  0x550b8e9e21f7a530n,
  0xa48b474f9ef5dc18n,
  0x70a6a56e2440598en,
  0x3853dc371220a247n,
  0x1ca76e95091051adn,
  0x0edd37c48a08a6d8n,
  0x07e095624504536cn,
  0x8d70c431ac02a736n,
  0xc83862965601dd1bn,
  0x641c314b2b8ee083n
];

const C = [

  "b1085bda1ecadae9ebcb2f81c0657c1f2f6a76432e45d016714eb88d7585c4fc4b7ce09192676901a2422a08a460d31505767436cc744d23dd806559f2a64507",

  "6fa3b58aa99d2f1a4fe39d460f70b5d7f3feea720a232b9861d55e0f16b501319ab5176b12d699585cb561c2db0aa7ca55dda21bd7cbcd56e679047021b19bb7",

  "f574dcac2bce2fc70a39fc286a3d843506f15e5f529c1f8bf2ea7514b1297b7bd3e20fe490359eb1c1c93a376062db09c2b6f443867adb31991e96f50aba0ab2",

  "ef1fdfb3e81566d2f948e1a05d71e4dd488e857e335c3c7d9d721cad685e353fa9d72c82ed03d675d8b71333935203be3453eaa193e837f1220cbebc84e3d12e",

  "4bea6bacad4747999a3f410c6ca923637f151c1f1686104a359e35d7800fffbdbfcd1747253af5a3dfff00b723271a167a56a27ea9ea63f5601758fd7c6cfe57",

  "ae4faeae1d3ad3d96fa4c33b7a3039c02d66c4f95142a46c187f9ab49af08ec6cffaa6b71c9ab7b40af21f66c2bec6b6bf71c57236904f35fa68407a46647d6e",

  "f4c70e16eeaac5ec51ac86febf240954399ec6c7e6bf87c9d3473e33197a93c90992abc52d822c3706476983284a05043517454ca23c4af38886564d3a14d493",

  "9b1f5b424d93c9a703e7aa020c6e41414eb7f8719c36de1e89b4443b4ddbc49af4892bcb929b069069d18d2bd1a5c42f36acc2355951a8d9a47f0dd4bf02e71e",

  "378f5a541631229b944c9ad8ec165fde3a7d3a1b258942243cd955b7e00d0984800a440bdbb2ceb17b2b8a9aa6079c540e38dc92cb1f2a607261445183235adb",

  "abbedea680056f52382ae548b2e4f3f38941e71cff8a78db1fffe18a1b3361039fe76702af69334b7a1e6c303b7652f43698fad1153bb6c374b4c7fb98459ced",

  "7bcd9ed0efc889fb3002c6cd635afe94d8fa6bbbebab076120018021148466798a1d71efea48b9caefbacd1d7d476e98dea2594ac06fd85d6bcaa4cd81f32d1b",

  "378ee767f11631bad21380b00449b17acda43c32bcdf1d77f82012d430219f9b5d80ef9d1891cc86e71da4aa88e12852faf417d5d9b21b9948bc924af11bd720"

].map(bytesFromHex);

function S(state) {
  const r = new Uint8Array(64);
  for (let i = 0; i < 64; i++) {
    r[i] = SBOX[state[i]];
  }

  return r;
}

function P(state) {
  const r = new Uint8Array(64);
  for (let i = 0; i < 64; i++) {
    r[i] = state[TAU[i]];
  }

  return r;
}

function L(state) {
  const r = new Uint8Array(64);
  for (let block = 0; block < 8; block++) {
    let x = 0n;
    for (let bit = 0; bit < 64; bit++) {

      const byteIndex =
        block * 8 +
        Math.floor(bit / 8);

      const bitIndex =
        7 - (bit % 8);
      if (
        ((state[byteIndex] >> bitIndex) & 1) !== 0
      ) {
        x ^= A_MATRIX[bit];
      }
    }

    for (let i = 0; i < 8; i++) {
      r[block * 8 + i] =
        Number(
          (x >>
            BigInt(56 - i * 8))
          & 0xffn
        );
    }
  }
  return r;
}

function keySchedule(K, i) {
  K = xorBytes(K, C[i]);
  K = S(K);
  K = P(K);
  K = L(K);
  return K;
}

function E(K, m) {
  let state = xorBytes(K, m);
  for (let i = 0; i < 12; i++) {
    state = S(state);
    state = P(state);
    state = L(state);

    K = keySchedule(K, i);
    state = xorBytes(state, K);
  }
  return state;
}

function g(N, h, m) {
  let K = xorBytes(h, N);
  K = S(K);
  K = P(K);
  K = L(K);
  let t = E(K, m);

  t = xorBytes(t, h);
  const G = xorBytes(t, m);
  return G;
}

function gost2012(input, outputBits) {
  const message = reverseBytes(input);
  let h = new Uint8Array(64);
  let N = new Uint8Array(64);
  let Sigma = new Uint8Array(64);

  if (outputBits === 256) {
    h.fill(1);
  }

  let rest = message.length;

  while (rest >= 64) {

    const start = rest - 64;

    const m =
      message.slice(start, rest);

    h = g(N, h, m);

    const n512 = new Uint8Array(64);

    n512[62] = 0x02;
    n512[63] = 0x00;

    N = add512(N, n512);
    Sigma = add512(Sigma, m);
    rest -= 64;
  }

  const tail =
    message.slice(0, rest);

  const m =
    new Uint8Array(64);

  m[64 - rest - 1] = 1;

  m.set(
    tail,
    64 - rest
  );

  h = g(N, h, m);

  const bitLength =
    new Uint8Array(64);
  let bits =
    BigInt(rest * 8);

  for (let i = 63; i >= 0; i--) {
    bitLength[i] =
      Number(bits & 0xffn);

    bits >>= 8n;
  }


  N = add512(
    N,
    bitLength
  );

  Sigma = add512(
    Sigma,
    m
  );

  const zero =
    new Uint8Array(64);

  h = g(
    zero,
    h,
    N
  );

  h = g(
    zero,
    h,
    Sigma
  );

  let result = h;

  if (outputBits === 256) {

    result =
      h.slice(0, 32);
  }


  return reverseBytes(result);
}

function printHelp() {

  console.log(`

Use:

  node lab5.js --help

  node lab5.js sha1 "message"
  node lab5.js gost256 "message"
  node lab5.js gost512 "message"

  node lab5.js sha1 --file message.txt
  node lab5.js gost256 --file message.txt
  node lab5.js gost512 --file message.txt

`);
}

function readStdin() {

  return fs.readFileSync(0);
}

function main() {

  const args =
    process.argv.slice(2);

  if (
    args.length === 0 ||
    args[0] === "--help" ||
    args[0] === "-h"
  ) {

    printHelp();

    return;
  }
  const algorithm =
    args[0].toLowerCase();

  let data;

  if (args[1] === "--file") {

    if (!args[2]) {

      console.error(
        "Error: after --file need filename."
      );

      process.exit(1);
    }

    try {

      data =
        new Uint8Array(
          fs.readFileSync(args[2])
        );

    }

    catch (e) {

      console.error(
        "File error:",
        args[2]
      );

      process.exit(1);
    }
  }

  else if (args.length >= 2) {
    data =
      stringToBytes(
        args.slice(1).join(" ")
      );
  }

  else {

    data =
      new Uint8Array(
        readStdin()
      );
  }

  let result;


  if (algorithm === "sha1") {

    result =
      sha1(data);
  }


  else if (algorithm === "gost256") {

    result =
      gost2012(
        data,
        256
      );
  }


  else if (algorithm === "gost512") {

    result =
      gost2012(
        data,
        512
      );
  }

  else {

    console.error(
      "Invalid command:",
      args[0]
    );

    console.error(
      "Use: node lab5.js --help"
    );

    process.exit(1);
  }

  console.log(
    hex(result)
  );
}

main();