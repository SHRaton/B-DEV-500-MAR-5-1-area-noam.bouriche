# Fichier: my-area/back/api_conn/main.py

import sqlite3
import os

def get_db_connection():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    db_path = os.path.join(base_dir, 'database', 'database.db')

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def close_db_connection(conn):
    if conn:
        conn.close()

def get_all_table_data(table_name):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()

        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = [column[1] for column in cursor.fetchall()]

        cursor.execute(f"SELECT * FROM {table_name}")
        rows = cursor.fetchall()

        return columns, rows
    except Exception as e:
        print(f"Une erreur est survenue lors de la récupération des données: {e}")
        return None, None
    finally:
        close_db_connection(conn)

def main():
    table_name = "areas"
    columns, rows = get_all_table_data(table_name)

    if columns and rows:
        print(f"Données de la table '{table_name}':")
        print("Colonnes:", ", ".join(columns))
        print("\nDonnées:")
        for row in rows:
            print(dict(row))
    else:
        print(f"Aucune donnée trouvée dans la table '{table_name}' ou une erreur s'est produite.")

if __name__ == "__main__":
    main()