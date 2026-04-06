import sqlite3
import os

DB_NAME = 'users.db'

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

# Vulnerable login function
def vulnerable_login(username, password):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    query = f"SELECT * FROM users WHERE username = '{username}' AND password = '{password}'"
    print(f"[DEBUG] Ejecutando query: {query}")
    c.execute(query)
    result = c.fetchone()
    conn.close()
    return result

# Secure login function
def secure_login(username, password):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    query = "SELECT * FROM users WHERE username = ? AND password = ?"
    print(f"[DEBUG] Ejecutando query segura: {query}")
    c.execute(query, (username, password))
    result = c.fetchone()
    conn.close()
    return result

if __name__ == "__main__":
    print("Inicializando base de datos...")
    init_db()
    print("\n--- Prueba de SQL Injection (vulnerable) ---")
    user = input("Usuario: ")
    pwd = input("Contraseña: ")
    if vulnerable_login(user, pwd):
        print("¡Acceso concedido (vulnerable)!")
    else:
        print("Acceso denegado (vulnerable)")

    print("\n--- Prueba de SQL Injection (seguro) ---")
    user = input("Usuario: ")
    pwd = input("Contraseña: ")
    if secure_login(user, pwd):
        print("¡Acceso concedido (seguro)!")
    else:
        print("Acceso denegado (seguro)")
