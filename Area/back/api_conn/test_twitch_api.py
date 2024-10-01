import requests
import time
import socket


# twitch API key (tkt les clés)
client_id = '37viu39jc58rev22poffncftrfeeee'

client_secret = 'u60swdb868cf1m4s2jkzf5k3d9xvh9'

streamer_name = 'ardsinho19'

token_url = 'https://id.twitch.tv/oauth2/token'

chat_oauth_token = 'oauth:YOUR_CHAT_OAUTH_TOKEN'


def is_streaming(streamer_name, client_id, client_secret, token_url):
    response = requests.post(token_url, {
        'client_id': client_id,
        'client_secret': client_secret,
        'grant_type': 'client_credentials'
    })
    access_token = response.json()['access_token']

    stream_url = f'https://api.twitch.tv/helix/streams?user_login={streamer_name}'
    headers = {
        'Client-ID': client_id,
        'Authorization': f'Bearer {access_token}'
    }

    def check_if_live():
        response = requests.get(stream_url, headers=headers)
        data = response.json()
        return bool(data['data'])

    print(f"Checking if {streamer_name} is live...")

    while True:
        if check_if_live():
            print(f"{streamer_name} is now live!")
            return True
        else:
            print(f"{streamer_name} is not live yet.")
        time.sleep(10)


def send_message(channel, message):

    irc_server = 'irc.chat.twitch.tv'
    irc_port = 6667

    sock = socket.socket()
    sock.connect((irc_server, irc_port))

    sock.send(f"PASS {chat_oauth_token}\n".encode('utf-8'))
    sock.send(f"NICK {streamer_name}\n".encode('utf-8'))
    sock.send(f"JOIN #{channel}\n".encode('utf-8'))

    sock.send(f"PRIVMSG #{channel} :{message}\n".encode('utf-8'))

    print(f"Message envoyé à {channel}: {message}")

    sock.close()

