const width = window.innerWidth; // Width of the window
const height = window.innerHeight - 60; // Adjusted height to accommodate header

let blockNumber = localStorage.getItem("currentBlockNumber");
console.log("onload", blockNumber)
if (!blockNumber) { // If not found in sessionStorage
  blockNumber = 19357067; // Use the default block number
  localStorage.setItem("currentBlockNumber", blockNumber); // Store in localStorage
}

document.getElementById('current-block').textContent = `Block Number: ${blockNumber}`; // Display current block number

// Fetch transaction data from API file
fetch(`http://127.0.0.1:8000/block/${blockNumber}`)
    .then(response => response.json()) // Convert response to JSON. First When the HTTP response is received, .then() method takes the response object and calls its .json() method and the purpose of response.json() is to parse the HTTP response body as JSON.
    .then(data => processData(data)) // Process fetched data. Here the arrow function data => processData(data) is passed as a callback to the .then() method. It receives the JSON data as its argument (data), which is the resolved value of the previous promise.
    .catch(error => console.error('Error fetching transaction data:', error)); // Handle fetch error

// Process data obtained from JSON
function processData(data) {
    let jsonString = JSON.parse(data.links);
    // Define color scale for node groups
    const color = d3.scaleOrdinal()
        .domain(['from', 'to']) // Define domain for colors
        .range(['blue', 'green']); // Assign colors for 'from' and 'to'

    // Define nodes and links based on transaction data
    const nodesMap = new Map(); // Map to store unique nodes
    const links = []; // Array to store links between nodes

    // Iterate through transactions
    jsonString.forEach(transaction => {
        // Iterate through from addresses
        Object.keys(transaction).forEach(from => {
            // For each "from" address encountered, check if it exists in nodesMap
            if (!nodesMap.has(from)) {
                nodesMap.set(from, { id: from, group: 'from' }); // If it doesn't exist, it adds the "from" address to the nodesMap as a node with the group 'from'
            }

            // Iterate through to addresses
            Object.values(transaction).forEach(to => {
                // For each "to" address encountered, check if it exists in nodesMap
                if (!nodesMap.has(to)) {
                    nodesMap.set(to, { id: to, group: 'to' }); // If it doesn't exist, it adds the "to" address to the nodesMap as a node with the group 'to'
                }

                // Add link between 'from' and 'to'
                links.push({ source: from, target: to }); // Add link between addresses
            });
        });
    });

    // Convert nodes map to array
    const nodes = Array.from(nodesMap.values()); // Convert nodesMap to array of nodes since initially, the nodesMap is structured as a Map object(key-value pair data structure). D3.js expects data to be provided in array format rather than a Map object. Also arrays are easier to work with in terms of iteration and manipulation compared to Map objects.

    // Create a force simulation
    const simulation = d3.forceSimulation(nodes) // simulation used to position nodes in a graph visualization
        .force("link", d3.forceLink(links).id(d => d.id)) // configures the force responsible for defining the behaviour of links between nodes. The d3.forceLink() function creates a new link force, and the id method sets the accessor function for obtaining the unique identifier of each node, here links is an array containing the link data between nodes.
        .force("charge", d3.forceManyBody()) // Define charge force, by default, nodes repel each other, which helps in preventing overlapping nodes in the visualization.
        .force("x", d3.forceX(width / 2).strength(0.1)) // Define force along x-axis, it attracts or repels nodes horizontally to position them within the visualization. Here, width / 2 positions the nodes at the center horizontally, and strength(0.1) determines the strength of the force.
        .force("y", d3.forceY(height / 2).strength(0.1)); // Define force along y-axis, tt positions nodes vertically within the visualization.

    // Select the SVG element and set its attributes
    const svg = d3.select("#graph") // selects the SVG element with the ID "graph", this element is where the graph visualization will be rendered.
        .attr("width", width)
        .attr("height", height) // These dimensions(width and height) define the size of the SVG canvas.
        .append("g") // Append 'g' element to SVG, In D3.js, the 'g' element is an SVG group element. Used as container that holds other SVG elements like circles(here nodes)
        .call(d3.zoom()
            .scaleExtent([0.1, 10])
            .on("zoom", zoomed));

    const link = svg.append("g")
        .selectAll("line") // This selects all existing line elements (<line>) that are descendants of the <g> element.
        .data(links) // This binds the data ('links' array) to the selected elements. In this case, it associates each link in the links array with a yet-to-be-created <line> element.
        .enter().append("line") // .enter() method returns the placeholder selection for entering new data and then appends a new <line> element for each data point in the dataset that doesn't have a corresponding existing element. This effectively creates a new <line> element for each link in the links array.
        .attr("stroke", "#999") // stroke color of the lines to a light gray color
        .attr("stroke-opacity", 0.6) // This sets the opacity of the stroke to 0.6, making the lines slightly transparent.
        .attr("stroke-width", 1); // Sets the width of the lines to 1 pixel.

    // Create nodes
    const node = svg.append("g")
        .selectAll("circle")
        .data(nodes) // binds the data (nodes array) to the selected elements. It associates each node in the nodes array with a <circle> element.
        .enter().append("circle") // creates a new <circle> element for each node in the nodes array.
        .attr("r", 6) // sets the radius of the circles(nodes) to 5 pixels
        .attr("fill", d => color(d.group)) // sets the fill color of the nodes based on their group ('from' or 'to'). The color function is used to determine the color based on the group assigned to each node.
        .attr("stroke-width", 1.5) // sets the width of the circle strokes to 1.5 pixels
        .call(d3.drag() // d3.drag() function sets up the drag behaviour
            .on("start", dragstarted)// dragging starts
            .on("drag", dragged) // during dragging
            .on("end", dragended)) // when dragging ends
        .on("click", handleClick); // event listener to trigger the handleClick function when a node is clicked. it's used to display an alert with the address associated with the clicked node.

    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0); // Initially hidden


    // Add mouseover, mousemove, and mouseout events to nodes
    node.on("mouseover", function (event, d) {
        tooltip.transition()
            .duration(200)
            .style("display", "block")
            .style("opacity", 1) // Make tooltip visible on hover
            .style("background-color", "#555")
            .style("color", "#fff")
            .style("border-radius", "6px")
            .style("padding", "4px 3px")
            .style("width", "450px")
            .style("text-align", "center")


        tooltip.html("Address: " + d.id)
            .style("left", (event.pageX + 10) + "px")   // Position with offset from mouse
            .style("top", (event.pageY - 28) + "px");
    })

        .on("mouseout", function (d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0) // Start transition to fade out 
                .style("display", "none")
        });

    // Update node and link positions during simulation
    simulation.on("tick", () => { //  "tick" event is repeatedly triggered as the simulation iteratively adjusts the positions of nodes and links
        link.attr("x1", d => d.source.x) // updates the x-coordinate of the starting point (x1) of each link (<line>) based on the x-coordinate of the source node.
            .attr("y1", d => d.source.y) // This updates the y-coordinate of the starting point of each link based on the y-coordinate of the source node (d.source.y)
            .attr("x2", d => d.target.x) // it updates the x-coordinate of the ending point (x2) of each link (<line>) based on the x-coordinate of the target node (d.target.x).
            .attr("y2", d => d.target.y); // updates the y-coordinate of the ending point of each link based on the y-coordinate of the target node.

        node.attr("cx", d => d.x) // cx attribute defines the x-coordinate of the center of the circle, 'd'represents the data associated with each circle. This represents the x-coordinate of the node as calculated by the simulation. This updates the horizontal position of each node.
            .attr("cy", d => d.y); // represents the y-coordinate of the node as calculated by the simulation. This updates the vertical position of each node.
    });

    // Handle zooming
    function zoomed(event) { // zoomed function will handle the zooming behavior of the SVG element, it is a callback function that gets called whenever a zoom event occurs on the SVG element.
        svg.attr("transform", event.transform); // applies a transformation to the SVG element's contents based on the zoom event. 'event.transform' object contains information about the current zoom level
    } // The transform attribute allows you to apply transformations like scaling, rotation, etc., to SVG elements.

    // Handle node dragging
    function dragstarted(event) { // function is called when a drag interaction starts on a node.
        if (!event.active) simulation.alphaTarget(0.3).restart(); // It checks if the drag interaction is active. If it's not active ie, it's the beginning of a drag operation, it restarts the simulation with a lower alpha target value to allow for smoother movement
        event.subject.fx = event.subject.x; // It sets the fixed x coordinate of the node to its current x position. This keeps the node fixed at its current position during the drag operation.
        event.subject.fy = event.subject.y; // It sets the fixed y coordinate of the node to its current y position.
    }

    function dragged(event) { // This function will be called continuously while a node is being dragged.
        event.subject.fx = event.x;// It updates the fixed x coordinates of the node to the current mouse position (event.x similarly event.y). This makes the node follow the mouse cursor during the drag operation.
        event.subject.fy = event.y;
    }

    function dragended(event) { // This function is called when the drag interaction ends
        if (!event.active) simulation.alphaTarget(0); // It checks if the drag interaction is active. If it's not active, ie, drag operation has ended, it sets the alpha target of the simulation back to 0 to gradually stop the simulation.
        event.subject.fx = null; // It resets the fixed x and y coordinates of the node to null, allowing the node to be freely positioned by the simulation forces again.
        event.subject.fy = null;
    }

    // Handle node click event to display node address as alert
    function handleClick(event, d) { // displays an alert containing the address associated with the clicked node
        alert("Address: " + d.id); // 'd' parameter represents the data associated with the clicked node(address).
    }
}

