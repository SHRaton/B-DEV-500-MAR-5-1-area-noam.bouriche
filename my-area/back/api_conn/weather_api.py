import requests
from datetime import datetime

api_key_weather = "e45b650128bf8616ffb882282464b58a"

def get_weather(city, api_key):
    base_url = "http://api.openweathermap.org/data/2.5/weather"
    params = {
        "q": city,
        "appid": api_key,
        "units": "metric"
    }

    response = requests.get(base_url, params=params)

    if response.status_code == 200:
        data = response.json()
        return {
            "city": city,
            "temperature": data["main"]["temp"],
            "humidity": data["main"]["humidity"],
            "description": data["weather"][0]["description"],
            "sunrise": datetime.fromtimestamp(data["sys"]["sunrise"]).strftime('%H:%M:%S'),
            "sunset": datetime.fromtimestamp(data["sys"]["sunset"]).strftime('%H:%M:%S'),
            "rain_1h": data.get("rain", {}).get("1h", 0) if "rain" in data else 0
        }
    else:
        return "Erreur lors de la récupération des données météo."


