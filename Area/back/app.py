from flask import Flask, request, jsonify, session
from flask_cors import CORS
from database.new_user import register_user
from database.auth_user import login_user
from werkzeug.security import check_password_hash
import sqlite3

app = Flask(__name__)
app.secret_key = 'ratonisthegoat'
CORS(app, supports_credentials=True)

app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = True

def get_db_connection():
    conn = sqlite3.connect('database/database.db')  # Assure-toi que le chemin vers ta base de données est correct
    conn.row_factory = sqlite3.Row  # Cela permet d'accéder aux colonnes par leur nom
    return conn

@app.route('/register', methods=['POST'])
def handle_register():
    return register_user(request)

@app.route('/login', methods=['POST'])
def handle_login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    conn = get_db_connection()

    user = conn.execute('SELECT * FROM users WHERE email = ?', (email,)).fetchone()
    conn.close()

    if user is None:
        return jsonify({"authenticated": False, "error": "Utilisateur non trouvé"}), 404

    if user['password'] != password:
        return jsonify({"authenticated": False, "error": "Mot de passe incorrect"}), 401

    user_data = {"id": user['id'], "email": user['email']}
    session['user'] = user_data

    return jsonify({"authenticated": True, "message": "Connexion réussie", "user": user_data}), 200





@app.route('/check-auth', methods=['GET'])
def check_auth():
    if 'user' in session:
        return jsonify({"authenticated": True}), 200
    else:
        return jsonify({"authenticated": False}), 401

@app.route('/logout', methods=['POST'])
def logout():
    session.pop('user', None)
    print("Déconnexion réussie")
    return jsonify({"message": "Déconnexion réussie"}), 200

@app.route('/get-areas', methods=['GET'])
def get_areas():
    if 'user' not in session:
        return jsonify({"error": "User not authenticated"}), 401
    
    user = session.get('user')
    
    if not user or 'id' not in user:
        return jsonify({"error": "Invalid session data"}), 400
    
    user_id = user['id']
    
    conn = get_db_connection()
    areas = conn.execute('SELECT * FROM areas WHERE user_id = ?', (user_id,)).fetchall()
    conn.close()
    
    areas_list = [dict(area) for area in areas]
    return jsonify(areas_list), 200

if __name__ == '__main__':
    app.run(debug=True)
