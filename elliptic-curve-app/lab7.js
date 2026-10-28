const args = process.argv.slice(2);

const p = 17;
const a = 2;
const b = 2;

const G = {
    x: 5,
    y: 1
};

function mod(a, p) {
    return ((a % p) + p) % p;
}

function modInverse(a, p) {
    a = mod(a, p);

    for (let x = 1; x < p; x++) {
        if (mod(a * x, p) === 1) {
            return x;
        }
    }

    throw new Error("Обратного элемента не существует");
}

function pointAdd(P, Q) {
    if (P === null) {
        return Q;
    }

    if (Q === null) {
        return P;
    }

    const x1 = P.x;
    const y1 = P.y;
    const x2 = Q.x;
    const y2 = Q.y;

    if (x1 === x2 && mod(y1 + y2, p) === 0) {
        return null;
    }

    let lambda;

    if (x1 === x2 && y1 === y2) {
        lambda = mod(
            (3 * x1 * x1 + a) *
            modInverse(2 * y1, p),
            p
        );
    }

    else {
        lambda = mod(
            (y2 - y1) *
            modInverse(x2 - x1, p),
            p
        );
    }

    const x3 = mod(
        lambda * lambda - x1 - x2,
        p
    );

    const y3 = mod(
        lambda * (x1 - x3) - y1,
        p
    );

    return {
        x: x3,
        y: y3
    };
}

function pointMultiply(k, P) {
    let result = null;
    let current = P;

    while (k > 0) {
        if (k % 2 === 1) {
            result = pointAdd(result, current);
        }

        current = pointAdd(current, current);
        k = Math.floor(k / 2);
    }

    return result;
}

function pointNegate(P) {
    if (P === null) {
        return null;
    }

    return {
        x: P.x,
        y: mod(-P.y, p)
    };
}

function isPointOnCurve(P) {
    if (P === null) {
        return true;
    }

    const left = mod(P.y * P.y, p);

    const right = mod(
        P.x * P.x * P.x +
        a * P.x +
        b,
        p
    );

    return left === right;
}

function messageToPoint(message) {
    for (let y = 0; y < p; y++) {
        const point = {
            x: message,
            y: y
        };

        if (isPointOnCurve(point)) {
            return point;
        }
    }

    return null;
}

function stringToPoint(value) {
    const parts = value.split(",");

    if (parts.length !== 2) {
        throw new Error(
            "Точка должна иметь формат x,y"
        );
    }

    const x = Number(parts[0]);
    const y = Number(parts[1]);

    if (!Number.isInteger(x) || !Number.isInteger(y)) {
        throw new Error(
            "Координаты точки должны быть целыми числами"
        );
    }

    const point = {
        x: x,
        y: y
    };

    if (!isPointOnCurve(point)) {
        throw new Error(
            `Точка (${x}, ${y}) не принадлежит эллиптической кривой`
        );
    }

    return point;
}

function getOption(name) {
    const index = args.indexOf(name);

    if (index === -1) {
        return null;
    }

    if (index + 1 >= args.length) {
        throw new Error(
            `Для опции ${name} необходимо указать значение`
        );
    }

    return args[index + 1];
}

function getNumberOption(name) {
    const value = getOption(name);

    if (value === null) {
        return null;
    }

    const number = Number(value);

    if (!Number.isInteger(number)) {
        throw new Error(
            `Значение ${name} должно быть целым числом`
        );
    }

    return number;
}

function encrypt(M, d, k) {

    const Q = pointMultiply(d, G);

    const C1 = pointMultiply(k, G);

    const kQ = pointMultiply(k, Q);

    const C2 = pointAdd(M, kQ);

    return {
        Q,
        C1,
        C2
    };
}

function decrypt(C1, C2, d) {

    const dC1 = pointMultiply(d, C1);

    const minusDC1 = pointNegate(dC1);

    return pointAdd(C2, minusDC1);
}

function showHelp() {
    console.log(`

  node lab7.js encrypt --message <число> --private-key <число> --k <число>

  node lab7.js decrypt --c1 <x,y> --c2 <x,y> --private-key <число>

  --message <число>       сообщение для шифрования
  --private-key <число>   закрытый ключ
  --k <число>             случайный параметр шифрования
  --c1 <x,y>              первая часть шифртекста
  --c2 <x,y>              вторая часть шифртекста

  node lab7.js encrypt --message 6 --private-key 5 --k 3

  node lab7.js decrypt --c1 10,6 --c2 6,14 --private-key 5
`);
}

