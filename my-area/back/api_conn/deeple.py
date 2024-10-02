import requests

DEEPL_API_KEY = '2b188aa5-3a40-45d7-9abc-8477f68e0b5d:fx'

def translate_to(text, lang):
    url = "https://api-free.deepl.com/v2/translate"

    params = {
        'auth_key': DEEPL_API_KEY,
        'text': text,
        'target_lang': lang
    }

    response = requests.post(url, data=params)

    if response.status_code == 200:
        result = response.json()
        return result['translations'][0]['text']

    else:
        return f"Erreur: {response.status_code} - {response.text}"