from flask import Flask, redirect, url_for, session
from authlib.integrations.flask_client import OAuth
import os

app = Flask(__name__)
app.secret_key = os.urandom(24)

# API key (tkt les clés)
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

@app.route('/')
def home():
    return 'Bienvenue ! <a href="/login">Se connecter avec Google</a>'

@app.route('/login')
def login():
    redirect_uri = url_for('authorize', _external=True)
    return google.authorize_redirect(redirect_uri)

@app.route('/auth/callback')
def authorize():
    token = google.authorize_access_token()
    user_info = google.get('userinfo').json()
    session['user'] = user_info
    return f'Connecté en tant que {user_info["name"]}'

if __name__ == '__main__':
    app.run(debug=True)