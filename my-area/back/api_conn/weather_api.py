import requests
import datetime

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
        print(data)
        temperature = data["main"]["temp"]
        description = data["weather"][0]["description"]
        return {
            "city": city,
            "temperature": data["main"]["temp"],
            "feels_like": data["main"]["feels_like"],
            "humidity": data["main"]["humidity"],
            "pressure": data["main"]["pressure"],
            "description": data["weather"][0]["description"],
            "wind_speed": data["wind"]["speed"],
            "wind_direction": data["wind"]["deg"],
            "cloudiness": data["clouds"]["all"],
            "sunrise": datetime.fromtimestamp(data["sys"]["sunrise"]).strftime('%H:%M:%S'),
            "sunset": datetime.fromtimestamp(data["sys"]["sunset"]).strftime('%H:%M:%S'),
            "visibility": data.get("visibility", "N/A"),
            "rain_1h": data.get("rain", {}).get("1h", 0) if "rain" in data else 0,
            "snow_1h": data.get("snow", {}).get("1h", 0) if "snow" in data else 0
        }
    else:
        return "Erreur lors de la récupération des données météo."


api_key = "e45b650128bf8616ffb882282464b58a"
ville = "Paris"
resultat = get_weather(ville, api_key)
print(resultat)