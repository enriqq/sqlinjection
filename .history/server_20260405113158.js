const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, 'users.db');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname)); // Para servir login.html

// Inicializar base de datos
function initDb() {
    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
    const db = new sqlite3.Database(DB_PATH);
    db.serialize(() => {
        db.run("CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)");
        db.run("INSERT INTO users (username, password) VALUES ('admin', 'adminpass')");
        db.run("INSERT INTO users (username, password) VALUES ('user', 'userpass')");
    });
    db.close();
}

app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const db = new sqlite3.Database(DB_PATH);
    // CONSULTA VULNERABLE
    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
    console.log('[DEBUG] Ejecutando:', query);
    db.get(query, (err, row) => {
        let resultHtml = '';
        let style = `<style>
            .result-box {
                margin-top: 1.5rem;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                font-size: 1.1rem;
                font-weight: 500;
                box-shadow: 0 2px 8px rgba(0,0,0,0.07);
                max-width: 350px;
                text-align: center;
                margin-left: auto;
                margin-right: auto;
            }
            .success {
                background: #dff9fb;
                color: #22a06b;
                border: 1.5px solid #22a06b;
            }
            .error {
                background: #fbeee6;
                color: #e17055;
                border: 1.5px solid #e17055;
            }
        </style>`;
        if (err) {
            resultHtml = `<div class='result-box error'>Error en la consulta: ${err.message}</div>`;
        } else if (row) {
            resultHtml = `<div class='result-box success'>¡Acceso concedido! (vulnerable)</div>`;
        } else {
            resultHtml = `<div class='result-box error'>Acceso denegado (vulnerable)</div>`;
        }
        res.send(style + resultHtml);
        db.close();
    });
});

app.listen(PORT, () => {
    initDb();
    console.log(`Servidor iniciado en http://localhost:${PORT}/login.html`);
});
