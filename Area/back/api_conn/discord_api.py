import discord
from main import DataStruct

# discord API key (tkt les clés)
self = DataStruct()
message =  self.text
channel_id = self.channel_id
TOKEN_discord = self.TOKEN_discord

def send_message(self):

    intents = discord.Intents.default()
    intents.message_content = True
    client = discord.Client(intents=intents)

    @client.event
    async def on_ready():
        print(f'{client.user} s\'est connecté à Discord!')

        channel = client.get_channel(self.channel_id)

        if channel:
            await channel.send(message)
            print("Message envoyé !")
        else:
            print("Canal non trouvé.")

    client.run(TOKEN_discord)