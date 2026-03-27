const a0_0x390bc7 = a0_0x58ba;
function a0_0x58ba(_0x1c2485, _0x472849) {
    _0x1c2485 = _0x1c2485 - 0x1a8;
    const _0x37c34d = a0_0x37c3();
    let _0x58ba79 = _0x37c34d[_0x1c2485];
    return _0x58ba79;
}
(function (_0x574c90, _0x73973e) {
    const _0x1d3746 = a0_0x58ba, _0x146fe9 = _0x574c90();
    while (!![]) {
        try {
            const _0x1cb942 = parseInt(_0x1d3746(0x1c4)) / 0x1 + parseInt(_0x1d3746(0x1bf)) / 0x2 * (-parseInt(_0x1d3746(0x1d6)) / 0x3) + -parseInt(_0x1d3746(0x1a9)) / 0x4 + -parseInt(_0x1d3746(0x1bc)) / 0x5 * (parseInt(_0x1d3746(0x1b6)) / 0x6) + -parseInt(_0x1d3746(0x1b3)) / 0x7 + parseInt(_0x1d3746(0x1d1)) / 0x8 * (parseInt(_0x1d3746(0x1d7)) / 0x9) + -parseInt(_0x1d3746(0x1d9)) / 0xa * (-parseInt(_0x1d3746(0x1b8)) / 0xb);
            if (_0x1cb942 === _0x73973e)
                break;
            else
                _0x146fe9['push'](_0x146fe9['shift']());
        } catch (_0x439d01) {
            _0x146fe9['push'](_0x146fe9['shift']());
        }
    }
}(a0_0x37c3, 0xaef34));
function a0_0x37c3() {
    const _0x3713a6 = [
        'user@netflix.com',
        '55LdGFVJ',
        'getPassword',
        'encodePassword',
        'service',
        '5CNVCUe',
        'decodePassword',
        '\x0aЛогин:\x20',
        '2rShuDP',
        'Запустите\x20в\x20браузере\x20для\x20работы\x20с\x20prompt/alert',
        'length',
        'Сохраненные\x20сервисы:',
        'listServices',
        '431622SKBLIu',
        'myemail@gmail.com',
        'Мастер-пароль\x20установлен',
        'masterPassword',
        'PWD-MGR-2026-A1B2',
        'isLicensed',
        'Пароль\x20должен\x20быть\x20не\x20менее\x208\x20символов',
        'includes',
        'netflix.com',
        'passwords',
        'toISOString',
        '\x0aПароль:\x20',
        'ОШИБКА:\x20Требуется\x20лицензия!',
        '5031240UdqJMR',
        'undefined',
        'find',
        'gmail.com',
        'addPassword',
        '4255713dqWsGe',
        '18LTYNCv',
        'checkLicense',
        '4762540mClALf',
        '\x0aПрограмма\x20завершена',
        'username',
        'password',
        'netflix_pass789',
        'PWD-MGR-2026-E5F6',
        '1474704SZpfLk',
        'toString',
        'Требуется\x20мастер-пароль',
        'github.com',
        'log',
        'hashPassword',
        'Сначала\x20установите\x20мастер-пароль',
        '\x20добавлен',
        '\x20не\x20найден',
        'setMasterPassword',
        '3476214rQqLKA',
        'Введите\x20лицензионный\x20ключ:',
        '===\x20Менеджер\x20паролей\x20===\x0a',
        '6421542rXAzXt'
    ];
    a0_0x37c3 = function () {
        return _0x3713a6;
    };
    return a0_0x37c3();
}
class PasswordManager {
    constructor() {
        const _0x1f0013 = a0_0x58ba;
        this[_0x1f0013(0x1cd)] = [], this[_0x1f0013(0x1c7)] = null, this[_0x1f0013(0x1c9)] = ![];
    }
    ['checkLicense'](_0x54afd2) {
        const _0x3af2d4 = a0_0x58ba, _0x25455e = [
                _0x3af2d4(0x1c8),
                'PWD-MGR-2026-C3D4',
                _0x3af2d4(0x1a8)
            ];
        if (!_0x54afd2)
            return ![];
        return this[_0x3af2d4(0x1c9)] = _0x25455e[_0x3af2d4(0x1cb)](_0x54afd2), this[_0x3af2d4(0x1c9)];
    }
    ['setMasterPassword'](_0x2605a1) {
        const _0xeb0a14 = a0_0x58ba;
        if (!this['isLicensed'])
            return console[_0xeb0a14(0x1ad)](_0xeb0a14(0x1d0)), ![];
        if (_0x2605a1[_0xeb0a14(0x1c1)] < 0x8)
            return console[_0xeb0a14(0x1ad)](_0xeb0a14(0x1ca)), ![];
        return this[_0xeb0a14(0x1c7)] = this[_0xeb0a14(0x1ae)](_0x2605a1), console[_0xeb0a14(0x1ad)](_0xeb0a14(0x1c6)), !![];
    }
    [a0_0x390bc7(0x1ae)](_0x4f48f2) {
        const _0x330187 = a0_0x390bc7;
        let _0x4216f9 = 0x0;
        for (let _0x146423 = 0x0; _0x146423 < _0x4f48f2[_0x330187(0x1c1)]; _0x146423++) {
            _0x4216f9 = (_0x4216f9 << 0x5) - _0x4216f9 + _0x4f48f2['charCodeAt'](_0x146423), _0x4216f9 = _0x4216f9 & _0x4216f9;
        }
        return _0x4216f9[_0x330187(0x1aa)](0x10);
    }
    [a0_0x390bc7(0x1d5)](_0x258d3b, _0x221216, _0x5d6487) {
        const _0x6bdb7e = a0_0x390bc7;
        if (!this[_0x6bdb7e(0x1c7)])
            return console[_0x6bdb7e(0x1ad)](_0x6bdb7e(0x1af)), ![];
        return this[_0x6bdb7e(0x1cd)]['push']({
            'service': _0x258d3b,
            'username': _0x221216,
            'password': this[_0x6bdb7e(0x1ba)](_0x5d6487),
            'created': new Date()[_0x6bdb7e(0x1ce)]()
        }), console['log']('Пароль\x20для\x20' + _0x258d3b + _0x6bdb7e(0x1b0)), !![];
    }
    [a0_0x390bc7(0x1ba)](_0x3888d5) {
        return btoa(_0x3888d5);
    }
    [a0_0x390bc7(0x1bd)](_0xfd964a) {
        return atob(_0xfd964a);
    }
    [a0_0x390bc7(0x1b9)](_0x4049d8) {
        const _0xdca48f = a0_0x390bc7;
        if (!this[_0xdca48f(0x1c7)])
            return console['log'](_0xdca48f(0x1ab)), null;
        const _0x439cc3 = this[_0xdca48f(0x1cd)][_0xdca48f(0x1d3)](_0x2e4c66 => _0x2e4c66[_0xdca48f(0x1bb)] === _0x4049d8);
        if (_0x439cc3)
            return {
                'service': _0x439cc3[_0xdca48f(0x1bb)],
                'username': _0x439cc3[_0xdca48f(0x1db)],
                'password': this[_0xdca48f(0x1bd)](_0x439cc3[_0xdca48f(0x1dc)])
            };
        return console[_0xdca48f(0x1ad)]('Сервис\x20' + _0x4049d8 + _0xdca48f(0x1b1)), null;
    }
    [a0_0x390bc7(0x1c3)]() {
        const _0x1d6dfa = a0_0x390bc7;
        if (!this[_0x1d6dfa(0x1c7)]) {
            console['log'](_0x1d6dfa(0x1ab));
            return;
        }
        console['log'](_0x1d6dfa(0x1c2)), this['passwords']['forEach'](_0x26a0b9 => {
            const _0x38a848 = _0x1d6dfa;
            console[_0x38a848(0x1ad)]('-\x20' + _0x26a0b9[_0x38a848(0x1bb)] + '\x20(' + _0x26a0b9[_0x38a848(0x1db)] + ')');
        });
    }
}
function demo() {
    const _0x12c8e3 = a0_0x390bc7, _0x4c2b56 = new PasswordManager();
    console[_0x12c8e3(0x1ad)](_0x12c8e3(0x1b5));
    const _0x2ad58f = prompt(_0x12c8e3(0x1b4));
    if (!_0x4c2b56[_0x12c8e3(0x1d8)](_0x2ad58f)) {
        alert('Недействительная\x20лицензия!\x20Программа\x20будет\x20закрыта.');
        return;
    }
    alert('Лицензия\x20активирована!');
    const _0x1e4973 = prompt('Установите\x20мастер-пароль:');
    if (!_0x4c2b56[_0x12c8e3(0x1b2)](_0x1e4973))
        return;
    _0x4c2b56[_0x12c8e3(0x1d5)](_0x12c8e3(0x1ac), 'user@email.com', 'ghp_secret123'), _0x4c2b56['addPassword'](_0x12c8e3(0x1d4), _0x12c8e3(0x1c5), 'gmail_pass456'), _0x4c2b56[_0x12c8e3(0x1d5)](_0x12c8e3(0x1cc), _0x12c8e3(0x1b7), _0x12c8e3(0x1dd)), _0x4c2b56[_0x12c8e3(0x1c3)]();
    const _0x4abdd1 = prompt('Введите\x20сервис\x20для\x20получения\x20пароля:'), _0x116ebb = _0x4c2b56[_0x12c8e3(0x1b9)](_0x4abdd1);
    _0x116ebb && alert('Сервис:\x20' + _0x116ebb[_0x12c8e3(0x1bb)] + _0x12c8e3(0x1be) + _0x116ebb[_0x12c8e3(0x1db)] + _0x12c8e3(0x1cf) + _0x116ebb[_0x12c8e3(0x1dc)]), console[_0x12c8e3(0x1ad)](_0x12c8e3(0x1da));
}
typeof window !== a0_0x390bc7(0x1d2) ? demo() : console[a0_0x390bc7(0x1ad)](a0_0x390bc7(0x1c0));