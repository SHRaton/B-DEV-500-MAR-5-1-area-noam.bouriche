import requests
import time
import socket
import discord
from spotify_api import get_top_tracks
from spotify_api import get_user_profile
from spotify_api import get_user_playlists
from twitch_api import is_streaming
from deeple import translate_to
from coin_gecko import check_btc_increase

class DataStruct:
    def __init__(self):
        self.trigger_n = 2
        self.react_n = 1
        #deeple api data
        self.text = "i love poop"
        self.lang = "FR"
        #discord api data
        self.discord_mess = "reaction discord"
        self.user_to_detect = 694509368904777748
        self.channel_id = 1100402907247038487
        self.TOKEN_discord = 'MTI4ODU2OTYzNTU3NDM4NjY4OA.GnlT7O.Zfz1WpwdRacb2tREqgjpt8pAZlqa1CoTVPKw88'
        #spotify api data
        self.user_id = '31xj4b4z6x4j4v5q5w6z3x4x3'
        #twitch api data
        self.client_id_twitch = '37viu39jc58rev22poffncftrfeeee'
        self.client_secret_twitch = 'u60swdb868cf1m4s2jkzf5k3d9xvh9'
        self.streamer_name = 'orchideedubresil'
        self.token_twitch = 'https://id.twitch.tv/oauth2/token'

#############################################################################################################################################

    def send_message(self):

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

    def detect_user_messages(self):

        self.user_to_detect = int(self.user_to_detect)

        intents = discord.Intents.default()
        intents.message_content = True

        class MyClient(discord.Client):
            def __init__(self, user_to_detect, *args, **kwargs):
                super().__init__(*args, **kwargs)
                self.user_to_detect = user_to_detect
                self.message_detected = False

            async def on_ready(self):
                print(f'Connecté en tant que {self.user}')

            async def on_message(self, message):
                if message.author.id == self.user_to_detect:
                    #print(f"Message de {message.author}: {message.content}")
                    self.message_detected = True
                    await self.close()

        client = MyClient(user_to_detect=self.user_to_detect, intents=intents)

        try:
            client.run(self.TOKEN_discord)
            return client.message_detected
        except Exception as e:
            print(f"An error occurred: {e}")
            return False

#############################################################################################################################################

    def get_trigger_n(self):
        self.trigger_n = 3
        if not (1 <= self.trigger_n <= 5):
            print("Invalid trigger number")
        else :
            return self.trigger_n

    def get_react_n(self):
        self.react_n = 5
        if not (1 <= self.react_n <= 5):
            print("Invalid reaction number")
        else:
            return self.react_n

#############################################################################################################################################


    def trigger_selector(self):

        if self.trigger_n == 1:
            while check_btc_increase(0) != True:
                time.sleep(60) # wait for api restriction
            return True

        elif self.trigger_n == 2 :
            while is_streaming(self.streamer_name, self.client_id_twitch, self.client_secret_twitch, self.token_twitch) != True:
                time.sleep(60)
            return True

        elif self.trigger_n == 3:
            if self.detect_user_messages() == True:
                return True

        else:
            print("Invalid trigger number")


    def trigger_react(self):

        if self.trigger_selector() == True:
            if self.react_n == 1:
                print(translate_to(self.text, self.lang))
            elif self.react_n == 2:
                self.send_message()
            elif self.react_n == 3:
                print(get_user_playlists())
            elif self.react_n == 4:
                print(get_top_tracks(self.user_id))
            elif self.react_n == 5:
               print(get_user_profile())
            elif self.react_n == 6:
                print("barmitva")

#############################################################################################################################################

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

# trigger 1 = btc increase
# trigger 2 = twitch streaming
# trigger 3 = discord message