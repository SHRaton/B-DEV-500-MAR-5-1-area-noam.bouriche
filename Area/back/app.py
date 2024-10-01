from flask import Flask, request, jsonify, session
from flask_cors import CORS
from database.new_user import register_user
from database.auth_user import login_user

app = Flask(__name__)
app.secret_key = 'mysecretkey123'
CORS(app, supports_credentials=True)

app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = True

@app.route('/register', methods=['POST'])
def handle_register():
    return register_user(request)

@app.route('/login', methods=['POST'])
def handle_login():
    return login_user(request)

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

if __name__ == '__main__':
    app.run(debug=True)
