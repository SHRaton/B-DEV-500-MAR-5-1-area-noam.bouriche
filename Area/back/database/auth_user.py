import sqlite3
import os
from flask import jsonify, session

DB_PATH = os.path.join(os.path.dirname(__file__), 'database.db')

def login_user(request):
    data = request.get_json()

    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email et mot de passe sont obligatoires"}), 400

    # Connexion à la base de données
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Vérification si l'utilisateur existe
    cursor.execute('SELECT * FROM users WHERE email = ? AND password = ?', (email, password))
    user = cursor.fetchone()
    cursor.close()
    conn.close()

    if user:
        # Stocker l'utilisateur dans la session
        session['user'] = {
            'email': user[2]  # Utilise les indices corrects pour les données de l'utilisateur
        }
        return jsonify({"message": "Connexion réussie", "authenticated": True}), 200
    else:
        return jsonify({"error": "Email ou mot de passe incorrect"}), 401
