import requests
from datetime import datetime, timedelta
import time

def check_btc_increase(raise_percentage):

    def btc_price():
        url = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'
        response = requests.get(url)
        try:
            data = response.json()
            return data['bitcoin']['usd']
        except KeyError:
            print("Key 'bitcoin' not found in the response.")
            return None
        except Exception as e:
            print(f"Error fetching BTC price today: {e}")
            return None

    def btc_price_yesterday():
        yesterday = datetime.now() - timedelta(days=1)
        timestamp = int(yesterday.timestamp())
        url = f'https://api.coingecko.com/api/v3/coins/bitcoin/history?date={yesterday.strftime("%d-%m-%Y")}&localization=false'
        response = requests.get(url)
        try:
            data = response.json()
            return data['market_data']['current_price']['usd']
        except KeyError:
            return None
        except Exception as e:
            return None

    price_today = btc_price()
    price_yesterday = btc_price_yesterday()

    if price_today is None or price_yesterday is None:
        print("Unable to calculate increase percentage due to missing price data.")
        return False

    increase_percentage = ((price_today - price_yesterday) / price_yesterday) * 100

    if increase_percentage >= raise_percentage:
        return True
    else:
        return False

# Example usage:
# check_btc_increase(5)