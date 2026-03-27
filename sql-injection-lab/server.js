const express = require('express');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const port = 3000;

// Подключение к базе данных
const db = new sqlite3.Database('./database.db');

// Инициализация базы данных
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT,
        is_admin INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        description TEXT
    )`);

    // Добавление тестовых данных
    db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
        if (row.count === 0) {
            db.run("INSERT INTO users (username, password, email, is_admin) VALUES (?, ?, ?, ?)", 
                ['admin', 'admin123', 'admin@example.com', 1]);
            db.run("INSERT INTO users (username, password, email, is_admin) VALUES (?, ?, ?, ?)", 
                ['user1', 'password1', 'user1@example.com', 0]);
            db.run("INSERT INTO users (username, password, email, is_admin) VALUES (?, ?, ?, ?)", 
                ['user2', 'password2', 'user2@example.com', 0]);
            
            db.run("INSERT INTO products (name, price, description) VALUES (?, ?, ?)", 
                ['Ноутбук', 50000, 'Мощный игровой ноутбук']);
            db.run("INSERT INTO products (name, price, description) VALUES (?, ?, ?)", 
                ['Мышь', 1500, 'Беспроводная мышь']);
            db.run("INSERT INTO products (name, price, description) VALUES (?, ?, ?)", 
                ['Клавиатура', 3000, 'Механическая клавиатура']);
        }
    });
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(helmet({
    contentSecurityPolicy: false, // Отключаем для демонстрации
}));

// Лимитер запросов
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 100 // максимум 100 запросов
});
app.use('/api/', limiter);

app.use(session({
    secret: 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Для демонстрации
}));

// ============= НЕЗАЩИЩЕННЫЕ ЭНДПОИНТЫ (уязвимые к SQL-инъекциям) =============

// Уязвимый вход в систему
app.post('/api/vulnerable/login', (req, res) => {
    const { username, password } = req.body;
    
    // ОПАСНО! Прямая конкатенация строк - уязвимо для SQL-инъекций
    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
    
    console.log('Vulnerable query:', query);
    
    db.get(query, (err, user) => {
        if (err) {
            res.json({ success: false, error: err.message });
            return;
        }
        
        if (user) {
            req.session.user = user;
            res.json({ success: true, user: user, query: query });
        } else {
            res.json({ success: false, message: 'Incorrect credentials', query: query });
        }
    });
});

// Уязвимый поиск продуктов
app.get('/api/vulnerable/products', (req, res) => {
    const { search } = req.query;
    
    // ОПАСНО! Уязвимо для SQL-инъекций
    const query = `SELECT * FROM products WHERE name LIKE '%${search}%' OR description LIKE '%${search}%'`;
    
    console.log('Vulnerable products query:', query);
    
    db.all(query, (err, products) => {
        if (err) {
            res.json({ error: err.message });
            return;
        }
        res.json({ products: products, query: query });
    });
});

// Уязвимый просмотр пользователя
app.get('/api/vulnerable/user/:id', (req, res) => {
    const userId = req.params.id;
    
    // ОПАСНО! Уязвимо для SQL-инъекций
    // Исправлено: добавляем пробелы и корректный синтаксис
    const query = `SELECT id, username, email, is_admin FROM users WHERE id = ${userId}`;
    
    console.log('Vulnerable user query:', query);
    
    db.get(query, (err, user) => {
        if (err) {
            console.error('Error:', err);
            res.json({ error: err.message, query: query });
            return;
        }
        
        if (user) {
            res.json({ user: user, query: query });
        } else {
            res.json({ message: 'User not found', query: query });
        }
    });
});

// ============= ЗАЩИЩЕННЫЕ ЭНДПОИНТЫ (с использованием параметризованных запросов) =============

// Защищенный вход в систему (параметризованные запросы)
app.post('/api/secure/login', (req, res) => {
    const { username, password } = req.body;
    
    // БЕЗОПАСНО! Используем параметризованный запрос
    const query = `SELECT * FROM users WHERE username = ? AND password = ?`;
    
    console.log('Secure query (parameterized):', query);
    
    db.get(query, [username, password], (err, user) => {
        if (err) {
            res.json({ success: false, error: err.message });
            return;
        }
        
        if (user) {
            req.session.user = user;
            res.json({ success: true, user: user });
        } else {
            res.json({ success: false, message: 'Incorrect credentials' });
        }
    });
});

// Защищенный поиск продуктов (параметризованные запросы)
app.get('/api/secure/products', (req, res) => {
    const { search } = req.query;
    
    // БЕЗОПАСНО! Используем параметризованный запрос
    const query = `SELECT * FROM products WHERE name LIKE ? OR description LIKE ?`;
    const searchPattern = `%${search}%`;
    
    console.log('Secure products query:', query);
    
    db.all(query, [searchPattern, searchPattern], (err, products) => {
        if (err) {
            res.json({ error: err.message });
            return;
        }
        res.json({ products: products });
    });
});

// Защищенный просмотр пользователя (параметризованные запросы)
app.get('/api/secure/user/:id', (req, res) => {
    const userId = req.params.id;
    
    // БЕЗОПАСНО! Используем параметризованный запрос
    const query = `SELECT id, username, email, is_admin FROM users WHERE id = ?`;
    
    console.log('Secure user query:', query);
    
    db.get(query, [userId], (err, user) => {
        if (err) {
            res.json({ error: err.message });
            return;
        }
        res.json({ user: user });
    });
});

// ============= ДОПОЛНИТЕЛЬНЫЕ МЕТОДЫ ЗАЩИТЫ =============

// 1. Валидация входных данных
app.post('/api/secure/validate/login', (req, res) => {
    const { username, password } = req.body;
    
    // Валидация длины и допустимых символов
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    const passwordRegex = /^[a-zA-Z0-9!@#$%^&*]{6,50}$/;
    
    if (!usernameRegex.test(username)) {
        res.json({ success: false, message: 'Username must contain only letters, numbers and _, and be 3-20 characters long' });
        return;
    }
    
    if (!passwordRegex.test(password)) {
        res.json({ success: false, message: 'The password must contain only valid characters, 6-50 characters in length' });
        return;
    }
    
    // Используем параметризованный запрос
    const query = `SELECT * FROM users WHERE username = ? AND password = ?`;
    
    db.get(query, [username, password], (err, user) => {
        if (err) {
            res.json({ success: false, error: err.message });
            return;
        }
        
        if (user) {
            req.session.user = user;
            res.json({ success: true, user: user });
        } else {
            res.json({ success: false, message: 'Incorrect credentials' });
        }
    });
});

// 2. Экранирование спецсимволов
function escapeSqlString(str) {
    if (!str) return str;
    return str.replace(/'/g, "''");
}

app.post('/api/secure/escape/login', (req, res) => {
    const { username, password } = req.body;
    
    // Экранируем спецсимволы
    const escapedUsername = escapeSqlString(username);
    const escapedPassword = escapeSqlString(password);
    
    const query = `SELECT * FROM users WHERE username = '${escapedUsername}' AND password = '${escapedPassword}'`;
    
    console.log('Escaped query:', query);
    
    db.get(query, (err, user) => {
        if (err) {
            res.json({ success: false, error: err.message });
            return;
        }
        
        if (user) {
            req.session.user = user;
            res.json({ success: true, user: user });
        } else {
            res.json({ success: false, message: 'Incorrect credentials' });
        }
    });
});

// 3. Использование хранимых процедур (эмуляция)
app.post('/api/secure/stored-proc/login', (req, res) => {
    const { username, password } = req.body;
    
    // Эмуляция хранимой процедуры через функцию
    const query = `
        SELECT * FROM users 
        WHERE username = ? 
        AND password = ? 
        AND EXISTS (SELECT 1 FROM users WHERE username = ?)
    `;
    
    db.get(query, [username, password, username], (err, user) => {
        if (err) {
            res.json({ success: false, error: err.message });
            return;
        }
        
        if (user) {
            req.session.user = user;
            res.json({ success: true, user: user });
        } else {
            res.json({ success: false, message: 'Incorrect credentials' });
        }
    });
});

// 4. Принцип наименьших привилегий (демонстрация)
app.get('/api/secure/least-privilege/users', (req, res) => {
    if (!req.session.user || req.session.user.is_admin !== 1) {
        res.json({ success: false, message: 'Access denied. Administrator privileges required.' });
        return;
    }
    
    const query = `SELECT id, username, email, is_admin FROM users`;
    
    db.all(query, [], (err, users) => {
        if (err) {
            res.json({ error: err.message });
            return;
        }
        res.json({ users: users });
    });
});

// ============= МОНИТОРИНГ И ЛОГИРОВАНИЕ =============

// Логирование подозрительных запросов
const suspiciousPatterns = [
    /('|\b)(OR|AND|UNION|SELECT|INSERT|DELETE|UPDATE|DROP|CREATE|ALTER)\b/i,
    /(--|#|\/\*)/,
    /;.*('|")/,
    /('|\b)(exec|execute|xp_cmdshell)\b/i
];

app.use((req, res, next) => {
    if (req.query && Object.keys(req.query).length > 0) {
        const suspicious = Object.values(req.query).some(value => 
            suspiciousPatterns.some(pattern => pattern.test(String(value)))
        );
        
        if (suspicious) {
            console.log(`[WARNING] Suspicious request from ${req.ip}: ${req.method} ${req.url}`);
            console.log('Query params:', req.query);
        }
    }
    
    if (req.body && Object.keys(req.body).length > 0) {
        const suspicious = Object.values(req.body).some(value => 
            suspiciousPatterns.some(pattern => pattern.test(String(value)))
        );
        
        if (suspicious) {
            console.log(`[WARNING] Suspicious request body from ${req.ip}: ${req.method} ${req.url}`);
            console.log('Body:', req.body);
        }
    }
    
    next();
});

app.listen(port, () => {
    console.log(`The server is running on http://localhost:${port}`);
    console.log('SQL Injection Lab');
});