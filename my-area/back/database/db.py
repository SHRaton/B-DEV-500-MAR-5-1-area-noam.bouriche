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
            password TEXT NOT NULL,
            discord_id TEXT,
            telegram_id TEXT,
            spotify_id TEXT,
            twitch_id TEXT,
            riot_games_id TEXT,
            bio TEXT
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS areas (
        isActive BOOLEAN DEFAULT 0,
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT NOT NULL,
        description TEXT,
        reaction_1 TEXT,
        reaction_1_info TEXT,
        reaction_2 TEXT,
        reaction_2_info TEXT,
        reaction_3 TEXT,
        reaction_3_info TEXT,
        reaction_4 TEXT,
        reaction_4_info TEXT,
        reaction_5 TEXT,
        reaction_5_info TEXT,
        reaction_6 TEXT,
        reaction_6_info TEXT,
        isPublic BOOLEAN DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    ''')

    conn.commit()
    cursor.close()
    conn.close()

    
if __name__ == '__main__':
    init_db()  # Exécuter cette fonction pour initialiser la base de données
    print('Database initialized.')  # Message de confirmation
    print(DB_PATH)
