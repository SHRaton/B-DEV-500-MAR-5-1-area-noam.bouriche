from flask import Flask, request, jsonify, session, redirect, url_for
from flask_cors import CORS
from database.new_user import register_user
from database.auth_user import login_user
from database.add_area import add_area
from werkzeug.security import check_password_hash
from authlib.integrations.flask_client import OAuth
from scheduler import start_scheduler
import sqlite3
import os
import time

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
discord = oauth.register(
    name='discord',
    client_id='1296083559974572052',
    client_secret='XBeOoBuRaeqyPdGkIn0QBP8S5GxAiJU-',
    access_token_url='https://discord.com/api/oauth2/token',
    authorize_url='https://discord.com/api/oauth2/authorize',
    api_base_url='https://discord.com/api/',
    client_kwargs={'scope': 'identify email guilds'},
)

def get_db_connection():
    db_path = os.path.join(os.path.dirname(__file__), 'database', 'database.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/about.json', methods=['GET'])
def handle_about_json():
    client_ip = request.remote_addr
    current_time = int(time.time())

    response = {
        "client": {
            "host": client_ip
        },
        "server": {
            "current_time": current_time,
            "services": [
                {
                    "name": "Riot",
                    "actions": [
                        {
                            "name": "finish_game",
                            "description": "Detect when someone finishes a game"
                        },
                        {
                            "name": "change_rank",
                            "description": "Detect when someone changes rank"
                        }
                    ],
                    "reactions": []
                },
                {
                    "name": "Gecko",
                    "actions": [
                        {
                            "name": "bitcoin_increase",
                            "description": "Detect if Bitcoin price increases"
                        }
                    ],
                    "reactions": []
                },
                {
                    "name": "Twitch",
                    "actions": [
                        {
                            "name": "streamer_live",
                            "description": "Detect if a specific streamer goes live"
                        }
                    ],
                    "reactions": []
                },
                {
                    "name": "Discord",
                    "actions": [
                        {
                            "name": "receive_message",
                            "description": "Detect if the user receives a message"
                        }
                    ],
                    "reactions": [
                        {
                            "name": "send_private_message",
                            "description": "Send a private message"
                        },
                        {
                            "name": "send_channel_message",
                            "description": "Send a message in a channel"
                        }
                    ]
                },
                {
                    "name": "Weather",
                    "actions": [
                        {
                            "name": "detect_rain",
                            "description": "Detect if it's raining"
                        },
                        {
                            "name": "sunset_time",
                            "description": "Detect if it's sunset time"
                        }
                    ],
                    "reactions": []
                },
                {
                    "name": "Deeple",
                    "actions": [],
                    "reactions": [
                        {
                            "name": "translate_text",
                            "description": "Translate a text into the chosen language"
                        }
                    ]
                },
                {
                    "name": "Spotify",
                    "actions": [],
                    "reactions": [
                        {
                            "name": "get_playlists",
                            "description": "Retrieve user's playlists"
                        },
                        {
                            "name": "get_top_5_tracks",
                            "description": "Retrieve top 5 tracks of the user"
                        },
                        {
                            "name": "get_song_recommendations",
                            "description": "Retrieve 10 song recommendations from a song"
                        },
                        {
                            "name": "get_artist_recommendations",
                            "description": "Retrieve 10 artist recommendations from an artist"
                        },
                        {
                            "name": "get_latest_songs",
                            "description": "Retrieve the latest songs released"
                        }
                    ]
                },
                {
                    "name": "Telegram",
                    "actions": [],
                    "reactions": [
                        {
                            "name": "send_message",
                            "description": "Send a message"
                        }
                    ]
                }
            ]
        }
    }
    return jsonify(response)

@app.route('/get-user-info', methods=['GET'])
def get_user_info():
    if 'user' not in session:
        return jsonify({"error": "User not authenticated"}), 401
    
    user = session.get('user')
    
    if not user or 'id' not in user:
        return jsonify({"error": "Invalid session data"}), 400

    user_id = user['id']

    conn = get_db_connection()
    user_data = conn.execute('SELECT id, username, email, discord_id, spotify_id, twitch_id, riot_games_id, bio FROM users WHERE id = ?', (user_id,)).fetchone()
    conn.close()

    if user_data:
        user_info = dict(user_data)
        return jsonify(user_info), 200
    else:
        return jsonify({"error": "User not found"}), 404


@app.route('/register', methods=['POST'])
def handle_register():
    return register_user(request)

