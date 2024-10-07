import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'database.db')

def add_area(user_id, name, description=None, reaction_1=None, reaction_2=None, reaction_3=None, reaction_4=None, reaction_5=None, reaction_6=None):
    """
    Ajoute une nouvelle area dans la base de données.

    :param user_id: ID de l'utilisateur auquel l'area est associée
    :param name: Nom de l'area
    :param description: Description de l'area (optionnelle)
    :param reaction_1: Première réaction (optionnelle)
    :param reaction_2: Deuxième réaction (optionnelle)
    :param reaction_3: Troisième réaction (optionnelle)
    :param reaction_4: Quatrième réaction (optionnelle)
    :param reaction_5: Cinquième réaction (optionnelle)
    :param reaction_6: Sixième réaction (optionnelle)
    :return: None
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Insertion de la nouvelle area
    cursor.execute('''
        INSERT INTO areas (user_id, name, description, reaction_1, reaction_2, reaction_3, reaction_4, reaction_5, reaction_6)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (user_id, name, description, reaction_1, reaction_2, reaction_3, reaction_4, reaction_5, reaction_6))

    conn.commit()
    cursor.close()
    conn.close()

    print(f"Area '{name}' ajoutée avec succès pour l'utilisateur ID {user_id}.")

if __name__ == '__main__':
    add_area(user_id=1, name='Area 1', description='Traduce a message and send it to discord', reaction_1='Deepl: trad-EN=txt, reaction_2=Discord: post-message=txt')
