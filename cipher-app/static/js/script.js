document.addEventListener('DOMContentLoaded', function () {
  // DOM-elements
  const main = document.querySelector(".main");

  const cipherMenuBtns = main.querySelectorAll(".cipher-menu .btn");
  const caesarPanel = main.querySelector(".caesar-cipher");
  const vigenerePanel = main.querySelector(".vigenere-cipher");

  const caesarInput = main.querySelector(".caesar-cipher textarea");
  const vigenereInput = main.querySelector(".vigenere-cipher textarea");
  const caesarResult = main.querySelector("#caesar-result");
  const vigenereResult = main.querySelector("#vigenere-result");

  const caesarKeyRange = main.querySelector("#caesar-key-range");
  const caesarKey = main.querySelector("#caesar-key");
  const vigenereKey = main.querySelector("#vigenere-key");

  const caesarExecuteBtn = main.querySelector(".caesar-cipher .results__btn");
  const vigenereExecuteBtn = main.querySelector(".vigenere-cipher .results__btn");

  const caesarRadios = main.querySelectorAll(".caesar-cipher input[name='caesar-result']");
  const vigenereRadios = main.querySelectorAll(".vigenere-cipher input[name='vigenere-result']");

  const loadFileBtn = main.querySelector("#load-file");
  const clearTextBtn = main.querySelector("#clear-text");
  const saveResultBtn = main.querySelector("#save-result");
  const copyResultBtn = main.querySelector("#copy-result");
  const currentFileInfo = main.querySelector("#current-file");

  let currentFile = null;
  let currentCipher = 'caesar'; // current active cipher
  let currentMode = 'encrypt';

  // switch to cipher
  cipherMenuBtns.forEach((btn, index) => {
    btn.addEventListener('click', function () {
      cipherMenuBtns.forEach(b => b.classList.remove("active"));
      this.classList.add("active");
      currentFile = null;
      currentFileInfo.textContent = 'File not selected';
      currentMode = 'encrypt';

      if (index == 0) {
        caesarPanel.style.display = 'flex';
        vigenerePanel.style.display = 'none';
        currentCipher = 'caesar';
      } else {
        vigenerePanel.style.display = 'flex';
        caesarPanel.style.display = 'none';
        currentCipher = 'vigenere';
      }
    });
  });

  // connect range to number (inputs)
  caesarKeyRange.addEventListener('input', function () {
    caesarKey.value = this.value;
  });

  caesarKey.addEventListener('input', function () {
    let value = parseInt(this.value); // || 3
    if (value < 1) value = 1;
    if (value > 25) value = 25;
    this.value = value;
    caesarKeyRange.value = value;
  });

  vigenereKey.addEventListener('input', function () {
    let value = this.value.replace(/[^a-zA-Zа-яА-ЯёЁ]/g, '');
    value = value.toUpperCase();
    this.value = value;
  });

  // currentMode (radios)
  caesarRadios.forEach(radio => {
    radio.addEventListener('change', function () {
      currentMode = this.value;
      console.log(`Vigenere cipher: ${currentMode}`);
    })
  });

  vigenereRadios.forEach(radio => {
    radio.addEventListener('change', function () {
      currentMode = this.value;
      console.log(`Caesar cipher: ${currentMode}`);
    })
  });

  // executeBtns
  caesarExecuteBtn.addEventListener('click', function () {
    const text = caesarInput.value;
    const shift = parseInt(caesarKey.value);

    if (!text.trim()) {
      alert("Enter text to be processed or select a file");
      return;
    }

    let result = '';

    result = caesarCipher(text, shift);

    caesarResult.value = result;
  });

  vigenereExecuteBtn.addEventListener('click', function () {
    const text = vigenereInput.value;
    const key = vigenereKey.value;

    if (!text.trim()) {
      alert("Enter text to be processed or select a file");
      return;
    }

    // if (!key.trim()) {
    //   alert('Введите ключ (слово или фразу)!');
    //   return;
    // }

    let result = '';

    result = vigenereCipher(text, key);

    vigenereResult.value = result;
  });

  // files
  loadFileBtn.addEventListener('click', function () {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".txt,.cpp,.md,.xml,.html,.css,.js,.py";

    fileInput.addEventListener('change', function (event) {
      const file = event.target.files[0];
      if (!file) return;

      currentFile = file;
      currentFileInfo.textContent = `Loaded: ${file.name}`;

      const reader = new FileReader();
      reader.onload = function (e) {
        const content = e.target.result;

        if (currentCipher === 'caesar') {
          caesarInput.value = content;
        } else {
          vigenereInput.value = content;
        }
      }
      reader.readAsText(file);
    });

    fileInput.click();
  });

  clearTextBtn.addEventListener('click', function () {
    if (currentCipher === 'caesar') {
      caesarInput.value = '';
      caesarResult.value = '';
    } else {
      vigenereInput.value = '';
      vigenereResult.value = '';
    }
    currentFile = null;
    currentFileInfo = 'File not selected';
  });

  saveResultBtn.addEventListener('click', function () {
    let result, filename;

    if (currentCipher === 'caesar') {
      result = caesarResult.value;
      filename = currentFile ? `caesar_${currentFile.name}` : 'caesar_result.txt';
    } else {
      result = vigenereResult.value;
      filename = currentFile ? `vigenere_${currentFile.name}` : 'vigenere_result.txt';
    }

    if (!result.trim()) {
      alert("No results to save");
      return;
    }

    const blob = new Blob([result], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  copyResultBtn.addEventListener('click', function () {
    let result;

    if (currentCipher === 'caesar') {
      result = caesarResult.value;
    } else {
      result = vigenereResult.value;
    }

    if (!result.trim()) {
      alert('No results to copy');
      return;
    }

    navigator.clipboard.writeText(result).then(() => {
      alert('The result has been copied to the clipboard.');
    })
      .catch(err => {
        alert(`Copy error: ${err}`);
      });
  });


  // Caesar Cipher
  function caesarCipher(text, shift) {
    if (!text.trim()) return '';

    let result = '';
    let mode = true;

    if (currentMode === 'decrypt') mode = false;
    else mode = true;

    shift = mode ? shift : -shift;

    for (let i = 0; i < text.length; i++) {
      let char = text[i];

      if (char.match(/[a-z]/i)) {
        let code = text.charCodeAt(i);

        let base = code >= 65 && code <= 90 ? 65 : 97;

        let newCode = ((code - base + shift) % 26 + 26) % 26 + base;

        result += String.fromCharCode(newCode);
      } else {
        result += char;
      }
    }
    return result;
  }

  // Vigenere Cipher
  function vigenereCipher(text, key) {
    if (!text.trim()) return '';

    key = key.toUpperCase().replace(/[^A-Z]/g, '');

    if (key.length === 0) return 'The key must contain letters';

    let result = '';
    let keyIndex = 0;

    for (let i = 0; i < text.length; i++) {
      let char = text[i];

      if (char.match(/[a-z]/i)) {
        let code = text.charCodeAt(i);
        let isUpperCase = code >= 65 && code <= 90;
        let base = isUpperCase ? 65 : 97;

        let keyChar = key[keyIndex % key.length];

        let keyShift = keyChar.charCodeAt(0) - 65;

        if (currentMode === 'decrypt') mode = false;
        else mode = true;

        let shift = mode ? keyShift : -keyShift;

        let newCode = ((code - base + shift) % 26 + 26) % 26 + base;

        result += String.fromCharCode(newCode);
        keyIndex++;
      } else {
        result += char;
      }
    }
    return result;
  }

})