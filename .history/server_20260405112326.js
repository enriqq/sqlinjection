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
        if (err) {
            res.send(`<span style='color:red'>Error en la consulta: ${err.message}</span>`);
        } else if (row) {
            res.send("<span style='color:green'>¡Acceso concedido! (vulnerable)</span>");
        } else {
            res.send("<span style='color:red'>Acceso denegado (vulnerable)</span>");
        }
        db.close();
    });
});

app.listen(PORT, () => {
    initDb();
    console.log(`Servidor iniciado en http://localhost:${PORT}/login.html`);
});
