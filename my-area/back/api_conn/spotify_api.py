import spotipy
from spotipy.oauth2 import SpotifyOAuth

#key not good
CLIENT_ID = '989e94f84293432e9c566499e6e06dad'
CLIENT_SECRET = '7327458d23e94c3daef4ba3208618966'
REDIRECT_URI = 'http://localhost:8080/callback'



sp = spotipy.Spotify(auth_manager=SpotifyOAuth(client_id=CLIENT_ID,
                                               client_secret=CLIENT_SECRET,
                                               redirect_uri=REDIRECT_URI,
                                               scope="playlist-read-private"))

sptop =  spotipy.Spotify(auth_manager=SpotifyOAuth(client_id=CLIENT_ID,
                                               client_secret=CLIENT_SECRET,
                                               redirect_uri=REDIRECT_URI,
                                               scope="user-top-read"))

def get_user_playlists():

    playlists = sp.current_user_playlists()
    user_playlists = [(playlist['name'], playlist['tracks']['total']) for playlist in playlists['items']]
    return user_playlists

def get_top_tracks(time_range="medium_term", limit=5):

    results = sptop.current_user_top_tracks(time_range=time_range, limit=limit)
    top_tracks = [(item['name'], item['artists'][0]['name'], item['album']['name']) for item in results['items']]
    print(top_tracks)
    return top_tracks

def get_user_profile():

    user_profile = sp.current_user()
    print(user_profile)
    return user_profile

if __name__ == "__main__":
    playlists = get_user_playlists()
    get_top_tracks()
    get_user_profile()
    print("Vos playlists :")
    for idx, (name, track_count) in enumerate(playlists):
        print(f"{idx + 1}: {name} | Nombre de chansons : {track_count}")

#get_top_tracks()

get_user_profile()