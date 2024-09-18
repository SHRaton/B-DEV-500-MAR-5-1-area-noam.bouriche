from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/about.json')
def about_json():
    return jsonify({"message": "Hello, this is the backend!"})

@app.route('/')
def home():
    return jsonify({"message": "Hello, this is the accueilLLLLLLLLLLLLL!"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
