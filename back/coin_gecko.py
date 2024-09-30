import requests
from datetime import datetime, timedelta

def check_btc_increase(raise_percentage):

    def btc_price():
        url = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'
        response = requests.get(url)
        data = response.json()
        return data['bitcoin']['usd']

    def btc_price_yesterday():
        yesterday = datetime.now() - timedelta(days=1)
        timestamp = int(yesterday.timestamp())
        url = f'https://api.coingecko.com/api/v3/coins/bitcoin/history?date={yesterday.strftime("%d-%m-%Y")}&Localization=false'
        response = requests.get(url)
        data = response.json()
        return data['market_data']['current_price']['usd']


    price_today = btc_price()
    price_yesterday = btc_price_yesterday()

    increase_percentage = ((price_today - price_yesterday) / price_yesterday) * 100

    if increase_percentage >= raise_percentage:
        print(f"goood")
    else:
        print(f"nuuuh")

check_btc_increase(5)
