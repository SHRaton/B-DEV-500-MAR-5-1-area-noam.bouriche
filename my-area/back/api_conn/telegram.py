from binance.client import Client
import requests
import json
import hashlib
import time
import hmac
import re
import time
from datetime import datetime

chat_id = 1646361418
TOKEN = '6808144152:AAE3pgrw2pUbqsXv2s-DtYcP4k2Sre5dd-c'

def send_telegram_message(TOKEN, chat_id, message):
    api_url = f"https://api.telegram.org/bot{TOKEN}/sendMessage"
    params = {'chat_id': chat_id, 'text': message}

    response = requests.get(api_url, params=params)

    if response.status_code == 200:
        print("Message envoyé avec succès")
    else:
        print(f"Erreur lors de l'envoi du message. Code d'erreur : {response.status_code}")

message = "\U00002705"
send_telegram_message(TOKEN, chat_id, message)