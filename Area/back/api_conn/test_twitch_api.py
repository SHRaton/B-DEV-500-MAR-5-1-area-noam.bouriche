import requests

def is_streaming(streamer_name, client_id_twitch, client_secret_twitch, token_url):
    # Request an OAuth token from Twitch
    try:
        response = requests.post(token_url, {
            'client_id': client_id_twitch,
            'client_secret': client_secret_twitch,
            'grant_type': 'client_credentials'
        })
        response.raise_for_status()  # Raise an error for bad status codes (4xx/5xx)
        data = response.json()
        access_token = data['access_token']
    except requests.exceptions.RequestException as e:
        print(f"Error fetching access token: {e}")
        return False
    except KeyError:
        print(f"Unexpected response structure: {response.json()}")
        return False

    # Now check if the streamer is live
    stream_url = f'https://api.twitch.tv/helix/streams?user_login={streamer_name}'
    headers = {
        'Client-ID': client_id_twitch,
        'Authorization': f'Bearer {access_token}'
    }

    def check_if_live():
        try:
            response = requests.get(stream_url, headers=headers)
            response.raise_for_status()
            data = response.json()
            return bool(data['data'])
        except requests.exceptions.RequestException as e:
            print(f"Error checking stream status: {e}")
            return False

    print(f"Checking if {streamer_name} is live...")

    if check_if_live():
        print(f"{streamer_name} is now live!")
        return True
    else:
        print(f"{streamer_name} is not live yet.")
        return False

# Example usage:
# is_streaming(streamer_name, client_id_twitch, client_secret_twitch, token_url)