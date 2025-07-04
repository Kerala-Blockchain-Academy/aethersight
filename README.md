# Aethersight - Ethereum Network Visualizer

A FastAPI-based application for fetching and visualizing Ethereum blockchain data. This project provides an interactive web interface to explore Ethereum block transaction networks using D3.js force-directed graphs.

## Features

- **Interactive Network Visualization** - Force-directed graph showing transaction relationships
- **Real-time Block Data** - Fetch Ethereum block data via Alchemy API
- **Smart Caching** - Local storage of block data for improved performance
- **Block Navigation** - Browse blocks with previous/next buttons and search functionality
- **Node Interactions** - Hover tooltips, click details, and drag functionality

## Prerequisites

- Python 3.7 or higher
- pip (Python package manager)
- Internet connection (for Ethereum API calls)

## Installation

1. Clone or download this repository
2. Navigate to the project directory
3. Install the required dependencies:

```bash
pip install -r requirements.txt
```

## Configuration

1. **Set up environment variables:**
   - Copy `.env.example` to `.env`
   - Get your Alchemy API key from [https://dashboard.alchemy.com/](https://dashboard.alchemy.com/)
   - Replace `your_alchemy_api_key_here` in the `.env` file with your actual API key

```bash
# Copy the example file
cp .env.example .env

# Edit .env file with your API key
ALCHEMY_API_KEY=your_actual_api_key_here
HOST=127.0.0.1
PORT=8000
```

2. **Optional:** Customize host and port in the `.env` file if needed

## Running the Project

### Method 1: Direct Python execution (Recommended)
```bash
python main.py
```

The application will be available at `http://127.0.0.1:8000`

## Usage

1. **Initial Load** - The application starts with block 22845771
2. **Navigation** - Use the previous/next buttons to browse adjacent blocks
3. **Search** - Enter any block number in the search field to jump to that block
4. **Interaction** - 
   - Hover over nodes to see wallet addresses
   - Use mouse wheel to zoom in/out

## Project Structure

```
aethersight/
├── main.py              # FastAPI application with improved error handling
├── requirements.txt     # Python dependencies
├── index.html          # Frontend interface
├── script.js           # Cleaned D3.js visualization code
├── style.css           # Application styling
├── data/               # Cached block data (auto-created JSON files)
└── README.md           # This file
```

## Data Caching

- Block data is automatically cached in the `data/` directory as JSON files
- Once fetched, subsequent requests use cached data for faster response times
- Cache files are named by block number (e.g., `22845771.json`)
- Invalid or error responses are not cached

### Valid Block Range
- Ethereum Genesis Block: 0
- Current blocks: ~20M+ (as of 2024)
- Future blocks will return 404 errors

## Development

To run with auto-reload for development:
```bash
uvicorn main:app --reload
```

This automatically restarts the server when you make code changes.

## References

- [D3.js Force Layout Documentation](https://d3js.org/d3-force)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Alchemy API Documentation](https://docs.alchemy.com/)
- [Ethereum JSON-RPC API](https://ethereum.org/en/developers/docs/apis/json-rpc/)

## ENS Integration

For Ethereum Name Service (ENS) integration:

1. **Get node hash**: [ENS Contract](https://etherscan.io/address/0x084b1c3c81545d370f3634392de611caabff8148#readContract) - use `node` function
2. **Resolve name**: [ENS Resolver](https://etherscan.io/address/0xA2C122BE93b0074270ebeE7f6b7292C7deB45047#readContract) - use `name` function with the hash

## Contributing

Feel free to submit issues, fork the repository, and create pull requests for any improvements.
