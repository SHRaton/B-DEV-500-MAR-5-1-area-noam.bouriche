from threading import Thread
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
import logging
import os

log_dir = 'logs'
if not os.path.exists(log_dir):
    os.makedirs(log_dir)
logging.basicConfig(
    filename=os.path.join(log_dir, 'data_struct.log'),
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

class DataStructThread(Thread):

    def __init__(self):
        super().__init__()
        self.trigger_n = 0
        self.react_n = []
        self.running = True

        self.text = ""
        self.lang = ""

        self.discord_mess = "reaction discord"
        self.user_to_detect = 694509368904777748
        self.channel_id = 1100402907247038487
        self.TOKEN_discord = 'MTI4ODU2OTYzNTU3NDM4NjY4OA.GnlT7O.Zfz1WpwdRacb2tREqgjpt8pAZlqa1CoTVPKw88'
        self.user_id = '31xj4b4z6x4j4v5q5w6z3x4x3'

        self.client_id_twitch = '37viu39jc58rev22poffncftrfeeee'
        self.client_secret_twitch = 'zi7liq2rd8xix8oru61pau8zgwq1ll'
        self.streamer_name = ''
        self.token_twitch = 'https://id.twitch.tv/oauth2/token'

        self.api_key_weather = "e45b650128bf8616ffb882282464b58a"
        self.city = "Paris"

        self.translated_text = ""
        self.is_a_translated_text = False
        self.text_to_send = ""
        self.df = get_data_from_db("areas")
        self.current_area_id = None
        self.executed_areas = set()


    def refresh_data(self):
        self.df = get_data_from_db("areas")


    def stop(self):
        self.running = False


    def run(self):
        while self.running:
            self.refresh_data()

            active_areas = self.df[
                (self.df['isActive'] == 1) &
                (~self.df['id'].isin(list(self.executed_areas)))
            ]

            if active_areas.empty:
                time.sleep(1)
                continue

            for _, row in active_areas.iterrows():
                if not self.running:
                    break

                area_id = row['id']
                if area_id not in self.executed_areas:
                    logging.info(f"Processing area {area_id}")
                    self.area_id = area_id
                    self.parse_reaction_info(area_id)
                    self.get_react_from_bd(area_id)
                    self.get_trigger_n(area_id)
                    self.get_react_n()
                    self.trigger_react_1()
                    logging.info(f"Text: {self.text}")
                    self.executed_areas.add(area_id)
                    self.df.loc[self.df['id'] == area_id, 'isActive'] = 0

            time.sleep(1)
            self.refresh_data()
            self.run()

    def reset_execution_state(self):
        self.executed_areas.clear()

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
            logging.warning("No message to send")
            return False
        logging.info("Sending message...")
        logging.info(self.discord_mess)
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
            return True
        except Exception as e:
            logging.error(f"Discord error: {e}")
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
                logging.info(f'Connected as {self.user}')

            async def on_message(self, message):
                if message.author.id == self.user_to_detect:
                    self.message_detected = True
                    await self.close()

        client = MyClient(user_to_detect=self.user_to_detect, intents=intents)

        try:
            client.run(self.TOKEN_discord)
            return client.message_detected
        except Exception as e:
            logging.error(f"An error occurred: {e}")
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
        default_messages = {
            1: "Message traduit",
            2: "Action Discord déclenchée!",
            3: "Voici vos playlists Spotify",
            4: "Voici vos top tracks",
            5: "Voici votre profil Spotify",
            6: "Voici des recommandations de tracks",
            7: "Voici des recommandations d'artistes",
            8: "Voici les nouvelles sorties",
            9: "Message Telegram"
        }

        for i in self.react_n:
            if i in executed:
                continue

            if not self.text_to_send and not self.discord_mess:
                self.text_to_send = default_messages.get(i, "Action déclenchée!")

            if i == 1:
                logging.info("Deepl")
                if isinstance(self.text_to_send, str):
                    self.text_to_send = translate_to(self.text, self.lang)
                    logging.info(self.text_to_send)
                    logging.info("End of function")
                elif isinstance(self.text_to_send, list):
                    translated_list = []
                    for item in self.text_to_send:
                        translated_item = translate_to(item, self.lang)
                        translated_list.append(translated_item)
                        self.text_to_send = translated_list
            elif i == 2:
                logging.info("Discord")
                self.send_message()
            elif i == 3:
                playlists = get_user_playlists()
                self.text_to_send = "Vos playlists Spotify:\n" + "\n".join([str(p) for p in playlists]) if playlists else default_messages[3]
            elif i == 4:
                top_tracks = get_top_tracks("medium_term", 5)
                self.text_to_send = "Vos top tracks:\n" + "\n".join([str(t) for t in top_tracks]) if top_tracks else default_messages[4]
            elif i == 5:
                profile = get_user_profile()
                self.text_to_send = "Votre profil Spotify:\n" + str(profile) if profile else default_messages[5]
            elif i == 6:
                recommendations = get_track_recommendations(5)
                self.text_to_send = "Recommandations de tracks:\n" + "\n".join([str(r) for r in recommendations]) if recommendations else default_messages[6]
            elif i == 7:
                artist_recommendations = get_artist_recommendations(5)
                self.text_to_send = "Recommandations d'artistes:\n" + "\n".join([str(a) for a in artist_recommendations]) if artist_recommendations else default_messages[7]
            elif i == 8:
                new_releases = explore_new_releases(5)
                self.text_to_send = "Nouvelles sorties:\n" + "\n".join([str(r) for r in new_releases]) if new_releases else default_messages[8]
            elif i == 9:
                logging.info("Telegram")
                self.text_to_send = default_messages[9]

            executed.add(i)


    def get_trigger_n(self, area_id):
        return self.get_data_trigger_from_bd(area_id)


    def get_react_n(self):
        if not all(1 <= n <= 9 for n in self.react_n):
            logging.warning("Invalid reaction number in the list")
        return self.react_n


    def get_streamer_name(self):
        area_data = self.df[self.df['id'] == self.area_id]

        if not area_data.empty:
            self.streamer_name = area_data['action_1_info'].iloc[0]
        else:
            logging.warning("No data found for this ID")


    def trigger_selector(self):
        self.get_streamer_name()
        trigger_messages = {
            1: "Le prix du Bitcoin a augmenté !",
            2: f"Le streamer {self.streamer_name} est en live !",
            3: "Un message a été détecté !",
            4: "Il pleut !",
            5: "C'est le coucher du soleil !"
        }

        if self.trigger_n == 1:
            while not check_btc_increase(0) and self.running:
                time.sleep(60)
            if self.running:
                self.text_to_send = trigger_messages[1]
            return self.running
        elif self.trigger_n == 2:
            self.get_streamer_name()
            while not is_streaming(self.streamer_name, self.client_id_twitch, self.client_secret_twitch, self.token_twitch) and self.running:
                time.sleep(60)
            if self.running:
                self.text_to_send = trigger_messages[2]
            return self.running
        elif self.trigger_n == 3:
            return self.detect_user_messages()
        elif self.trigger_n == 4:
            if not self.is_raining() and self.running:
                time.sleep(3600)
            if self.running:
                self.text_to_send = trigger_messages[4]
            return self.running
        elif self.trigger_n == 5:
            while not self.is_sunset() and self.running:
                time.sleep(600)
            if self.running:
                self.text_to_send = trigger_messages[5]
            return self.running
        return False


    def trigger_react_1(self):
        if self.trigger_selector():
            self.multi_react()


    def parse_reaction_info(self, area_id):
        try:
            area_data = self.df[self.df['id'] == area_id]
            if area_data.empty:
                return

            for i in range(1, 7):
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
            logging.error(f"Error processing data: {e}")


def start_data_struct_thread():
    data_thread = DataStructThread()
    data_thread.start()
    return data_thread

if __name__ == "__main__":

    try:
        data_thread = start_data_struct_thread()
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        logging.info("Shutting down...")
        data_thread.stop()
        data_thread.join()
        logging.info("Program terminated")