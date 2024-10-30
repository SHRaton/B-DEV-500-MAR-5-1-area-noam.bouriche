import requests
import time
import socket
from datetime import datetime
import discord
from spotify_api import get_track_recommendations, get_artist_recommendations
from spotify_api import explore_new_releases, get_top_tracks, get_user_profile
from spotify_api import get_user_playlists, discover_music
from twitch_api import is_streaming
from deeple import translate_to
from coin_gecko import check_btc_increase
from weather_api import get_weather
from db_connect import get_active_actions, get_data_from_db
import json

class DataStruct:
    def __init__(self):
        self.trigger_n = 0
        self.react_n = []

        self.text = "i love poop"
        self.lang = "FR"

        self.discord_mess = "reaction discord"
        self.user_to_detect = 694509368904777748
        self.channel_id = 1100402907247038487
        self.TOKEN_discord = 'MTI4ODU2OTYzNTU3NDM4NjY4OA.GnlT7O.Zfz1WpwdRacb2tREqgjpt8pAZlqa1CoTVPKw88'
        self.user_id = '31xj4b4z6x4j4v5q5w6z3x4x3'

        self.client_id_twitch = '37viu39jc58rev22poffncftrfeeee'
        self.client_secret_twitch = 'zi7liq2rd8xix8oru61pau8zgwq1ll'
        self.streamer_name = 'Gotaga'
        self.token_twitch = 'https://id.twitch.tv/oauth2/token'

        self.api_key_weather = "e45b650128bf8616ffb882282464b58a"
        self.city = "Paris"

        self.translated_text = ""
        self.is_a_translated_text = False
        self.text_to_send = ""
        self.df = get_data_from_db("areas")
        self.current_area_id = None

    def convert_to_list(self, actions_list):
        ACTION_MAPPING = {
            "Deepl_1": 1,
            "Discord_1": 2,
            "Discord_2": 2,
            "Spotify_1": 3,
            "Spotify_2": 4,
            "Spotify_3": 6,
            "Spotify_4": 7,
            "Spotify_5": 8,
            "Telegram_1": 9
        }

        int_values = []
        for action in actions_list:
            action = action.strip()
            if action in ACTION_MAPPING:
                int_values.append(ACTION_MAPPING[action])
        return int_values


    def get_react_from_bd(self, area_id):

        area_data = self.df[self.df['id'] == area_id]
        if not area_data.empty:
            actions = []
            for col in ['reaction_1', 'reaction_2', 'reaction_3']:
                if col in area_data.columns and not area_data[col].iloc[0] is None:
                    actions.append(area_data[col].iloc[0])
            self.react_n = self.convert_to_list(actions)


    def get_data_trigger_from_bd(self, area_id):

        area_data = self.df[
            (self.df['id'] == area_id) &
            (self.df['isActive'] == 1)
        ]

        if not area_data.empty:
            action_1 = area_data["action_1"].iloc[0]
            trigger_mapping = {
                "BTC": 1,
                "IS_STREAMING": 2,
                "DETECT_MESSAGE": 3,
                "IS_NIGHT": 4,
                "IS_SUNSET": 5
            }
            self.trigger_n = trigger_mapping.get(action_1, self.trigger_n)

        return self.trigger_n


    def send_message(self):

        if not self.text_to_send and not self.discord_mess:
            print("No message to send")
            return False
        print(self.text_to_send)
        message = self.text_to_send

        intents = discord.Intents.default()
        intents.message_content = True
        client = discord.Client(intents=intents)

        @client.event
        async def on_ready():
            channel = client.get_channel(self.channel_id)
            if channel:
                await channel.send(message)
                await client.close()
                return True
            else:
                await client.close()
                return False

        try:
            client.run(self.TOKEN_discord)
        except Exception as e:
            print(f"Discord error: {e}")
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
                    self.message_detected = True
                    await self.close()

        client = MyClient(user_to_detect=self.user_to_detect, intents=intents)

        try:
            client.run(self.TOKEN_discord)
            return client.message_detected
        except Exception as e:
            print(f"An error occurred: {e}")
            return False


    def extract_hour(self, time_string):
        return int(time_string.split(':')[0])


    def is_raining(self):
        resultat = get_weather(self.city, self.api_key_weather)
        rain_1h = resultat["rain_1h"]
        return rain_1h > 0.5


    def is_sunset(self):
        resultat = get_weather(self.city, self.api_key_weather)
        sunset = resultat["sunset"]
        sunset_time = self.extract_hour(sunset)
        current_time = datetime.now().hour
        return sunset_time == current_time


    def multi_react(self):
        executed = set()
        for i in self.react_n:
            if i in executed:
                continue

            if i == 1:
                if isinstance(self.text_to_send, str):
                    self.text_to_send = translate_to(self.text_to_send, self.lang)
                elif isinstance(self.text_to_send, list):
                    # Pour une liste de tuples, traduire chaque élément
                    translated_list = []
                    for title, artist, album in self.text_to_send:
                        translated_title = translate_to(title, self.lang)
                        translated_list.append((translated_title, artist, album))
                    self.text_to_send = translated_list
            elif i == 2:
                self.send_message()
            elif i == 3:
                self.text_to_send = get_user_playlists()
            elif i == 4:
                self.text_to_send = get_top_tracks("medium_term", 5)
            elif i == 5:
                self.text_to_send = get_user_profile()
            elif i == 6:
                self.text_to_send = get_track_recommendations(5)
            elif i == 7:
                self.text_to_send = get_artist_recommendations(5)
            elif i == 8:
                self.text_to_send = explore_new_releases(5)
            elif i == 9:
                print("Telegram")

            executed.add(i)

    def get_trigger_n(self, area_id):
        return self.get_data_trigger_from_bd(area_id)


    def get_react_n(self):
        if not all(1 <= n <= 9 for n in self.react_n):
            print("Invalid reaction number in the list")
        return self.react_n


    def trigger_selector(self):
        if self.trigger_n == 1:
            while not check_btc_increase(0):
                time.sleep(60)
            return True
        elif self.trigger_n == 2:
            while not is_streaming(self.streamer_name, self.client_id_twitch, self.client_secret_twitch, self.token_twitch):
                time.sleep(60)
            return True
        elif self.trigger_n == 3:
            return self.detect_user_messages()
        elif self.trigger_n == 4:
            if not self.is_raining():
                time.sleep(3600)
            return True
        elif self.trigger_n == 5:
            while not self.is_sunset():
                time.sleep(600)
            return True
        return False


    def trigger_react_1(self):
        if self.trigger_selector():
            self.multi_react()

    def parse_reaction_info(self, area_id):
        try:
            area_data = self.df[self.df['id'] == area_id]
            if area_data.empty:
                return

            for i in range(1, 7):  # For reactions 1-6
                reaction_col = f'reaction_{i}'
                info_col = f'reaction_{i}_info'

                if reaction_col in area_data.columns and info_col in area_data.columns:
                    reaction_value = area_data[reaction_col].iloc[0]
                    info_value = area_data[info_col].iloc[0]

                    if reaction_value == 'Deepl_1' and info_value:
                        try:
                            json_data = json.loads(info_value)
                            self.text = json_data.get("message", self.text)
                            self.lang = json_data.get("langue", self.lang)
                        except json.JSONDecodeError:
                            continue

        except Exception as e:
            print(f"Error processing data: {e}")

def main():

    data = DataStruct()
    active_areas = data.df[data.df['isActive'] == 1]

    for _, row in active_areas.iterrows():
        area_id = row['id']
        print(f"Processing area {area_id}")
        data.parse_reaction_info(area_id)
        data.get_react_from_bd(area_id)
        data.get_trigger_n(area_id)
        data.get_react_n()
        data.trigger_react_1()

if __name__ == '__main__':
    main()