// Add event listeners for left and right arrow keys
document.getElementById('prev-block').addEventListener('click', () => { // it retrieves the HTML element with the ID 'prev-block'. It selects the button element that the user interacts with.
    blockNumber = parseInt(blockNumber) - 1;
    localStorage.setItem("currentBlockNumber", blockNumber);
    document.getElementById('current-block').textContent = `Block Number: ${blockNumber}`;
    d3.select('#graph').selectAll('*').remove();
    fetch(`http://127.0.0.1:8000/block/${blockNumber}`)
        .then(response => response.json()) // Convert response to JSON. First When the HTTP response is received, .then() method takes the response object and calls its .json() method and the purpose of response.json() is to parse the HTTP response body as JSON.
        .then(data => processData(data)) // Process fetched data. Here the arrow function data => processData(data) is passed as a callback to the .then() method. It receives the JSON data as its argument (data), which is the resolved value of the previous promise.
        .catch(error => console.error('Error fetching transaction data:', error)); // Handle fetch error
});

document.getElementById('next-block').addEventListener('click', () => {
    blockNumber = parseInt(blockNumber) + 1;
    localStorage.setItem("currentBlockNumber", blockNumber);
    document.getElementById('current-block').textContent = `Block Number: ${blockNumber}`;
    d3.select('#graph').selectAll('*').remove();
    fetch(`http://127.0.0.1:8000/block/${blockNumber}`)
        .then(response => response.json()) // Convert response to JSON. First When the HTTP response is received, .then() method takes the response object and calls its .json() method and the purpose of response.json() is to parse the HTTP response body as JSON.
        .then(data => processData(data)) // Process fetched data. Here the arrow function data => processData(data) is passed as a callback to the .then() method. It receives the JSON data as its argument (data), which is the resolved value of the previous promise.
        .catch(error => console.error('Error fetching transaction data:', error)); // Handle fetch error
});

document.getElementById('search-btn').addEventListener('click', () => {
    blockNumber = document.getElementById('block-search').value;
    localStorage.setItem("currentBlockNumber", blockNumber);
    document.getElementById('current-block').textContent = `Block Number: ${blockNumber}`;
    d3.select('#graph').selectAll('*').remove();
    fetch(`http://127.0.0.1:8000/block/${blockNumber}`)
        .then(response => response.json()) // Convert response to JSON. First When the HTTP response is received, .then() method takes the response object and calls its .json() method and the purpose of response.json() is to parse the HTTP response body as JSON.
        .then(data => processData(data)) // Process fetched data. Here the arrow function data => processData(data) is passed as a callback to the .then() method. It receives the JSON data as its argument (data), which is the resolved value of the previous promise.
        .catch(error => console.error('Error fetching transaction data:', error)); // Handle fetch error
});