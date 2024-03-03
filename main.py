import os
import requests
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# import uvicorn

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
)

url = "https://eth-mainnet.g.alchemy.com/v2/o7ZRZgZWxUlazl9jLcPvwjAAQbLyx5AF"
headers = {"Content-Type": "application/json"}

@app.get("/block/{blockNumber}", status_code=200)
async def get_block(blockNumber: int):
    filename = f"data/{blockNumber}.json"

    if os.path.exists(filename):
        with open(filename, "r") as file:
            data = json.load(file)
    else:
        params = [hex(blockNumber), True]
        payload = {
            "jsonrpc": "2.0",
            "method": "eth_getBlockByNumber",
            "params": params,
            "id": 1
        }

        try:
            response = requests.post(url, headers=headers, data=json.dumps(payload))
            response.raise_for_status()  # Raises a HTTPError if the status is 4xx, 5xx
        except requests.RequestException as e:
            raise HTTPException(status_code=500, detail=str(e))

        data = response.json()

        with open(filename, "w") as file:
            json.dump(data, file)

    links = filter_transactions(data)

    return {"status" : "success", "links" : links}


def filter_transactions(data):
    transactions = data.get('result', {}).get('transactions', [])
    filtered_transactions = [{tx.get('from'): tx.get('to')} for tx in transactions]
    return json.dumps(filtered_transactions)
# if __name__ == "__main__":
#     uvicorn.run(app, host="127.0.0.1", port=8000)