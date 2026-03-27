class PasswordManager {
    constructor() {
        this.passwords = [];
        this.masterPassword = null;
        this.isLicensed = false;
    }

    checkLicense(licenseKey) {
        const validKeys = [
            "PWD-MGR-2026-A1B2",
            "PWD-MGR-2026-C3D4", 
            "PWD-MGR-2026-E5F6"
        ];

        if (!licenseKey) {
            return false;
        }

        this.isLicensed = validKeys.includes(licenseKey);
        return this.isLicensed;
    }

    setMasterPassword(password) {
        if (!this.isLicensed) {
            console.log("ОШИБКА: Требуется лицензия!");
            return false;
        }
        
        if (password.length < 8) {
            return false;
        }

        this.masterPassword = this.hashPassword(password);
        console.log("Мастер-пароль установлен");
        return true;
    }

    hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            hash = ((hash << 5) - hash) + password.charCodeAt(i);
            hash = hash & hash;
        }
        return hash.toString(16);
    }

    addPassword(service, username, password) {
        if (!this.masterPassword) {
            console.log("Сначала установите мастер-пароль");
            return false;
        }
        
        this.passwords.push({
            service: service,
            username: username,
            password: this.encodePassword(password),
            created: new Date().toISOString()
        });
        
        console.log(`Пароль для ${service} добавлен`);
        return true;
    }

    encodePassword(password) {
        return btoa(password);
    }

    decodePassword(encodedPassword) {
        return atob(encodedPassword);
    }

    getPassword(service) {
        if (!this.masterPassword) {
            console.log("Требуется мастер-пароль");
            return null;
        }
        
        const entry = this.passwords.find(p => p.service === service);
        if (entry) {
            return {
                service: entry.service,
                username: entry.username,
                password: this.decodePassword(entry.password)
            };
        }
        
        console.log(`Сервис ${service} не найден`);
        return null;
    }

    listServices() {
        if (!this.masterPassword) {
            console.log("Требуется мастер-пароль");
            return;
        }
        
        console.log("Сохраненные сервисы:");
        this.passwords.forEach(entry => {
            console.log(`- ${entry.service} (${entry.username})`);
        });
    }
}

function demo() {
    const pm = new PasswordManager();
    
    console.log("=== Менеджер паролей ===\n");

    const license = prompt("Введите лицензионный ключ:");
    if (!pm.checkLicense(license)) {
        alert("Недействительная лицензия! Программа будет закрыта.");
        return;
    }
    
    alert("Лицензия активирована!");

    const masterPwd = prompt("Установите мастер-пароль:");
    if (!pm.setMasterPassword(masterPwd)) {
        return;
    }

    pm.addPassword("github.com", "user@email.com", "ghp_secret123");
    pm.addPassword("gmail.com", "myemail@gmail.com", "gmail_pass456");
    pm.addPassword("netflix.com", "user@netflix.com", "netflix_pass789");

    pm.listServices();

    const service = prompt("Введите сервис для получения пароля:");
    const result = pm.getPassword(service);
    
    if (result) {
        alert(`Сервис: ${result.service}\nЛогин: ${result.username}\nПароль: ${result.password}`);
    }
    
    console.log("\nПрограмма завершена");
}

if (typeof window !== 'undefined') {
    demo();
} else {
    console.log("Запустите в браузере для работы с prompt/alert");
}