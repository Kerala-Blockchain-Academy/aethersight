Install the Live Server extension from the Visual Studio Code marketplace.
Open your HTML file inside Visual Studio Code.
Right-click anywhere on the HTML file and select "Open With Live Server" option



The HTML file sets up the basic structure of the document, including the necessary <head> and <body> elements.

It includes a <script> tag that imports the D3.js library from a CDN (Content Delivery Network).

Inside the <body>, an SVG element with the ID "graph" is defined, where the graph visualization will be rendered.

The JavaScript code fetches transaction data from a JSON file named "block_19258329_address_pairs.json" using the Fetch API. Once the data is fetched, its processed and used to create nodes and links for the forced graph.

D3.js is utilized to generate the forced graph layout based on the transaction data. Nodes represent addresses involved in transactions, and links represent transactions between addresses.

Event listeners are added for zooming, dragging nodes, and clicking nodes to display their addresses in an alert box.
