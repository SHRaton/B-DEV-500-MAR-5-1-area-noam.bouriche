import sqlite3
import os

# Chemin vers la base de données SQLite
DB_PATH = os.path.join(os.path.dirname(__file__), 'database.db')

def add_area(isActive, isPublic, user_id, name, description=None, 
             reaction_1=None, reaction_1_info=None, reaction_2=None, reaction_2_info=None,
             reaction_3=None, reaction_3_info=None, reaction_4=None, reaction_4_info=None,
             reaction_5=None, reaction_5_info=None, reaction_6=None, reaction_6_info=None):
    """
    Ajoute une nouvelle area dans la base de données.

    :param isActive: Status d'activité ou de non-activité de l'area
    :param isPublic: Statut public ou privé de l'area
    :param user_id: ID de l'utilisateur auquel l'area est associée
    :param name: Nom de l'area
    :param description: Description de l'area (optionnelle)
    :param reaction_1: Première réaction (optionnelle)
    :param reaction_1_info: Infos supplémentaires pour la première réaction (optionnelle)
    :param reaction_2: Deuxième réaction (optionnelle)
    :param reaction_2_info: Infos supplémentaires pour la deuxième réaction (optionnelle)
    :param reaction_3: Troisième réaction (optionnelle)
    :param reaction_3_info: Infos supplémentaires pour la troisième réaction (optionnelle)
    :param reaction_4: Quatrième réaction (optionnelle)
    :param reaction_4_info: Infos supplémentaires pour la quatrième réaction (optionnelle)
    :param reaction_5: Cinquième réaction (optionnelle)
    :param reaction_5_info: Infos supplémentaires pour la cinquième réaction (optionnelle)
    :param reaction_6: Sixième réaction (optionnelle)
    :param reaction_6_info: Infos supplémentaires pour la sixième réaction (optionnelle)
    :return: None
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Insertion de la nouvelle area avec toutes les informations
    cursor.execute('''
        INSERT INTO areas (
            isActive, isPublic, user_id, name, description, 
            reaction_1, reaction_1_info, 
            reaction_2, reaction_2_info, 
            reaction_3, reaction_3_info, 
            reaction_4, reaction_4_info, 
            reaction_5, reaction_5_info, 
            reaction_6, reaction_6_info
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        isActive, isPublic, user_id, name, description, 
        reaction_1, reaction_1_info, 
        reaction_2, reaction_2_info, 
        reaction_3, reaction_3_info, 
        reaction_4, reaction_4_info, 
        reaction_5, reaction_5_info, 
        reaction_6, reaction_6_info
    ))

    conn.commit()
    cursor.close()
    conn.close()

    print(f"Area '{name}' ajoutée avec succès pour l'utilisateur ID {user_id}.")

if __name__ == '__main__':
    # Exemple d'ajout d'une area
    add_area(
        isActive=True,
        isPublic=True,
        user_id=1,
        name='Area 1',
        description='Traduce a message and send it to Discord',
        reaction_1='Deepl',
        reaction_1_info='Traduction du texte en anglais',
        reaction_2='Discord',
        reaction_2_info='message: "Hello, world!", channel: "general"',
    )
