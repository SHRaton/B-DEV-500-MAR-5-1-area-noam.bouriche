import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'database.db')

def destroy_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute('DROP TABLE IF EXISTS users')

    conn.commit()
    cursor.close()
    conn.close()

if __name__ == '__main__':
    choice = input("Êtes-vous sûr de vouloir supprimer la base de données ? Y/n\n")
    if choice.lower() == 'y':
        destroy_db()
        print("Base de données supprimée avec succès")
    else:
        print("Opération annulée")
        

