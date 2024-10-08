import discord
from main import DataStruct

channel_id = 1100402907247038487
TOKEN_discord = 'MTI4ODU2OTYzNTU3NDM4NjY4OA.GnlT7O.Zfz1WpwdRacb2tREqgjpt8pAZlqa1CoTVPKw88'

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


def detect_user_messages(user_id, token):

    user_id = int(user_id)

    intents = discord.Intents.default()
    intents.message_content = True

    class MyClient(discord.Client):
        async def on_ready(self):
            print(f'Connecté en tant que {self.user}')

        async def on_message(self, message):

            if message.author.id == user_id:
                print(f"Message de {message.author}: {message.content}")
                return True
            else:
                return False

    client = MyClient(intents=intents)
    client.run(token)


# Utilisation de la fonction
#detect_user_messages(694509368904777748, 'MTI4ODU2OTYzNTU3NDM4NjY4OA.GnlT7O.Zfz1WpwdRacb2tREqgjpt8pAZlqa1CoTVPKw88')
#send_message()