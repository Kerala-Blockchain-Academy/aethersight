# Ethereum Network Visualizer (eth-net-vis)

A FastAPI-based application for fetching and visualizing Ethereum blockchain data. This project provides an interactive web interface to explore Ethereum block transaction networks using D3.js force-directed graphs.

## Features

- **Interactive Network Visualization** - Force-directed graph showing transaction relationships
- **Real-time Block Data** - Fetch Ethereum block data via Alchemy API
- **Smart Caching** - Local storage of block data for improved performance
- **Block Navigation** - Browse blocks with previous/next buttons and search functionality
- **Error Handling** - Comprehensive error management with user-friendly messages
- **Responsive Design** - Full-screen visualization with zoom and pan capabilities
- **Node Interactions** - Hover tooltips, click details, and drag functionality
- **CORS-enabled** - Ready for frontend integration

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

The application uses Alchemy's Ethereum API. You can update the API endpoint in `main.py`:
```python
url = "https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY"
```

## Running the Project

### Method 1: Direct Python execution (Recommended)
```bash
python main.py
```

### Method 2: Using uvicorn directly
```bash
uvicorn main:app --reload
```

The application will be available at `http://127.0.0.1:8000`

## Usage

1. **Initial Load** - The application starts with block 22845771
2. **Navigation** - Use the previous/next buttons to browse adjacent blocks
3. **Search** - Enter any block number in the search field to jump to that block
4. **Interaction** - 
   - Hover over nodes to see wallet addresses
   - Click nodes for detailed address information
   - Drag nodes to reposition them
   - Use mouse wheel to zoom in/out
   - Click and drag background to pan

## API Endpoints

### GET `/`
Serves the main application interface (index.html)

### GET `/block/{blockNumber}`
Fetches Ethereum block data for the specified block number.

**Parameters:**
- `blockNumber` (int): The block number to fetch

**Response:**
```json
{
  "status": "success",
  "links": "[{\"0xfrom_address\": \"0xto_address\"}, ...]"
}
```

**Error Responses:**
- `400` - API error from Ethereum network
- `404` - Block not found (doesn't exist yet or invalid)
- `500` - Network or server error

**Example:**
```
GET http://127.0.0.1:8000/block/22845771
```

### Static File Routes
- `GET /style.css` - Application styles
- `GET /script.js` - Client-side JavaScript

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

## Error Handling

The application includes comprehensive error handling:

**Frontend:**
- Loading indicators during data fetch
- Visual error messages in the graph area
- User-friendly alert dialogs
- Graceful degradation on API failures

**Backend:**
- Detailed error logging
- Specific HTTP status codes
- API error detection and forwarding
- Network timeout handling

## Recent Improvements

### Version 2.0 Features:
- ✅ **Enhanced Error Handling** - Better user feedback for invalid blocks
- ✅ **Loading Indicators** - Visual feedback during data fetching
- ✅ **Code Cleanup** - Streamlined JavaScript with reusable functions
- ✅ **Static File Serving** - Proper CSS/JS file delivery
- ✅ **Improved API** - Better error detection and response codes
- ✅ **Updated Default Block** - Starts with recent block (22845771)

## Troubleshooting

**Common Issues:**

1. **500 Internal Server Error** - Usually indicates block doesn't exist yet
2. **Network Errors** - Check internet connection and Alchemy API status
3. **Loading Issues** - Ensure all files are in the correct directory
4. **Performance** - Large blocks may take longer to render

**Valid Block Range:**
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
