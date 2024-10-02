import requests
import time
import socket
import discord
from spotify_api import get_top_tracks
from spotify_api import get_user_playlists
from twitch_api import is_streaming
from deeple import translate_to
from coin_gecko import check_btc_increase

class DataStruct:
    def __init__(self):
        self.trigger_n = 2
        self.react_n = 1
        #deeple api data
        self.text = "Hello, how are you?"
        self.lang = "FR"
        #discord api data
        self.discord_mess = "caca proute structure"
        self.channel_id = 1100402907247038487
        self.TOKEN_discord = 'MTI4ODU2OTYzNTU3NDM4NjY4OA.GnlT7O.Zfz1WpwdRacb2tREqgjpt8pAZlqa1CoTVPKw88'
        #spotify api data
        self.user_id = '31xj4b4z6x4j4v5q5w6z3x4x3'
        #twitch api data
        self.client_id_twitch = '37viu39jc58rev22poffncftrfeeee'
        self.client_secret_twitch = 'u60swdb868cf1m4s2jkzf5k3d9xvh9'
        self.streamer_name = 'orchideedubresil'
        self.token_twitch = 'https://id.twitch.tv/oauth2/token'

    def send_message(self):
        print("send_message")
        intents = discord.Intents.default()
        intents.message_content = True
        client = discord.Client(intents=intents)

        @client.event
        async def on_ready():
            print(f'{client.user} s\'est connecté à Discord!')
            channel = client.get_channel(self.channel_id)
            if channel:
                await channel.send(self.discord_mess)
                print("Message envoyé !")
            else:
                print("Canal non trouvé.")
        client.run(self.TOKEN_discord)

    def get_trigger_n(self):
        self.trigger_n = 1
        return self.trigger_n

    def get_react_n(self):
        self.react_n = 3
        return self.react_n

    def trigger_react(self):

        if self.trigger_n == 1 and check_btc_increase(0) == False:
            if self.react_n == 1:
                print(translate_to(self.text, self.lang))
            elif self.react_n == 2:
                self.send_message()
            elif self.react_n == 3:
                print(get_user_playlists())

        if self.trigger_n == 2 and is_streaming(self.streamer_name, self.client_id_twitch, self.client_secret_twitch, self.token_twitch) == True: #twitch is streaming
            if self.react_n == 1:
                print(translate_to(self.text, self.lang))
            elif self.react_n == 2:
                self.send_message()
            elif self.react_n == 3:
                print(get_user_playlists())


        if self.trigger_n == 3:
            if self.react_n == 1:
                print(translate_to(self.text, self.lang))
            elif self.react_n == 2:
                self.send_message()
            elif self.react_n == 3:
                print(get_user_playlists())

        elif not (1 <= self.trigger_n <= 5):
            print("Invalid trigger number")

def main():
    data = DataStruct()
    data.get_trigger_n()
    data.get_react_n()
    data.trigger_react()

if __name__ == '__main__':
    main()

# self.trigger_n = action a assigner
# self.react_n = reaction a assigner
# self.text = texte a traduire
# self.lang = langue de traduction
# self.discord_mess = message a envoyer
#assigner 1à X , numero reaction, string avec tous les arguments