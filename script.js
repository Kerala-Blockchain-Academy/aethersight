const nodes = d3.range(20).map(() => ({ id: Math.random().toString(36).substr(2, 5) })); // 100 nodes with random IDs

const links = [];
for (let i = 0; i < 30; i++) { // Create some random links (adjust number as needed)
    const sourceIndex = Math.floor(Math.random() * nodes.length);
    const targetIndex = Math.floor(Math.random() * nodes.length);
    // Make sure nodes don't connect to themselves
    if (sourceIndex !== targetIndex) {
        links.push({ source: nodes[sourceIndex], target: nodes[targetIndex] });
    }
}


// Create SVG element
const svg = d3.select("svg");

// Force simulation setup
const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id))  // Links act as attractive forces
    .force("charge", d3.forceManyBody().strength(-150)) // Repel nodes to prevent overlap
    .force("center", d3.forceCenter(800, 500));       // Keep the graph near the center 

// Create links as lines
const link = svg.append("g")
    .selectAll("line")
    .data(links)
    .join("line")
    .attr("stroke", "black");

// Create nodes as circles
const node = svg.append("g")
    .selectAll("circle")
    .data(nodes)
    .join("circle")
    .attr("r", 8)
    .attr("fill", "steelblue")
    .call(d3.drag()  // Make nodes draggable
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

// Update positions on each 'tick' of the simulation
simulation.on("tick", () => {
    link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
});

// Drag event functions
function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
}

function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}

