import requests

# Fonction pour obtenir la liste des guilds (serveurs) de l'utilisateur
def get_user_guilds(token):
    url = 'https://discord.com/api/users/@me/guilds'
    headers = {
        'Authorization': f'Bearer {token}'  # Utilisez le token de l'utilisateur
    }
    
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.json()  # Renvoie la liste des guilds (serveurs)
    else:
        print(f"Error fetching guilds: {response.status_code}")
        return None

# Fonction pour obtenir la liste des channels d'un serveur spécifique
def get_guild_channels(token, guild_id):
    url = f'https://discord.com/api/guilds/{guild_id}/channels'
    headers = {
        'Authorization': f'Bearer {token}'  # Utilisez le token de l'utilisateur
    }
    
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.json()  # Renvoie la liste des channels
    else:
        print(f"Error fetching channels: {response.status_code}")
        return None

# Exemple d'utilisation avec le token récupéré lors de l'authentification Discord
user_token = '6ppF347MniQzWrFl9UWBpVs7DQGGB6'

# 1. Récupérer la liste des guilds de l'utilisateur
guilds = get_user_guilds(user_token)
if guilds:
    for guild in guilds:
        print(f"Guild: {guild['name']} (ID: {guild['id']})")
        
        # 2. Récupérer les channels pour chaque guild
        channels = get_guild_channels(user_token, guild['id'])
        if channels:
            print(f"Channels in {guild['name']}:")
            for channel in channels:
                print(f" - {channel['name']} (ID: {channel['id']}, Type: {channel['type']})")
