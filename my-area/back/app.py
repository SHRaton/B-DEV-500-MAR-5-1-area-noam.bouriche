from flask import Flask, request, jsonify, session, redirect, url_for
from flask_cors import CORS
from database.new_user import register_user
from database.auth_user import login_user
from werkzeug.security import check_password_hash
from authlib.integrations.flask_client import OAuth
import sqlite3
import os

app = Flask(__name__)
app.secret_key = 'ratonisthegoat'
CORS(app, supports_credentials=True)

app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = True

# Configuration Google OAuth
oauth = OAuth(app)
google = oauth.register(
    name='google',
    client_id='397889780411-7qjhkmiccbbkunq9g004gut7sui938ad.apps.googleusercontent.com',
    client_secret='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',
    access_token_url='https://oauth2.googleapis.com/token',
    authorize_url='https://accounts.google.com/o/oauth2/auth',
    api_base_url='https://www.googleapis.com/oauth2/v1/',
    client_kwargs={
        'scope': 'openid profile email',
        'response_type': 'code',
    },
    jwks_uri='https://www.googleapis.com/oauth2/v3/certs',
)

def get_db_connection():
    db_path = os.path.join(os.path.dirname(__file__), 'database', 'database.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/get-user-info', methods=['GET'])
def get_user_info():
    if 'user' not in session:
        return jsonify({"error": "User not authenticated"}), 401
    
    user = session.get('user')
    
    if not user or 'id' not in user:
        return jsonify({"error": "Invalid session data"}), 400

    user_id = user['id']

    conn = get_db_connection()
    user_data = conn.execute('SELECT id, username, email, discord_id, spotify_id, twitch_id, riot_games_id FROM users WHERE id = ?', (user_id,)).fetchone()
    conn.close()

    if user_data:
        user_info = dict(user_data)
        return jsonify(user_info), 200
    else:
        return jsonify({"error": "User not found"}), 404


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

    return jsonify({"authenticated": True, "message": "Connexion reussie", "user": user_data}), 200

@app.route('/login/google')
def google_login():
    redirect_uri = url_for('google_authorize', _external=True)
    return google.authorize_redirect(redirect_uri)

@app.route('/auth/google/callback')
def google_authorize():
    token = google.authorize_access_token()
    user_info = google.get('userinfo').json()
    
    conn = get_db_connection()
    
    user = conn.execute('SELECT * FROM users WHERE email = ?', (user_info['email'],)).fetchone()
    
    if not user:
        conn.execute(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            (user_info['name'], user_info['email'], '')  # Utilisation d'une chaîne vide pour le mot de passe
        )
        conn.commit()

        user = conn.execute('SELECT * FROM users WHERE email = ?', (user_info['email'],)).fetchone()
    
    conn.close()

    user_data = {"id": user['id'], "email": user['email']}
    session['user'] = user_data

    return redirect('http://localhost:8081/home')

@app.route('/home')
def home():
    if 'user' in session:
        return f"Bienvenue sur la page d'accueil, {session['user']['email']} !"
    else:
        return "Vous n'êtes pas connecté."

@app.route('/check-auth', methods=['GET'])
def check_auth():
    if 'user' in session:
        return jsonify({"authenticated": True}), 200
    else:
        return jsonify({"authenticated": False}), 401

@app.route('/logout', methods=['POST'])
def logout():
    session.pop('user', None)
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

@app.route('/favicon.ico')
def favicon():
    return '', 204

if __name__ == '__main__':
    app.run(debug=True)
