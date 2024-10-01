import sqlite3
import os

# Chemin vers la base de données SQLite
DB_PATH = os.path.join(os.path.dirname(__file__), 'database.db')

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Création de la table `users` si elle n'existe pas déjà
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        )
    ''')

    conn.commit()
    cursor.close()
    conn.close()

if __name__ == '__main__':
    init_db()  # Exécuter cette fonction pour initialiser la base de données
