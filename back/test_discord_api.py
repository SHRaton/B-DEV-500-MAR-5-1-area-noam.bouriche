import discord

# discord API key (tkt les clés)
TOKEN = 'MTI4ODU2OTYzNTU3NDM4NjY4OA.GnlT7O.Zfz1WpwdRacb2tREqgjpt8pAZlqa1CoTVPKw88'
channel_id = 1100402907247038487
message = "test suce"

def send_message(channel_id, TOKEN, message):

    intents = discord.Intents.default()
    intents.message_content = True
    client = discord.Client(intents=intents)

    @client.event
    async def on_ready():
        print(f'{client.user} s\'est connecté à Discord!')

        channel = client.get_channel(channel_id)

        if channel:
            await channel.send(message)
            print("Message envoyé !")
        else:
            print("Canal non trouvé.")

    client.run(TOKEN)

send_message(channel_id, TOKEN, message)
