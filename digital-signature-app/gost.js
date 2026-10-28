const crypto = require("crypto");

const p = 23n;
const q = 11n;
const a = 2n;

function modPow(a, b, m) {
    let result = 1n;

    a = a % m;
    while (b > 0n) {
        if (b % 2n === 1n) {
            result = (result * a) % m;
        }

        a = (a * a) % m;
        b = b / 2n;
    }
    return result;
}

function modInverse(a, m) {
    for (let x = 1n; x < m; x++) {
        if ((a * x) % m === 1n) {
            return x;
        }
    }
    throw new Error("Обратного элемента не существует");
}

function hashMessage(message) {
    const hash = crypto
        .createHash("sha256")
        .update(message, "utf8")
        .digest("hex");

    const hashNumber = BigInt("0x" + hash);

    let h = hashNumber % q;
    if (h === 0n) {
        h = 1n;
    }
    return h;
}

function generateK() {
    while (true) {
        const k = BigInt(
            crypto.randomInt(1, Number(q))
        );
        if (k > 0n && k < q) {
            return k;
        }
    }
}

function getPublicKey(x) {
    return modPow(a, x, p);
}

function sign(message, x) {
    const h = hashMessage(message);

    while (true) {
        const k = generateK();
        const r = modPow(a, k, p) % q;
        if (r === 0n) {
            continue;
        }

        const s = (x * r + k * h) % q;
        if (s === 0n) {
            continue;
        }

        return {
            h,
            k,
            r,
            s,
            y: getPublicKey(x)
        };
    }
}

function verify(message, r, s, y) {
    if (r <= 0n || r >= q) {
        return false;
    }
    if (s <= 0n || s >= q) {
        return false;
    }

    const h = hashMessage(message);
    const v = modInverse(h, q);
    const z1 = (s * v) % q;
    const z2 = ((q - r) * v) % q;
    const u = (
        (modPow(a, z1, p) * modPow(y, z2, p)) % p
    ) % q;

    return u === r;
}

function printHelp() {
    console.log(`
Использование:

  node gost.js --help
  node gost.js --sign "сообщение"
  node gost.js --sign "сообщение" --x 5
  node gost.js --verify "сообщение" --r 5 --s 7 --y 8
`);
}

function getArgument(name) {
    const index = process.argv.indexOf(name);
    if (index === -1) {
        return null;
    }

    return process.argv[index + 1];
}

const args = process.argv.slice(2);
if (args.length === 0 || args.includes("--help")) {
    printHelp();
    process.exit(0);
}

if (args.includes("--sign")) {
    const message = getArgument("--sign");

    if (message === null) {
        console.log("Ошибка: не указано сообщение.");
        process.exit(1);
    }

    const xArgument = getArgument("--x");
    const x = xArgument !== null
        ? BigInt(xArgument)
        : 3n;

    if (x <= 0n || x >= q) {
        console.log(`Ошибка: секретный ключ x должен быть от 1 до ${q - 1n}.`);
        process.exit(1);
    }

    const result = sign(message, x);

    console.log("Формирование ЭЦП");

    console.log("Сообщение :", message);
    console.log("p         :", p.toString());
    console.log("q         :", q.toString());
    console.log("a         :", a.toString());
    console.log("x         :", x.toString());
    console.log("y         :", result.y.toString());
    console.log("h         :", result.h.toString());
    console.log("k         :", result.k.toString());
    console.log("r         :", result.r.toString());
    console.log("s         :", result.s.toString());

    console.log("ЭЦП: (r, s) = (" +
        result.r + ", " + result.s + ")"
    );
    process.exit(0);
}

if (args.includes("--verify")) {
    const message = getArgument("--verify");
    const rArgument = getArgument("--r");
    const sArgument = getArgument("--s");
    const yArgument = getArgument("--y");

    if (
        message === null ||
        rArgument === null ||
        sArgument === null ||
        yArgument === null
    ) {
        console.log(
            "Ошибка: для проверки необходимо указать --verify, --r, --s и --y."
        );
        process.exit(1);
    }

    const r = BigInt(rArgument);
    const s = BigInt(sArgument);
    const y = BigInt(yArgument);

    console.log("ПРОВЕРКА ЭЦП");

    console.log("Сообщение :", message);
    console.log("p         :", p.toString());
    console.log("q         :", q.toString());
    console.log("a         :", a.toString());
    console.log("y         :", y.toString());
    console.log("r         :", r.toString());
    console.log("s         :", s.toString());
    console.log("h         :", hashMessage(message).toString());

    const valid = verify(message, r, s, y);


    if (valid) {
        console.log("Результат: ЭЦП ВЕРНА");
    } else {
        console.log("Результат: ЭЦП НЕВЕРНА");
    }


    process.exit(0);
}

console.log("Неизвестная команда. Используйте --help.");