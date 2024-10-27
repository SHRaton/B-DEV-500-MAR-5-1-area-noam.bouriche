import requests
import time
import socket
from datetime import datetime
import discord
from spotify_api import get_track_recommendations
from spotify_api import get_artist_recommendations
from spotify_api import explore_new_releases
from spotify_api import get_top_tracks
from spotify_api import discover_music
from spotify_api import get_user_profile
from spotify_api import get_user_playlists
from twitch_api import is_streaming
from deeple import translate_to
from coin_gecko import check_btc_increase
from weather_api import get_weather
import sqlite3


class DataStruct:
    def __init__(self):
        self.trigger_n = 2
        self.react_n = [4, 2, 8, 1]
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
        #weather api data
        self.api_key_weather = "e45b650128bf8616ffb882282464b58a"
        self.city = "Paris"
        self.return_info = "rain_1h"
        self.return_trigger = "0"
        #data from react
        self.translated_text = ""
        self.is_a_translated_text = False
#############################################################################################################################################

    def get_data_from_bd(self):
        return

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
                await client.close()
                return True
            else:
                print("Canal non trouvé.")
                await client.close()
                return False

        try:
            client.run(self.TOKEN_discord)
        except Exception as e:
            print(f"An error occurred: {e}")
            return False

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

    def extract_hour(self, time_string):
        return int(time_string.split(':')[0])


    def is_raining(self):
        resultat = get_weather(self.city, self.api_key_weather)
        rain_1h = resultat["rain_1h"]

        if rain_1h > 0.5:
            return True
        return False


    def is_sunset(self):
        resultat = get_weather(self.city, self.api_key_weather)
        sunset = resultat["sunset"]
        sunset_time = self.extract_hour(sunset)
        current_time = datetime.now().hour

        if sunset_time == current_time:
            return True
        return False

#############################################################################################################################################

    def multi_react(self):
        for i in self.react_n:
            if i == 1:
                self.translated_text = translate_to(self.text, self.lang)
                self.is_a_translated_text = True
            elif i == 2:
                if self.is_a_translated_text == True:
                    self.discord_mess = self.translated_text
                self.send_message()
            elif i == 3:
                print(get_user_playlists())
            elif i == 4:
                print(get_top_tracks("medium_term", 5))
            elif i == 5:
                print(get_user_profile())
            elif i == 6:
                print(get_track_recommendations(5))
            elif i == 7:
                print(get_artist_recommendations(5))
            elif i == 8:
                print(explore_new_releases(5))
            else:
                print("Invalid reaction number")

    def get_trigger_n(self):
        self.trigger_n = 1
        if not (1 <= self.trigger_n <= 5):
            print("Invalid trigger number")
        else :
            return self.trigger_n

    def get_react_n(self):

        if not all(1 <= n <= 8 for n in self.react_n):
            print("Invalid reaction number in the list")
        else:
            return self.react_n


#############################################################################################################################################

    def trigger_selector(self):

        if self.trigger_n == 1:
            while check_btc_increase(0) != False:
                time.sleep(60) # wait for api restriction
            return True

        elif self.trigger_n == 2 :
            while is_streaming(self.streamer_name, self.client_id_twitch, self.client_secret_twitch, self.token_twitch) != True:
                time.sleep(60) # wait for api restriction
            return True

        elif self.trigger_n == 3: #detect user message
            if self.detect_user_messages() == True:
                return True

        elif self.trigger_n == 4: #pluie
            if self.is_raining() != True:
                time.sleep(3600)
                self
            return True

        elif self.trigger_n == 5: #is sunset
            while self.is_sunset() != True:
                time.sleep(600)
            return True

        else:
            print("Invalid trigger number")

        self.mutli_react()


    def trigger_react_1(self):

        if self.trigger_selector() == True:
            self.multi_react()

#############################################################################################################################################

def main():
    data = DataStruct()
    data.get_data_from_bd()
    data.get_trigger_n()
    data.get_react_n()
    data.trigger_react_1()

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