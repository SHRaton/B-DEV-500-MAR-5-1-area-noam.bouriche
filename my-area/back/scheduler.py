import sqlite3
import os
import time
import pandas as pd
from api_conn.twitch_api import is_streaming

# Chemin vers la base de données SQLite
DB_PATH = os.path.join(os.path.dirname(__file__), './database/database.db')

def get_all_areas():
    """
    Récupère toutes les lignes de la table areas.
    :return: DataFrame contenant toutes les areas
    """
    conn = sqlite3.connect(DB_PATH)
    query = "SELECT * FROM areas"
    areas_df = pd.read_sql_query(query, conn)
    conn.close()
    return areas_df

def check_reactions():
    """
    Vérifie la première réaction (reaction_1) pour chaque area.
    Si reaction_1 est 'Twitch', il appelle la fonction is_streaming.
    """
    areas = get_all_areas()

    for _, area in areas.iterrows():
        reaction_1 = area['reaction_1']
        if reaction_1 == 'Twitch':
            user_id = area['user_id']  # Exemple de récupération de user_id pour une future utilisation
            is_active = is_streaming(user_id)  # Vérifie si le streamer est en live
            print(f"User {user_id} is streaming: {is_active}")
        else:
            print(f"No action for reaction_1: {reaction_1}")

def start_scheduler():
    """
    Démarre un scheduler qui vérifie chaque minute les réactions des areas.
    """
    print('Scheduler started...')
    while True:
        print("Checking reactions...")
        check_reactions()
        time.sleep(60)

if __name__ == '__main__':
    start_scheduler()
