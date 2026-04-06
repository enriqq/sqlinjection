from flask import Flask, request, render_template_string
import sqlite3
import os

DB_NAME = 'users.db'

app = Flask(__name__)

def init_db():
    if os.path.exists(DB_NAME):
        os.remove(DB_NAME)
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute('''CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)''')
    c.execute("INSERT INTO users (username, password) VALUES ('admin', 'adminpass')")
    c.execute("INSERT INTO users (username, password) VALUES ('user', 'userpass')")
    conn.commit()
    conn.close()

@app.route('/', methods=['GET', 'POST'])
def login():
    message = ''
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        conn = sqlite3.connect(DB_NAME)
        c = conn.cursor()
        # VULNERABLE: No uses este método en producción
        query = f"SELECT * FROM users WHERE username = '{username}' AND password = '{password}'"
        print(f"[DEBUG] Ejecutando query: {query}")
        try:
            c.execute(query)
            result = c.fetchone()
            if result:
                message = '¡Acceso concedido! (vulnerable)'
            else:
                message = 'Acceso denegado (vulnerable)'
        except Exception as e:
            message = f'Error en la consulta: {e}'
        conn.close()
    return render_template_string('''
        <h2>Login Vulnerable a SQL Injection</h2>
        <form method="post">
            Usuario: <input type="text" name="username"><br>
            Contraseña: <input type="password" name="password"><br>
            <input type="submit" value="Entrar">
        </form>
        <p>{{message}}</p>
    ''', message=message)

if __name__ == "__main__":
    print("Inicializando base de datos...")
    init_db()
    app.run(debug=True)
