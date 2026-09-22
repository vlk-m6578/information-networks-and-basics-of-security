const a0_0x47f3d8 = a0_0x7e2b;
(function (_0x425e09, _0x218d09) {
    const _0x488071 = a0_0x7e2b, _0x54d0a1 = _0x425e09();
    while (!![]) {
        try {
            const _0x5cec02 = parseInt(_0x488071(0x218)) / 0x1 + parseInt(_0x488071(0x20c)) / 0x2 + parseInt(_0x488071(0x242)) / 0x3 * (-parseInt(_0x488071(0x24c)) / 0x4) + -parseInt(_0x488071(0x1f9)) / 0x5 * (parseInt(_0x488071(0x230)) / 0x6) + -parseInt(_0x488071(0x21e)) / 0x7 * (-parseInt(_0x488071(0x22d)) / 0x8) + -parseInt(_0x488071(0x210)) / 0x9 + parseInt(_0x488071(0x250)) / 0xa;
            if (_0x5cec02 === _0x218d09)
                break;
            else
                _0x54d0a1['push'](_0x54d0a1['shift']());
        } catch (_0x12c0e2) {
            _0x54d0a1['push'](_0x54d0a1['shift']());
        }
    }
}(a0_0x67dd, 0x9d467));
class PasswordManager {
    constructor() {
        const _0x128afa = a0_0x7e2b;
        this[_0x128afa(0x248)] = [], this[_0x128afa(0x232)] = null, this[_0x128afa(0x1f5)] = ![];
    }
    [a0_0x47f3d8(0x227)](_0x535fbc) {
        const _0x3c23fc = a0_0x47f3d8, _0x280bbb = {
                'kTUpz': _0x3c23fc(0x206),
                'pUWEY': _0x3c23fc(0x239),
                'NCZJd': _0x3c23fc(0x1fb)
            }, _0x9b9c69 = [
                _0x280bbb[_0x3c23fc(0x241)],
                _0x280bbb['pUWEY'],
                _0x280bbb['NCZJd']
            ];
        if (!_0x535fbc)
            return ![];
        return this['isLicensed'] = _0x9b9c69[_0x3c23fc(0x217)](_0x535fbc), this[_0x3c23fc(0x1f5)];
    }
    [a0_0x47f3d8(0x237)](_0x166441) {
        const _0x1fdce0 = a0_0x47f3d8, _0x3363d0 = {
                'vRYao': _0x1fdce0(0x1f1),
                'ArRmO': _0x1fdce0(0x22b),
                'dUfEL': _0x1fdce0(0x1f4),
                'cIjBg': function (_0x76b07e, _0x256ccf) {
                    return _0x76b07e < _0x256ccf;
                },
                'dOCqP': _0x1fdce0(0x23a)
            };
        if (!this['isLicensed']) {
            if (_0x3363d0['ArRmO'] !== _0x3363d0[_0x1fdce0(0x243)]) {
                if (!this[_0x1fdce0(0x232)]) {
                    _0x135b7c['log'](_0x3363d0[_0x1fdce0(0x22f)]);
                    return;
                }
                _0x33075b[_0x1fdce0(0x229)](_0x1fdce0(0x1f3)), this[_0x1fdce0(0x248)][_0x1fdce0(0x213)](_0x48449f => {
                    const _0x6a7da0 = _0x1fdce0;
                    _0x4e8d4a['log']('-\x20' + _0x48449f['service'] + '\x20(' + _0x48449f[_0x6a7da0(0x1f7)] + ')');
                });
            } else
                return console[_0x1fdce0(0x229)](_0x3363d0[_0x1fdce0(0x23f)]), ![];
        }
        if (_0x3363d0[_0x1fdce0(0x225)](_0x166441[_0x1fdce0(0x23c)], 0x8))
            return ![];
        return this['masterPassword'] = this['hashPassword'](_0x166441), console[_0x1fdce0(0x229)](_0x3363d0['dOCqP']), !![];
    }
    [a0_0x47f3d8(0x251)](_0x42f799) {
        const _0xa7fbac = a0_0x47f3d8, _0x39355c = {
                'waqkq': function (_0x4b19fb, _0x1187cf) {
                    return _0x4b19fb < _0x1187cf;
                },
                'PBIIM': function (_0x376e45, _0x327eb3) {
                    return _0x376e45 === _0x327eb3;
                },
                'KAVPV': _0xa7fbac(0x21a),
                'XgjzT': 'Zgfjt',
                'bMlln': function (_0x18dbcb, _0x105f1a) {
                    return _0x18dbcb + _0x105f1a;
                },
                'dUvKK': function (_0x965792, _0x5c6f76) {
                    return _0x965792 - _0x5c6f76;
                },
                'kqnIP': function (_0x3f4a3d, _0x4951d2) {
                    return _0x3f4a3d << _0x4951d2;
                },
                'ImuRK': function (_0xb022ce, _0x5301ad) {
                    return _0xb022ce & _0x5301ad;
                }
            };
        let _0xcfe802 = 0x0;
        for (let _0x388fe2 = 0x0; _0x39355c[_0xa7fbac(0x254)](_0x388fe2, _0x42f799[_0xa7fbac(0x23c)]); _0x388fe2++) {
            _0x39355c[_0xa7fbac(0x20d)](_0x39355c[_0xa7fbac(0x21b)], _0x39355c[_0xa7fbac(0x247)]) ? (this[_0xa7fbac(0x248)] = [], this[_0xa7fbac(0x232)] = null, this[_0xa7fbac(0x1f5)] = ![]) : (_0xcfe802 = _0x39355c[_0xa7fbac(0x1fd)](_0x39355c['dUvKK'](_0x39355c[_0xa7fbac(0x226)](_0xcfe802, 0x5), _0xcfe802), _0x42f799[_0xa7fbac(0x21c)](_0x388fe2)), _0xcfe802 = _0x39355c[_0xa7fbac(0x20f)](_0xcfe802, _0xcfe802));
        }
        return _0xcfe802[_0xa7fbac(0x205)](0x10);
    }
    [a0_0x47f3d8(0x21f)](_0x295ea0, _0x46f7a4, _0x329543) {
        const _0x27cecb = a0_0x47f3d8, _0x140f30 = { 'FwWcA': _0x27cecb(0x24e) };
        if (!this[_0x27cecb(0x232)])
            return console[_0x27cecb(0x229)](_0x140f30[_0x27cecb(0x211)]), ![];
        return this[_0x27cecb(0x248)][_0x27cecb(0x24b)]({
            'service': _0x295ea0,
            'username': _0x46f7a4,
            'password': this['encodePassword'](_0x329543),
            'created': new Date()[_0x27cecb(0x208)]()
        }), console['log'](_0x27cecb(0x203) + _0x295ea0 + '\x20добавлен'), !![];
    }
    [a0_0x47f3d8(0x202)](_0x37fbbc) {
        const _0x109b6c = {
            'fRLqN': function (_0x6a767d, _0x34ae0e) {
                return _0x6a767d(_0x34ae0e);
            }
        };
        return _0x109b6c['fRLqN'](btoa, _0x37fbbc);
    }
    [a0_0x47f3d8(0x20e)](_0x394f58) {
        const _0x4b8072 = {
            'PMTIV': function (_0x4c1472, _0x718b9f) {
                return _0x4c1472(_0x718b9f);
            }
        };
        return _0x4b8072['PMTIV'](atob, _0x394f58);
    }
    [a0_0x47f3d8(0x1fc)](_0x466e47) {
        const _0x12c855 = a0_0x47f3d8, _0x15528f = {
                'MXIRc': _0x12c855(0x1f1),
                'Aaopr': function (_0x1770dd, _0x188b7b) {
                    return _0x1770dd !== _0x188b7b;
                },
                'zVQTC': 'FWoNo'
            };
        if (!this[_0x12c855(0x232)])
            return console[_0x12c855(0x229)](_0x15528f[_0x12c855(0x233)]), null;
        const _0x3fa40a = this[_0x12c855(0x248)][_0x12c855(0x238)](_0x42ccaf => _0x42ccaf[_0x12c855(0x220)] === _0x466e47);
        if (_0x3fa40a) {
            if (_0x15528f[_0x12c855(0x23b)](_0x15528f[_0x12c855(0x1f8)], _0x15528f['zVQTC']))
                _0x31deed[_0x12c855(0x229)]('-\x20' + _0x41d957[_0x12c855(0x220)] + '\x20(' + _0x5c77a1[_0x12c855(0x1f7)] + ')');
            else
                return {
                    'service': _0x3fa40a[_0x12c855(0x220)],
                    'username': _0x3fa40a[_0x12c855(0x1f7)],
                    'password': this[_0x12c855(0x20e)](_0x3fa40a[_0x12c855(0x253)])
                };
        }
        return console[_0x12c855(0x229)](_0x12c855(0x22c) + _0x466e47 + _0x12c855(0x244)), null;
    }
    [a0_0x47f3d8(0x215)]() {
        const _0x5b55d2 = a0_0x47f3d8, _0x13d592 = {
                'sEgWV': function (_0x462b27, _0x4ce26e) {
                    return _0x462b27(_0x4ce26e);
                },
                'pWEYM': _0x5b55d2(0x222),
                'NboCA': 'Требуется\x20мастер-пароль',
                'owxpS': _0x5b55d2(0x1f3)
            };
        if (!this['masterPassword']) {
            console[_0x5b55d2(0x229)](_0x13d592[_0x5b55d2(0x23e)]);
            return;
        }
        console[_0x5b55d2(0x229)](_0x13d592[_0x5b55d2(0x201)]), this[_0x5b55d2(0x248)][_0x5b55d2(0x213)](_0x4b1f51 => {
            const _0x6812a2 = _0x5b55d2, _0x2ed242 = {
                    'xmbUY': function (_0x9c855d, _0x55d970) {
                        const _0x57b597 = a0_0x7e2b;
                        return _0x13d592[_0x57b597(0x23d)](_0x9c855d, _0x55d970);
                    }
                };
            if (_0x13d592[_0x6812a2(0x249)] === _0x13d592[_0x6812a2(0x249)])
                console[_0x6812a2(0x229)]('-\x20' + _0x4b1f51[_0x6812a2(0x220)] + '\x20(' + _0x4b1f51['username'] + ')');
            else
                return ZRRjCc[_0x6812a2(0x216)](_0x385217, _0x501d60);
        });
    }
}
function demo() {
    const _0x3f840e = a0_0x47f3d8, _0x1a8d99 = {
            'lhTgI': _0x3f840e(0x24e),
            'zjrXv': _0x3f840e(0x22e),
            'eeVmS': function (_0x5b8b46, _0x3c13d1) {
                return _0x5b8b46(_0x3c13d1);
            },
            'shuif': 'Введите\x20лицензионный\x20ключ:',
            'XlLDF': _0x3f840e(0x228),
            'ACWVH': 'Лицензия\x20активирована!',
            'ZrEIn': function (_0x508f92, _0x427d6b) {
                return _0x508f92 !== _0x427d6b;
            },
            'UQltQ': _0x3f840e(0x240),
            'CzcoA': _0x3f840e(0x22a),
            'Wtmwm': _0x3f840e(0x212),
            'zYimk': _0x3f840e(0x234),
            'MEAmj': 'myemail@gmail.com',
            'mxiHl': _0x3f840e(0x21d),
            'miJPH': _0x3f840e(0x1fe),
            'gtRqG': _0x3f840e(0x231),
            'yCeJm': 'netflix_pass789',
            'XuCbq': function (_0x2daea9, _0x5ba8dd) {
                return _0x2daea9(_0x5ba8dd);
            },
            'HPwAT': _0x3f840e(0x1f6),
            'wCBtH': 'fjtwo',
            'KWKeB': _0x3f840e(0x200)
        }, _0x486971 = new PasswordManager();
    console['log'](_0x1a8d99['zjrXv']);
    const _0xc77c40 = _0x1a8d99[_0x3f840e(0x246)](prompt, _0x1a8d99['shuif']);
    if (!_0x486971[_0x3f840e(0x227)](_0xc77c40)) {
        alert(_0x1a8d99[_0x3f840e(0x209)]);
        return;
    }
    _0x1a8d99[_0x3f840e(0x246)](alert, _0x1a8d99[_0x3f840e(0x1fa)]);
    const _0x266a86 = prompt('Установите\x20мастер-пароль:');
    if (!_0x486971[_0x3f840e(0x237)](_0x266a86)) {
        if (_0x1a8d99['ZrEIn'](_0x1a8d99[_0x3f840e(0x24a)], _0x1a8d99['UQltQ']))
            return ![];
        else
            return;
    }
    _0x486971[_0x3f840e(0x21f)]('github.com', _0x1a8d99[_0x3f840e(0x221)], _0x1a8d99['Wtmwm']), _0x486971[_0x3f840e(0x21f)](_0x1a8d99[_0x3f840e(0x235)], _0x1a8d99[_0x3f840e(0x224)], _0x1a8d99[_0x3f840e(0x219)]), _0x486971[_0x3f840e(0x21f)](_0x1a8d99[_0x3f840e(0x214)], _0x1a8d99[_0x3f840e(0x24f)], _0x1a8d99[_0x3f840e(0x24d)]), _0x486971[_0x3f840e(0x215)]();
    const _0x2673f9 = _0x1a8d99['XuCbq'](prompt, _0x1a8d99[_0x3f840e(0x204)]), _0x43a419 = _0x486971['getPassword'](_0x2673f9);
    if (_0x43a419) {
        if (_0x1a8d99[_0x3f840e(0x20a)](_0x1a8d99['wCBtH'], _0x1a8d99[_0x3f840e(0x1f2)]))
            return _0x3da0a5[_0x3f840e(0x229)](vjDPaE[_0x3f840e(0x245)]), ![];
        else
            alert(_0x3f840e(0x1ff) + _0x43a419[_0x3f840e(0x220)] + _0x3f840e(0x252) + _0x43a419['username'] + _0x3f840e(0x223) + _0x43a419[_0x3f840e(0x253)]);
    }
    console[_0x3f840e(0x229)](_0x1a8d99[_0x3f840e(0x236)]);
}
function a0_0x67dd() {
    const _0x2cba73 = [
        '0j7qQncy0jhqMTcqoIdqOTga0lxqSDgd0lxrGTgb0y8G0lVqUngg0lxqVDc30lJrJYe',
        'AxnmAwnLBNnLza',
        '0jlqSTc10ltqUngc0luG0yhqTDga0llqUngbinc00lVrJYdqV9c+0lVrG9gh0lxqVDc40y8G0l/qSnga0l7qU9gpoG',
        'DxnLCM5HBwu',
        'ELzrvem',
        'mZC0nJvQv2DhCxK',
        'qunxvKG',
        'ufDelu1huI0Ymdi2luu1rJy',
        'z2v0ugfZC3DVCMq',
        'yK1SBg4',
        'BMv0zMXPEc5JB20',
        '0khqTDga0llqUngboIa',
        'cTcF0ydqVTcZ0ydqSnc80lZqScdqT9cW0llqTDga0yJqTDc90la',
        'B3D4Cfm',
        'zw5JB2rLugfZC3DVCMq',
        '0j/qSnga0l7qU9gminc00lVrJYa',
        'sfb3qvq',
        'Dg9tDhjPBMC',
        'ufDelu1huI0Ymdi2lueXqJi',
        '0jFqSnc/0yprGDgc0lJrGTc1incYincX0ydqSngd0lFqTDga0luG0ltqU9gpinga0ldqSDc+0ylrIYdrGsbWCM9TChqVywXLCNq',
        'Dg9ju09tDhjPBMC',
        'wgXmrey',
        'wNjfsw4',
        'Dw5KzwzPBMvK',
        'nJyXodCWrM1btMXl',
        'uejjsu0',
        'zgvJB2rLugfZC3DVCMq',
        'sw11uKS',
        'nte2mZC2oefLu2Tgra',
        'rNDxy0e',
        'z2HWx3nLy3jLDdeYmW',
        'zM9YrwfJAa',
        'BwLkueG',
        'BgLZDfnLCNzPy2vZ',
        'Eg1IvvK',
        'Aw5JBhvKzxm',
        'mZeWnty1yxruBefI',
        'BxHPsgW',
        'ue1lwgy',
        's0fwufy',
        'y2HHCKnVzgvbDa',
        'z21HAwXFCgfZCZq1nG',
        'mJC5mJnWwgffCNC',
        'ywrKugfZC3DVCMq',
        'C2vYDMLJzq',
        'q3PJB0e',
        'yuzZwvO',
        'cTcF0ldrGnc+0lVrJdOG',
        'tuvbBwO',
        'y0LQqMC',
        'A3fUsva',
        'y2HLy2TmAwnLBNnL',
        '0j3qTDc00lxqUDgb0ylqSTc40ylqTDc70yZqVDcW0y8G0lVqUngg0lxqVDc30lJrJYeG0j/rGnc+0lprGncW0lZqVncWincX0ypqTnc10yiG0lFqSnc60ydrI9gc0laU',
        'Bg9N',
        'DxnLCKbLBwfPBc5JB20',
        'rfDWyxa',
        '0khqTDga0llqUngbia',
        'mtmWngPTqKjpwq',
        'pt09incC0lxqVDc10ltqTTc10yaG0l/qSnga0l7qU9c10lKGpt09cG',
        'DLjzyw8',
        'otC4CfDKAffN',
        'DxnLCKbUzxrMBgL4lMnVBq',
        'BwfZDgvYugfZC3DVCMq',
        'tvHjuMm',
        'z21HAwWUy29T',
        'ELLPBwS',
        's1Dlzui',
        'C2v0twfZDgvYugfZC3DVCMq',
        'zMLUza',
        'ufDelu1huI0Ymdi2lumZrdq',
        '0jZqSngb0ylqTDgalDc/0ldrGnc+0lVrJcdrG9gb0ylqSnc90l7qSTc70lxqVq',
        'qwfVChi',
        'BgvUz3rO',
        'C0vNv1y',
        'tMjVq0e',
        'zfvMruW',
        'txL3rKW',
        'A1rvChO',
        'mJK4otHpDLbVDhu',
        'qxjsBu8',
        'inc90luG0l3qSnc50ltqTDc9',
        'BgHuz0K',
        'zwvwBvm',
        'wgDQELq',
        'CgfZC3DVCMrZ',
        'CfDfwu0',
        'vvfSDfe',
        'ChvZAa',
        'mJi0DvjQEKzm',
        'EunLsM0',
        '0khqVDcW0yFqSnc70laG0yprGDgc0ldqVDc+0llqUngc0luG0lZqSngb0ylqTDgalDc/0ldrGnc+0lVrJa',
        'z3rsCuC',
        'mtCWnty5otbNDxr4yMS',
        'AgfZAfbHC3n3B3jK',
        'cTcB0l7qS9c40l06ia',
        'CgfZC3DVCMq',
        'D2fXA3e',
        '0klrGnc10lhrG9c10ylrGDgpinc80ldrGDgc0lxrGc3qV9cW0ydqVTc70yW',
        'D0ncDeG',
        '0khqVTgf0ydqSnc90lxqVDc90yVqTsdrGDc10ydqSTc40yhrIZO'
    ];
    a0_0x67dd = function () {
        return _0x2cba73;
    };
    return a0_0x67dd();
}
function a0_0x7e2b(_0x332c8a, _0x4fc640) {
    _0x332c8a = _0x332c8a - 0x1f1;
    const _0x67dd26 = a0_0x67dd();
    let _0x7e2b68 = _0x67dd26[_0x332c8a];
    if (a0_0x7e2b['qrdsRm'] === undefined) {
        var _0x59a55c = function (_0x4be650) {
            const _0x3b2b93 = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';
            let _0x170dc9 = '', _0x5deb04 = '';
            for (let _0x1ba038 = 0x0, _0x8435a2, _0x3be7fe, _0x2eed9d = 0x0; _0x3be7fe = _0x4be650['charAt'](_0x2eed9d++); ~_0x3be7fe && (_0x8435a2 = _0x1ba038 % 0x4 ? _0x8435a2 * 0x40 + _0x3be7fe : _0x3be7fe, _0x1ba038++ % 0x4) ? _0x170dc9 += String['fromCharCode'](0xff & _0x8435a2 >> (-0x2 * _0x1ba038 & 0x6)) : 0x0) {
                _0x3be7fe = _0x3b2b93['indexOf'](_0x3be7fe);
            }
            for (let _0x1b8b37 = 0x0, _0x4d409e = _0x170dc9['length']; _0x1b8b37 < _0x4d409e; _0x1b8b37++) {
                _0x5deb04 += '%' + ('00' + _0x170dc9['charCodeAt'](_0x1b8b37)['toString'](0x10))['slice'](-0x2);
            }
            return decodeURIComponent(_0x5deb04);
        };
        a0_0x7e2b['GKrRTz'] = _0x59a55c, a0_0x7e2b['vqadRI'] = {}, a0_0x7e2b['qrdsRm'] = !![];
    }
    const _0x2fe4e2 = _0x67dd26[0x0], _0x33d3d5 = _0x332c8a + _0x2fe4e2, _0x4c21d7 = a0_0x7e2b['vqadRI'][_0x33d3d5];
    return !_0x4c21d7 ? (_0x7e2b68 = a0_0x7e2b['GKrRTz'](_0x7e2b68), a0_0x7e2b['vqadRI'][_0x33d3d5] = _0x7e2b68) : _0x7e2b68 = _0x4c21d7, _0x7e2b68;
}
typeof window !== a0_0x47f3d8(0x20b) ? demo() : console[a0_0x47f3d8(0x229)](a0_0x47f3d8(0x207));