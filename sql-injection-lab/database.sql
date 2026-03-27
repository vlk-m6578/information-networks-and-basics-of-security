-- Инициализация базы данных
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    email TEXT,
    is_admin INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    description TEXT
);

-- Вставка тестовых данных
INSERT OR IGNORE INTO users (username, password, email, is_admin) VALUES 
    ('admin', 'admin123', 'admin@example.com', 1),
    ('user1', 'password1', 'user1@example.com', 0),
    ('user2', 'password2', 'user2@example.com', 0);

INSERT OR IGNORE INTO products (name, price, description) VALUES 
    ('Laptop', 50000, 'Powerful gaming laptop'),
    ('Mouse', 1500, 'Wireless Mouse'),
    ('Keyboard', 3000, 'Mechanical keyboard');