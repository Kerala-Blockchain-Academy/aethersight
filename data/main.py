import requests
import json

url = "https://eth-mainnet.g.alchemy.com/v2/o7ZRZgZWxUlazl9jLcPvwjAAQbLyx5AF"
headers = {"Content-Type": "application/json"}

count = 19258329

while True:
    params = [hex(count), True]
    payload = {
        "jsonrpc": "2.0",
        "method": "eth_getBlockByNumber",
        "params": params,
        "id": 1
    }

    response = requests.post(url, headers=headers, data=json.dumps(payload))
    data = response.json()

    filename = f"block_{count}.json"
    with open(filename, "w") as file:
        json.dump(data, file)

    count += 1