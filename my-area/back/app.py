from flask import Flask, request, jsonify, session, redirect, url_for, send_from_directory
from itsdangerous import URLSafeTimedSerializer, SignatureExpired
from authlib.integrations.flask_client import OAuth
from werkzeug.security import check_password_hash
from email.mime.multipart import MIMEMultipart
from database.new_user import register_user
from database.auth_user import login_user
from database.add_area import add_area
from scheduler import start_scheduler
from email.mime.text import MIMEText
from flask_cors import CORS
import sqlite3
import smtplib
import time
import os
import requests

app = Flask(__name__)
app.secret_key = 'ratonisthegoat'
CORS(app, supports_credentials=True, origins=['http://localhost:8081'])

FILE_DIRECTORY = '../assets/sdk'
FILENAME = 'area.apk'

app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = True
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'areaservices0@gmail.com'  # Remplacez par votre email Gmail
app.config['MAIL_PASSWORD'] = 'aicw rljl qxbn ixtb'  # Utiliser un mot de passe d'application Google
app.config['SECURITY_PASSWORD_SALT'] = 'sel_secret'  # Changez ceci pour votre propre sel secret

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

spotify = oauth.register(
    name='spotify',
    client_id='da8f8964454b472bb1954e06053a5ee7',
    client_secret='cb849a8828414ae58fbb4f9b97dbcbae',
    access_token_url='https://accounts.spotify.com/api/token',
    authorize_url='https://accounts.spotify.com/authorize',
    api_base_url='https://api.spotify.com/v1/',
    client_kwargs={
        'scope': 'user-read-private user-read-email playlist-read-private user-top-read',
        'show_dialog': 'true',  # Force l'affichage du dialogue de connexion
        'access_type': 'offline'  # Demande un refresh token
    }
)

def generate_confirmation_token(email):
    serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
    return serializer.dumps(email, salt=app.config['SECURITY_PASSWORD_SALT'])

def send_reset_email(user_email):
    token = generate_confirmation_token(user_email)
    reset_url = f'http://localhost:8081/reset-password/{token}'  # Ajustez l'URL selon votre frontend

    message = MIMEMultipart()
    message['From'] = app.config['MAIL_USERNAME']
    message['To'] = user_email
    message['Subject'] = "Réinitialisation de votre mot de passe"
    
    body = f'Pour réinitialiser votre mot de passe, cliquez sur le lien suivant : {reset_url}'
    message.attach(MIMEText(body, 'plain'))

    try:
        server = smtplib.SMTP(app.config['MAIL_SERVER'], app.config['MAIL_PORT'])
        server.starttls()
        server.login(app.config['MAIL_USERNAME'], app.config['MAIL_PASSWORD'])
        text = message.as_string()
        server.sendmail(app.config['MAIL_USERNAME'], user_email, text)
        server.quit()
        return True
    except Exception as e:
        print(f"Erreur lors de l'envoi du mail: {e}")
        raise

