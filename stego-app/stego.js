const fs = require("fs");
const jpeg = require("jpeg-js");

const BLOCK = 8;
const STRENGTH = 40;

function dct(block) {
    const result = Array.from({ length: 8 }, () => Array(8).fill(0));

    for (let u = 0; u < 8; u++) {
        for (let v = 0; v < 8; v++) {
            let sum = 0;

            for (let x = 0; x < 8; x++) {
                for (let y = 0; y < 8; y++) {
                    sum += block[x][y]
                        * Math.cos((2 * x + 1) * u * Math.PI / 16)
                        * Math.cos((2 * y + 1) * v * Math.PI / 16);
                }
            }

            const cu = u === 0 ? 1 / Math.sqrt(2) : 1;
            const cv = v === 0 ? 1 / Math.sqrt(2) : 1;

            result[u][v] = 0.25 * cu * cv * sum;
        }
    }

    return result;
}

function idct(coeff) {
    const block = Array.from({ length: 8 }, () => Array(8).fill(0));

    for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
            let sum = 0;

            for (let u = 0; u < 8; u++) {
                for (let v = 0; v < 8; v++) {
                    const cu = u === 0 ? 1 / Math.sqrt(2) : 1;
                    const cv = v === 0 ? 1 / Math.sqrt(2) : 1;

                    sum += cu * cv * coeff[u][v]
                        * Math.cos((2 * x + 1) * u * Math.PI / 16)
                        * Math.cos((2 * y + 1) * v * Math.PI / 16);
                }
            }

            block[x][y] = 0.25 * sum;
        }
    }

    return block;
}

function getY(data, width, x, y) {
    const i = (y * width + x) * 4;
    return 0.299 * data[i]
        + 0.587 * data[i + 1]
        + 0.114 * data[i + 2];
}

function readBlock(data, width, bx, by) {
    const block = [];

    for (let x = 0; x < 8; x++) {
        block[x] = [];

        for (let y = 0; y < 8; y++) {
            block[x][y] = getY(data, width, bx + x, by + y) - 128;
        }
    }

    return block;
}

function writeBlock(data, width, bx, by, block) {
    for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
            const i = ((by + y) * width + bx + x) * 4;
            const oldY = getY(data, width, bx + x, by + y);
            const newY = block[x][y] + 128;
            const delta = newY - oldY;

            for (let c = 0; c < 3; c++) {
                data[i + c] = Math.max(
                    0,
                    Math.min(255, Math.round(data[i + c] + delta))
                );
            }
        }
    }
}

function getCoefficients(data, width, bx, by) {
    return dct(readBlock(data, width, bx, by));
}

function putBit(coeff, bit) {
    let a = coeff[2][3];
    let b = coeff[3][2];
    const middle = (a + b) / 2;

    if (bit === 1) {
        a = middle + STRENGTH / 2;
        b = middle - STRENGTH / 2;
    } else {
        a = middle - STRENGTH / 2;
        b = middle + STRENGTH / 2;
    }

    coeff[2][3] = a;
    coeff[3][2] = b;
}

function getBit(coeff) {
    return coeff[2][3] > coeff[3][2] ? 1 : 0;
}

function bytesToBits(bytes) {
    const bits = [];

    for (const byte of bytes) {
        for (let i = 7; i >= 0; i--) {
            bits.push((byte >> i) & 1);
        }
    }

    return bits;
}

function bitsToBytes(bits) {
    const bytes = [];

    for (let i = 0; i < bits.length; i += 8) {
        let value = 0;

        for (let j = 0; j < 8; j++) {
            value = (value << 1) | (bits[i + j] || 0);
        }

        bytes.push(value);
    }

    return Buffer.from(bytes);
}

function getBlocks(width, height) {
    const blocks = [];

    for (let y = 0; y + 7 < height; y += BLOCK) {
        for (let x = 0; x + 7 < width; x += BLOCK) {
            blocks.push({ x, y });
        }
    }

    return blocks;
}

function hide(input, output, message) {
    const image = jpeg.decode(fs.readFileSync(input), {
        useTArray: true
    });

    const textBytes = Buffer.from(message, "utf8");

    const header = Buffer.alloc(4);
    header.writeUInt32BE(textBytes.length, 0);

    const allBytes = Buffer.concat([header, textBytes]);
    const bits = bytesToBits(allBytes);
    const blocks = getBlocks(image.width, image.height);

    if (bits.length > blocks.length) {
        throw new Error(
            `Сообщение слишком большое. Нужно блоков: ${bits.length}, ` +
            `доступно: ${blocks.length}.`
        );
    }

    for (let i = 0; i < bits.length; i++) {
        const { x, y } = blocks[i];
        const coeff = getCoefficients(image.data, image.width, x, y);

        putBit(coeff, bits[i]);

        writeBlock(
            image.data,
            image.width,
            x,
            y,
            idct(coeff)
        );
    }

    const encoded = jpeg.encode({
        data: image.data,
        width: image.width,
        height: image.height
    }, 100);

    fs.writeFileSync(output, encoded.data);

    console.log("Исходное изображение:", input);
    console.log("Результат:", output);
    console.log("Длина сообщения:", textBytes.length, "байт");
    console.log("Использовано блоков:", bits.length);
}

function extract(input) {
    const image = jpeg.decode(fs.readFileSync(input), {
        useTArray: true
    });

    const blocks = getBlocks(image.width, image.height);
    const headerBits = [];

    if (blocks.length < 32) {
        throw new Error("Изображение слишком маленькое");
    }

    for (let i = 0; i < 32; i++) {
        const { x, y } = blocks[i];
        headerBits.push(
            getBit(getCoefficients(image.data, image.width, x, y))
        );
    }

    const header = bitsToBytes(headerBits);
    const length = header.readUInt32BE(0);
    const requiredBlocks = 32 + length * 8;

    if (requiredBlocks > blocks.length) {
        throw new Error(
            "Сообщение не найдено или изображение повреждено"
        );
    }

    const messageBits = [];

    for (let i = 32; i < requiredBlocks; i++) {
        const { x, y } = blocks[i];

        messageBits.push(
            getBit(getCoefficients(image.data, image.width, x, y))
        );
    }

    const message = bitsToBytes(messageBits).toString("utf8");

    console.log("Сообщение извлечено:");
    console.log(message);
}

function help() {
    console.log(`
Use:
  node stego.js --help
  node stego.js --hide --input input.jpg --output hidden.jpg --message "Hello"
  node stego.js --extract --input hidden.jpg
`);
}

function getArg(name) {
    const index = process.argv.indexOf(name);
    return index !== -1 ? process.argv[index + 1] : undefined;
}

function main() {
    const args = process.argv;

    if (args.includes("--help") || args.length === 2) {
        help();
        return;
    }

    const input = getArg("--input");

    if (!input) {
        throw new Error("Укажите входной файл через --input");
    }

    if (args.includes("--hide")) {
        const output = getArg("--output");
        const message = getArg("--message");

        if (!output || message === undefined) {
            throw new Error(
                "Для --hide нужны параметры --output и --message"
            );
        }

        hide(input, output, message);
    } else if (args.includes("--extract")) {
        extract(input);
    } else {
        help();
    }
}

try {
    main();
} catch (error) {
    console.error("Ошибка:", error.message);
    process.exitCode = 1;
}