if (args.includes("--help") || args.length === 0) {
    showHelp();
    process.exit(0);
}

const command = args[0];

try {
    if (command === "encrypt") {

        const message = getNumberOption("--message");
        const d = getNumberOption("--private-key");
        const k = getNumberOption("--k");

        if (message === null) {
            throw new Error(
                "Необходимо указать --message"
            );
        }

        if (d === null) {
            throw new Error(
                "Необходимо указать --private-key"
            );
        }

        if (k === null) {
            throw new Error(
                "Необходимо указать --k"
            );
        }

        if (message < 0 || message >= p) {
            throw new Error(
                `Сообщение должно быть от 0 до ${p - 1}`
            );
        }

        if (d <= 0) {
            throw new Error(
                "Закрытый ключ должен быть положительным"
            );
        }

        if (k <= 0) {
            throw new Error(
                "Параметр k должен быть положительным"
            );
        }

        const M = messageToPoint(message);

        if (M === null) {
            throw new Error(
                `Для сообщения ${message} не найдена точка на кривой`
            );
        }

        const result = encrypt(M, d, k);

        console.log("\nПараметры:");
        console.log(
            `Кривая: y² = x³ + ${a}x + ${b} (mod ${p})`
        );

        console.log(
            `G = (${G.x}, ${G.y})`
        );

        console.log(
            `Закрытый ключ d = ${d}`
        );

        console.log(
            `Открытый ключ Q = dG = (${result.Q.x}, ${result.Q.y})`
        );

        console.log(
            `\nСообщение: ${message}`
        );

        console.log(
            `Точка сообщения M = (${M.x}, ${M.y})`
        );

        console.log(
            `Сессионный параметр k = ${k}`
        );

        console.log("\nРезультат шифрования:");

        console.log(
            `C1 = kG = (${result.C1.x}, ${result.C1.y})`
        );

        console.log(
            `C2 = M + kQ = (${result.C2.x}, ${result.C2.y})`
        );

        console.log(
            `\nШифртекст: --c1 ${result.C1.x},${result.C1.y} --c2 ${result.C2.x},${result.C2.y}`
        );
    }

    else if (command === "decrypt") {

        const c1Value = getOption("--c1");
        const c2Value = getOption("--c2");
        const d = getNumberOption("--private-key");

        if (c1Value === null) {
            throw new Error(
                "Необходимо указать --c1"
            );
        }

        if (c2Value === null) {
            throw new Error(
                "Необходимо указать --c2"
            );
        }

        if (d === null) {
            throw new Error(
                "Необходимо указать --private-key"
            );
        }

        if (d <= 0) {
            throw new Error(
                "Закрытый ключ должен быть положительным"
            );
        }

        const C1 = stringToPoint(c1Value);
        const C2 = stringToPoint(c2Value);

        const M = decrypt(C1, C2, d);

        if (M === null) {
            throw new Error(
                "Получена точка на бесконечности"
            );
        }

        console.log("\nПараметры:");
        console.log(
            `Кривая: y² = x³ + ${a}x + ${b} (mod ${p})`
        );

        console.log(
            `G = (${G.x}, ${G.y})`
        );

        console.log(
            `Закрытый ключ d = ${d}`
        );

        const Q = pointMultiply(d, G);

        console.log(
            `Открытый ключ Q = dG = (${Q.x}, ${Q.y})`
        );

        console.log(
            `\nC1 = (${C1.x}, ${C1.y})`
        );

        console.log(
            `C2 = (${C2.x}, ${C2.y})`
        );

        console.log("\nРезультат расшифрования:");

        console.log(
            `Точка M = (${M.x}, ${M.y})`
        );

        console.log(
            `Сообщение: ${M.x}`
        );
    }

    else {
        throw new Error(
            `Неизвестная команда: ${command}\nИспользуйте --help`
        );
    }

} catch (error) {

    console.log(`\nОшибка: ${error.message}`);
    process.exit(1);
}