@app.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()  # Au lieu de request.form
    email = data.get('email')  # Utiliser .get() pour éviter l'erreur KeyError
    
    if not email:
        return jsonify({'error': 'Email is required'}), 400
        
    # Vérifiez si l'email existe dans la base de données
    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE email = ?', (email,)).fetchone()
    conn.close()
    
    if not user:
        return jsonify({'error': 'Email not found'}), 404
    
    try:
        send_reset_email(email)
        return jsonify({'message': 'Reset email sent successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Route pour traiter la réinitialisation du mot de passe
@app.route('/reset-password/<token>', methods=['GET', 'POST'])
def reset_password(token):
    try:
        serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
        email = serializer.loads(token, salt=app.config['SECURITY_PASSWORD_SALT'], max_age=3600)
        # Si le token est valide, permettre à l'utilisateur de changer son mot de passe
        if request.method == 'POST':
            new_password = request.form['new_password']
            # Logique pour changer le mot de passe dans la base de données
            return 'Mot de passe changé avec succès.'
        return render_template('reset_password.html')  # Formulaire pour entrer le nouveau mot de passe
    except Exception as e:
        return f"Le lien de réinitialisation est invalide ou a expiré : {e}"

@app.route('/login/spotify')
def spotify_login():
    redirect_uri = url_for('spotify_authorize', _external=True)
    return spotify.authorize_redirect(
        redirect_uri,
        show_dialog='true',  # Force l'affichage même si déjà connecté
        prompt='consent'  # Force la demande de consentement
    )

@app.route('/auth/spotify/callback')
def spotify_authorize():
    try:
        # Journalisation de la réponse d'autorisation
        token = spotify.authorize_access_token()
        print('Token reçu:', token)

        # Récupérer les informations de l'utilisateur
        resp = spotify.get('me', token=token)
        print('Réponse de /me:', resp)

        if resp.status_code != 200:
            print(f"Erreur dans la réponse de Spotify /me : {resp.text}")
            raise Exception("Erreur dans la récupération des informations de l'utilisateur.")

        user_info = resp.json()

        # Code pour stocker le token dans la base de données
        user = session.get('user')
        user_id = user['id']
        if user_id:
            conn = get_db_connection()
            conn.execute('UPDATE users SET spotify_id = ? WHERE id = ?', 
                         (token['access_token'], user_id))
            conn.commit()
            conn.close()
            print('Token Spotify :', token)
            print('Spotify token successfully saved for user:', user_id)
            print('User Spotify Info:', user_info)
        else:
            print('Error: No user_id found in session')
        return redirect('http://localhost:8081/link_accounts')

    except Exception as e:
        print(f"Error during Spotify authorization: {str(e)}")
        return redirect('http://localhost:8081/link_accounts')


def get_db_connection():
    db_path = os.path.join(os.path.dirname(__file__), 'database', 'database.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn


@app.route('/delete-area', methods=['POST'])
def delete_area():
    if 'user' not in session:
        return jsonify({"error": "User not authenticated"}), 401

    user = session.get('user')
    user_id = user['id']

    data = request.get_json()
    area_id = data.get('areaId')

    if not area_id:
        return jsonify({"error": "Area ID is required"}), 400

    try:
        conn = get_db_connection()
        # Vérifier que l'area appartient bien à l'utilisateur avant de la supprimer
        area = conn.execute('SELECT * FROM areas WHERE id = ? AND user_id = ?', 
                          (area_id, user_id)).fetchone()
        
        if not area:
            conn.close()
            return jsonify({"error": "Area not found or unauthorized"}), 404

        conn.execute('DELETE FROM areas WHERE id = ? AND user_id = ?', 
                    (area_id, user_id))
        conn.commit()
        conn.close()

        return jsonify({"message": "Area deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


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

@app.route('/area.apk', methods=['GET'])
def download_sdk():
    try:
        return send_from_directory(FILE_DIRECTORY, FILENAME, as_attachment=True)
    except FileNotFoundError:
        return "File not found", 404

@app.route('/get-user-info', methods=['GET'])
def get_user_info():
    if 'user' not in session:
        return jsonify({"error": "User not authenticated"}), 401
    
    user = session.get('user')
    
    if not user or 'id' not in user:
        return jsonify({"error": "Invalid session data"}), 400

    user_id = user['id']

    conn = get_db_connection()
    user_data = conn.execute('SELECT id, username, email, discord_id, spotify_id, twitch_id, bio, photo_id FROM users WHERE id = ?', (user_id,)).fetchone()
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
    print(data)

    # Extraire les données du corps de la requête
    isActive = data.get('isActive', True)
    isPublic = data.get('isPublic', False)
    if 'user' not in session:
        return jsonify({"error": "User not authenticated"}), 401

    user = session.get('user')
    user_id = user['id']
    name = data.get('name')
    description = data.get('description')

    action = data.get(f'selectedAction')
    action_info = data.get(f'selectedApiAction')

    # Extraire les réactions et leurs informations
    reactions = []
    for i in range(1, 7):  # Pour les 6 réactions possibles
        reaction = data.get(f'reaction_{i}')
        reaction_info = data.get(f'reaction_{i}_info')
        isActive_reaction = True
        if reaction:
            reactions.extend([reaction, reaction_info, isActive_reaction])
        else:
            reactions.extend([None, None, False])


    try:
        add_area(isActive, isPublic, user_id, name, description, action, action_info, *reactions)
        return jsonify({"message": "Area added successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/update-photo', methods=['PUT'])
def update_user_photo():
    if 'user' not in session:
        return jsonify({"error": "User not authenticated"}), 401

    user = session.get('user')
    user_id = user['id']

    data = request.get_json()
    print(data)
    new_photo_id = data.get('photo_id')

    conn = get_db_connection()

    update_fields = []
    params = []

    if new_photo_id is not None:  # Check if new_photo_id is provided
        update_fields.append('photo_id = ?')
        params.append(new_photo_id)

    if not update_fields:
        return jsonify({"error": "No valid data provided to update"}), 400

    params.append(user_id)

    query = f'UPDATE users SET {", ".join(update_fields)} WHERE id = ?'
    
    # Execute the query and commit the transaction
    conn.execute(query, params)
    conn.commit()
    
    conn.close()

    # Return a success response after the update
    return jsonify({"message": "Photo updated successfully"}), 200


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

    if 'username' in data:
        update_fields.append('username = ?')
        params.append(new_username)

    if 'email' in data:
        update_fields.append('email = ?')
        params.append(new_email)

    if 'bio' in data:
        update_fields.append('bio = ?')
        params.append(new_bio)

    if not update_fields:
        return jsonify({"error": "No valid data provided to update"}), 400

    params.append(user_id)

    query = f'UPDATE users SET {", ".join(update_fields)} WHERE id = ?'

    conn.execute(query, params)
    conn.commit()
    conn.close()

    if 'email' in data:
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

@app.route('/disconnect-telegram')
def disconnect_telegram():
    if 'user' not in session:
        return jsonify({"error": "User not authenticated"}), 401

    user_id = session['user']['id']
    try:
        conn = get_db_connection()
        conn.execute(
            "UPDATE users SET telegram_chat_id = ?, telegram_API_token = ? WHERE id = ?",
            (1646361418, '6808144152:AAE3pgrw2pUbqsXv2s-DtYcP4k2Sre5dd-c', user_id)
        )
        conn.commit()
        conn.close()
        return jsonify({"message": "Successfully disconnected from Telegram"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/disconnect-discord')
def disconnect_discord():
    if 'user' not in session:
        return jsonify({"error": "User not authenticated"}), 401

    user_id = session['user']['id']
    try:
        conn = get_db_connection()
        conn.execute(
            "UPDATE users SET discord_id = NULL WHERE id = ?",
            (user_id,)
        )
        conn.commit()
        conn.close()
        return jsonify({"message": "Successfully disconnected from Discord"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/disconnect-spotify')
def disconnect_spotify():
    if 'user' not in session:
        return jsonify({"error": "User not authenticated"}), 401

    user_id = session['user']['id']
    try:
        conn = get_db_connection()
        conn.execute(
            "UPDATE users SET spotify_id = NULL WHERE id = ?",
            (user_id,)
        )
        conn.commit()
        conn.close()
        return jsonify({"message": "Successfully disconnected from Spotify"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/connect-telegram', methods=['POST'])
def connect_telegram():
    if 'user' not in session:
        return jsonify({"error": "User not authenticated"}), 401
    
    data = request.get_json()
    chat_id = data.get('chatId')
    api_token = data.get('apiToken')
    
    if not chat_id or not api_token:
        return jsonify({"error": "Missing required fields"}), 400
    
    user_id = session['user']['id']
    
    try:
        conn = get_db_connection()
        conn.execute(
            'UPDATE users SET telegram_chat_id = ?, telegram_API_token = ? WHERE id = ?',
            (chat_id, api_token, user_id)
        )
        conn.commit()
        conn.close()
        
        return jsonify({"message": "Telegram connected successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

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

        # Récupération des guilds de l'utilisateur
        headers = {
            "Authorization": f"Bearer {access_token}"
        }
        guilds_response = requests.get("https://discord.com/api/v10/users/@me/guilds", headers=headers)
        if guilds_response.status_code == 200:
            guilds = guilds_response.json()
            print('Guilds:', guilds)
        else:
            print('Failed to retrieve guilds', guilds_response.status_code)

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

    if user and user['telegram_id'] and user['telegram_id'] != 1646361418:  # Vérifie si le champ telegram_id n'est pas vide
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
    
    conn = get_db_connection()
    # Mettre l'accent sur l'ordre décroissant pour avoir les plus récents en premier
    areas = conn.execute('''
        SELECT * FROM areas 
        WHERE user_id = ? 
        ORDER BY id DESC
    ''', (user_id,)).fetchall()
    conn.close()
    
    # Convertir en liste de dictionnaires
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
    app.run(host='0.0.0.0', port=5000)
