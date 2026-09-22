const express = require('express');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const port = 3000;

const db = new sqlite3.Database('./database.db');

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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(helmet({
    contentSecurityPolicy: false,
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100 
});
app.use('/api/', limiter);

app.use(session({
    secret: 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));

app.post('/api/vulnerable/login', (req, res) => {
    const { username, password } = req.body;
    
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

app.get('/api/vulnerable/products', (req, res) => {
    const { search } = req.query;

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

app.get('/api/vulnerable/user/:id', (req, res) => {
    const userId = req.params.id;

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

app.post('/api/secure/login', (req, res) => {
    const { username, password } = req.body;

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

app.get('/api/secure/products', (req, res) => {
    const { search } = req.query;

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

app.get('/api/secure/user/:id', (req, res) => {
    const userId = req.params.id;

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

app.post('/api/secure/validate/login', (req, res) => {
    const { username, password } = req.body;

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

function escapeSqlString(str) {
    if (!str) return str;
    return str.replace(/'/g, "''");
}

app.post('/api/secure/escape/login', (req, res) => {
    const { username, password } = req.body;

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

app.listen(port, () => {
    console.log(`The server is running on http://localhost:${port}`);
});