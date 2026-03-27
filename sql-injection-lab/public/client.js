// Вкладки
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabId = btn.dataset.tab;
        
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(tabId).classList.add('active');
    });
});

// ============= УЯЗВИМЫЕ ФУНКЦИИ =============

async function vulnerableLogin() {
    const username = document.getElementById('vuln-username').value;
    const password = document.getElementById('vuln-password').value;
    const resultDiv = document.getElementById('vuln-login-result');
    
    try {
        const response = await fetch('/api/vulnerable/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            resultDiv.innerHTML = `<span class="success">Success!</span><br>
                                   User: ${data.user.username}<br>
                                   SQL:<br><code>${data.query}</code>`;
        } else {
            resultDiv.innerHTML = `<span class="error">Error: ${data.message}</span><br>
                                  SQL:<br><code>${data.query}</code>`;
        }
    } catch (error) {
        resultDiv.innerHTML = `<span class="error">Error: ${error.message}</span>`;
    }
}

async function vulnerableSearch() {
    const search = document.getElementById('vuln-search').value;
    const resultDiv = document.getElementById('vuln-products-result');
    
    try {
        const response = await fetch(`/api/vulnerable/products?search=${encodeURIComponent(search)}`);
        const data = await response.json();
        
        if (data.products) {
            resultDiv.innerHTML = `<span class="success">Found ${data.products.length} products</span><br>
                                   SQL:<br><code>${data.query}</code><br><br>
                                   ${data.products.map(p => `${p.name} - ${p.price}₽<br>${p.description}<br><br>`).join('')}`;
        } else {
            resultDiv.innerHTML = `<span class="error">Error: ${data.error}</span>`;
        }
    } catch (error) {
        resultDiv.innerHTML = `<span class="error">Error: ${error.message}</span>`;
    }
}

async function vulnerableGetUser() {
    const userId = document.getElementById('vuln-user-id').value;
    const resultDiv = document.getElementById('vuln-user-result');
    
    try {
        const response = await fetch(`/api/vulnerable/user/${userId}`);
        const data = await response.json();
        
        if (data.user) {
            resultDiv.innerHTML = `<span class="success">User found</span><br>
                                   SQL:<br><code>${data.query}</code><br><br>
                                   ID: ${data.user.id}<br>
                                   Username: ${data.user.username}<br>
                                   Email: ${data.user.email}<br>
                                   Admin: ${data.user.is_admin ? 'Yes' : 'No'}`;
        } else {
            resultDiv.innerHTML = `<span class="error">User not found</span><br>
                                   SQL:<br><code>${data.query}</code>`;
        }
    } catch (error) {
        resultDiv.innerHTML = `<span class="error">Error: ${error.message}</span>`;
    }
}

// ============= ЗАЩИЩЕННЫЕ ФУНКЦИИ =============

async function secureLogin() {
    const username = document.getElementById('secure-username').value;
    const password = document.getElementById('secure-password').value;
    const resultDiv = document.getElementById('secure-login-result');
    
    try {
        const response = await fetch('/api/secure/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            resultDiv.innerHTML = `<span class="success">Success!</span><br>
                                   User: ${data.user.username}<br>
                                   Admin: ${data.user.is_admin ? 'Yes' : 'No'}<br>
                                   <span class="success">Protection: Parameterized queries are used</span>`;
        } else {
            resultDiv.innerHTML = `<span class="error">Error: ${data.message}</span><br>
                                   <span class="success">Protection: Parameterized queries prevented SQL injection</span>`;
        }
    } catch (error) {
        resultDiv.innerHTML = `<span class="error">Error: ${error.message}</span>`;
    }
}

async function secureSearch() {
    const search = document.getElementById('secure-search').value;
    const resultDiv = document.getElementById('secure-products-result');
    
    try {
        const response = await fetch(`/api/secure/products?search=${encodeURIComponent(search)}`);
        const data = await response.json();
        
        if (data.products) {
            resultDiv.innerHTML = `<span class="success">Found ${data.products.length} products</span><br><br>
                                   ${data.products.map(p => `${p.name} - ${p.price}₽<br>${p.description}<br><br>`).join('')}`;
        } else {
            resultDiv.innerHTML = `<span class="error">Error: ${data.error}</span>`;
        }
    } catch (error) {
        resultDiv.innerHTML = `<span class="error">Error: ${error.message}</span>`;
    }
}

async function secureGetUser() {
    const userId = document.getElementById('secure-user-id').value;
    const resultDiv = document.getElementById('secure-user-result');
    
    try {
        const response = await fetch(`/api/secure/user/${userId}`);
        const data = await response.json();
        
        if (data.user) {
            resultDiv.innerHTML = `<span class="success">User founded</span><br><br>
                                   ID: ${data.user.id}<br>
                                   Username: ${data.user.username}<br>
                                   Email: ${data.user.email}<br>
                                   Admin: ${data.user.is_admin ? 'Yes' : 'No'}`;
        } else {
            resultDiv.innerHTML = `<span class="error">User not found</span>`;
        }
    } catch (error) {
        resultDiv.innerHTML = `<span class="error">Error: ${error.message}</span>`;
    }
}

// ============= ДЕМОНСТРАЦИЯ АТАК =============

async function demoAttack1() {
    const resultDiv = document.getElementById('attack1-result');
    
    try {
        const response = await fetch('/api/vulnerable/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: "admin' --", password: "anything" })
        });
        
        const data = await response.json();
        
        resultDiv.innerHTML = `<span class="warning">SQL injection has been performed!</span><br>
                               ${data.success ? 'Authentication bypass successful!' : 'The attack failed'}<br>
                               SQL:<br><code>${data.query}</code><br><br>
                               <span class="warning">Explaination: Comment -- commented out the password check, allowing login without a password</span>`;
    } catch (error) {
        resultDiv.innerHTML = `<span class="error">Error: ${error.message}</span>`;
    }
}

async function demoAttack2() {
    const resultDiv = document.getElementById('attack2-result');
    
    try {
        const response = await fetch(`/api/vulnerable/products?search=${encodeURIComponent("' OR '1'='1' --")}`);
        const data = await response.json();
        
        if (data.products) {
            resultDiv.innerHTML = `<span class="warning">SQL injection has been performed!</span><br>
                                   Retrieved all users: ${data.products.length}<br>
                                   SQL:<br><code>${data.query}</code><br><br>
                                   <span class="warning">Explaination: OR '1'='1' always true, which returns all records</span>`;
        }
    } catch (error) {
        resultDiv.innerHTML = `<span class="error">Error: ${error.message}</span>`;
    }
}

async function demoAttack3() {
    const resultDiv = document.getElementById('attack3-result');
    const userId = "1 UNION SELECT id, username, password, is_admin FROM users WHERE '1'='1";
    
    try {
        const response = await fetch(`/api/vulnerable/user/${encodeURIComponent(userId)}`);
        const data = await response.json();
        
        resultDiv.innerHTML = `<span class="warning">UNION SQL-injection has been performed!</span><br>
                               SQL:<br><code>${data.query}</code><br><br>
                               <span class="warning">Explaination: UNION allows you to merge results from another table, which can lead to data leakage</span>`;
        
        if (data.user) {
            resultDiv.innerHTML += `<br><span class="error">Data received: ${JSON.stringify(data.user, null, 2)}</span>`;
        }
    } catch (error) {
        resultDiv.innerHTML = `<span class="error">Error: ${error.message}</span>`;
    }
}