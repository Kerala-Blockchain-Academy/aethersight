import os
import requests
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# import uvicorn

app = FastAPI()

# Mount static files
app.mount("/static", StaticFiles(directory="."), name="static")

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
)

# API Configuration
ALCHEMY_API_KEY = os.getenv("ALCHEMY_API_KEY")
if not ALCHEMY_API_KEY:
    raise ValueError("ALCHEMY_API_KEY environment variable is required")

url = f"https://eth-mainnet.g.alchemy.com/v2/{ALCHEMY_API_KEY}"
headers = {"Content-Type": "application/json"}

@app.get("/")
async def read_root():
    return FileResponse("index.html")

@app.get("/style.css")
async def get_css():
    return FileResponse("style.css")

@app.get("/script.js")
async def get_js():
    return FileResponse("script.js")

@app.get("/block/{blockNumber}", status_code=200)
async def get_block(blockNumber: int):
    try:
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
                response.raise_for_status()
                data = response.json()
                
                # Check if the API returned an error
                if 'error' in data:
                    raise HTTPException(
                        status_code=400, 
                        detail=f"Ethereum API error: {data['error'].get('message', 'Unknown error')}"
                    )
                
                # Check if block exists (result will be null for non-existent blocks)
                if data.get('result') is None:
                    raise HTTPException(
                        status_code=404, 
                        detail=f"Block {blockNumber} not found. Block may not exist yet or is invalid."
                    )

                with open(filename, "w") as file:
                    json.dump(data, file)
                    
            except requests.RequestException as e:
                raise HTTPException(status_code=500, detail=f"Network error: {str(e)}")

        links = filter_transactions(data)
        return {"status": "success", "links": links}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error processing block {blockNumber}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


def filter_transactions(data):
    transactions = data.get('result', {}).get('transactions', [])
    filtered_transactions = [{tx.get('from'): tx.get('to')} for tx in transactions]
    return json.dumps(filtered_transactions)

if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host=host, port=port)