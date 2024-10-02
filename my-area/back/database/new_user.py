import sqlite3
import os
from flask import jsonify

DB_PATH = os.path.join(os.path.dirname(__file__), 'database.db')

def register_user(request):
    data = request.get_json()
    
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    # Vérification des champs obligatoires
    if not username or not email or not password:
        print("Erreur: Champs manquants")
        return jsonify({"error": "Pseudo, email et mot de passe sont obligatoires"}), 400

    # Connexion à la base de données
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Vérification si l'utilisateur existe déjà
    cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
    user = cursor.fetchone()
    if user:
        print("Erreur: Email déjà existant")
        return jsonify({"error": "Un utilisateur avec cet email existe déjà"}), 400

    # Insérer un nouvel utilisateur dans la base de données
    cursor.execute('''
        INSERT INTO users (username, email, password)
        VALUES (?, ?, ?)
    ''', (username, email, password))

    conn.commit()
    cursor.close()
    conn.close()

    print("Utilisateur ajouté avec succès")

    return jsonify({"message": "Utilisateur ajouté avec succès"}), 201