@app.route('/add-area', methods=['POST'])
def handle_add_area():
    data = request.json

    # Extraire les données du corps de la requête
    isActive = data.get('isActive', True)
    isPublic = data.get('isPublic', False)
    if 'user' not in session:
        return jsonify({"error": "User not authenticated"}), 401

    user = session.get('user')
    user_id = user['id']
    name = data.get('name')
    description = data.get('description')

    # Extraire les réactions et leurs informations
    reactions = []
    for i in range(1, 7):  # Pour les 6 réactions possibles
        reaction = data.get(f'reaction_{i}')
        reaction_info = data.get(f'reaction_{i}_info')
        if reaction:
            reactions.extend([reaction, reaction_info])
        else:
            reactions.extend([None, None])


    try:
        add_area(isActive, isPublic, user_id, name, description, *reactions)
        return jsonify({"message": "Area added successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/update-user-info', methods=['PUT'])
def update_user_info():
    if 'user' not in session:
        return jsonify({"error": "User not authenticated"}), 401

    user = session.get('user')
    user_id = user['id']

    data = request.get_json()
    new_username = data.get('username')
    new_email = data.get('email')
    new_bio = data.get('bio')

    conn = get_db_connection()

    update_fields = []
    params = []

    if new_username:
        update_fields.append('username = ?')
        params.append(new_username)

    if new_email:
        update_fields.append('email = ?')
        params.append(new_email)

    if new_bio:
        update_fields.append('bio = ?')
        params.append(new_bio)

    if not update_fields:
        return jsonify({"error": "No valid data provided to update"}), 400

    params.append(user_id)

    query = f'UPDATE users SET {", ".join(update_fields)} WHERE id = ?'

    conn.execute(query, params)
    conn.commit()
    conn.close()

    if new_email:
        session['user']['email'] = new_email

    return jsonify({"message": "User info updated successfully"}), 200


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

@app.route('/login/discord')
def discord_login():
    redirect_uri2 = url_for('discord_authorize', _external=True)
    return discord.authorize_redirect(redirect_uri2)

@app.route('/auth/discord/callback')
def discord_authorize():
    token_discord = discord.authorize_access_token()
    user_info_discord = discord.get('users/@me').json()  # Obtenez les informations de l'utilisateur

    access_token = token_discord['access_token']
    user = session.get('user')
    user_id = user['id']

    if user_id:
        conn = get_db_connection()
        
        # Mettre à jour le token discord pour l'utilisateur connecté dans la base de données
        conn.execute('UPDATE users SET discord_id = ? WHERE id = ?', (access_token, user_id))
        conn.commit()
        conn.close()

        print('Token Discord :', token_discord)
        print('Discord token successfully saved for user:', user_id)
        print('User Discord Info:', user_info_discord)
    else:
        print('Error: No user_id found in session')

    return redirect('http://localhost:8081/link_accounts')

# Route pour vérifier la connexion Discord
@app.route('/is-connected-discord', methods=['GET'])
def is_connected_discord():
    if 'user' not in session:
        return jsonify({"connected": False, "error": "User not logged in"}), 401
    
    user_id = session['user']['id']
    
    conn = get_db_connection()
    user = conn.execute('SELECT discord_id FROM users WHERE id = ?', (user_id,)).fetchone()
    conn.close()

    if user and user['discord_id']:  # Vérifie si le champ discord_id n'est pas vide
        return jsonify({"connected": True})
    else:
        return jsonify({"connected": False})

# Route pour vérifier la connexion Telegram
@app.route('/is-connected-telegram', methods=['GET'])
def is_connected_telegram():
    if 'user' not in session:
        return jsonify({"connected": False, "error": "User not logged in"}), 401
    
    user_id = session['user']['id']
    
    conn = get_db_connection()
    user = conn.execute('SELECT telegram_id FROM users WHERE id = ?', (user_id,)).fetchone()
    conn.close()

    if user and user['telegram_id']:  # Vérifie si le champ telegram_id n'est pas vide
        return jsonify({"connected": True})
    else:
        return jsonify({"connected": False})

# Route pour vérifier la connexion Spotify
@app.route('/is-connected-spotify', methods=['GET'])
def is_connected_spotify():
    if 'user' not in session:
        return jsonify({"connected": False, "error": "User not logged in"}), 401
    
    user_id = session['user']['id']
    
    conn = get_db_connection()
    user = conn.execute('SELECT spotify_id FROM users WHERE id = ?', (user_id,)).fetchone()
    conn.close()

    if user and user['spotify_id']:  # Vérifie si le champ spotify_id n'est pas vide
        return jsonify({"connected": True})
    else:
        return jsonify({"connected": False})

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
    add_area(True, user_id, "zobi", "action1", "react1", "react2", "react3", None, None, None)
    
    conn = get_db_connection()
    areas = conn.execute('SELECT * FROM areas WHERE user_id = ?', (user_id,)).fetchall()
    conn.close()
    
    areas_list = [dict(area) for area in areas]
    return jsonify(areas_list), 200

@app.route('/update-area-status', methods=['PUT'])
def update_area_status():
    if 'user' not in session:
        return jsonify({"error": "User not authenticated"}), 401

    user = session.get('user')
    user_id = user['id']

    data = request.get_json()
    area_id = data.get('areaId')
    is_active = data.get('isActive')

    conn = get_db_connection()
    conn.execute(
        'UPDATE areas SET isActive = ? WHERE id = ? AND user_id = ?',
        (is_active, area_id, user_id)
    )
    conn.commit()
    conn.close()

    return jsonify({"message": "Area status updated successfully"}), 200


@app.route('/favicon.ico')
def favicon():
    return '', 204

if __name__ == '__main__':

    app.run(debug=True)
