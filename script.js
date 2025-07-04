const width = window.innerWidth;
const height = window.innerHeight - 60;

let blockNumber = localStorage.getItem("currentBlockNumber");
if (!blockNumber) {
    blockNumber = 22845771;
    localStorage.setItem("currentBlockNumber", blockNumber);
}

document.getElementById('current-block').textContent = `Block Number: ${blockNumber}`;

// Initial load
fetchAndRenderBlock(blockNumber);

// Fetch and render block data
function fetchAndRenderBlock(blockNum) {
    d3.select('#graph').selectAll('*').remove();
    
    // Show loading indicator
    d3.select('#graph').append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '18px')
        .style('fill', '#666')
        .text('Loading block data...');
    
    fetch(`http://127.0.0.1:8000/block/${blockNum}`)
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.detail || `HTTP ${response.status}: ${response.statusText}`);
                });
            }
            return response.json();
        })
        .then(data => {
            d3.select('#graph').selectAll('*').remove(); // Clear loading message
            processData(data);
        })
        .catch(error => {
            console.error('Error fetching transaction data:', error);
            
            // Clear loading message and show error
            d3.select('#graph').selectAll('*').remove();
            d3.select('#graph').append('text')
                .attr('x', width / 2)
                .attr('y', height / 2)
                .attr('text-anchor', 'middle')
                .style('font-size', '16px')
                .style('fill', '#ff6b6b')
                .text(`Error: ${error.message}`);
                
            // Show alert for user feedback
            alert(`Error loading block ${blockNum}: ${error.message}`);
        });
}

// Process data obtained from JSON
function processData(data) {
    let jsonString = JSON.parse(data.links);
    
    const color = d3.scaleOrdinal()
        .domain(['from', 'to'])
        .range(['blue', 'green']);

    const nodesMap = new Map();
    const links = [];

    // Build nodes and links from transaction data
    jsonString.forEach(transaction => {
        Object.keys(transaction).forEach(from => {
            if (!nodesMap.has(from)) {
                nodesMap.set(from, { id: from, group: 'from' });
            }

            Object.values(transaction).forEach(to => {
                if (!nodesMap.has(to)) {
                    nodesMap.set(to, { id: to, group: 'to' });
                }
                links.push({ source: from, target: to });
            });
        });
    });

    const nodes = Array.from(nodesMap.values());

    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id))
        .force("charge", d3.forceManyBody())
        .force("x", d3.forceX(width / 2).strength(0.1))
        .force("y", d3.forceY(height / 2).strength(0.1));

    // Create SVG and zoom behavior
    const svg = d3.select("#graph")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .call(d3.zoom()
            .scaleExtent([0.1, 10])
            .on("zoom", zoomed));

    // Create links
    const link = svg.append("g")
        .selectAll("line")
        .data(links)
        .enter().append("line")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .attr("stroke-width", 1);

    // Create nodes
    const node = svg.append("g")
        .selectAll("circle")
        .data(nodes)
        .enter().append("circle")
        .attr("r", 6)
        .attr("fill", d => color(d.group))
        .attr("stroke-width", 1.5)
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended))
        .on("click", handleClick);

    // Create tooltip
    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Add tooltip events
    node.on("mouseover", function (event, d) {
        tooltip.transition()
            .duration(200)
            .style("display", "block")
            .style("opacity", 1)
            .style("background-color", "#555")
            .style("color", "#fff")
            .style("border-radius", "6px")
            .style("padding", "4px 3px")
            .style("width", "450px")
            .style("text-align", "center");

        tooltip.html("Address: " + d.id)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function (d) {
        tooltip.transition()
            .duration(500)
            .style("opacity", 0)
            .style("display", "none");
    });

    // Update positions on simulation tick
    simulation.on("tick", () => {
        link.attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node.attr("cx", d => d.x)
            .attr("cy", d => d.y);
    });

    // Zoom handler
    function zoomed(event) {
        svg.attr("transform", event.transform);
    }

    // Drag handlers
    function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    }

    function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }

    function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
    }

    // Click handler
    function handleClick(event, d) {
        alert("Address: " + d.id);
    }
}

// Navigation event listeners
document.getElementById('prev-block').addEventListener('click', () => {
    blockNumber = parseInt(blockNumber) - 1;
    updateBlockAndRender();
});

document.getElementById('next-block').addEventListener('click', () => {
    blockNumber = parseInt(blockNumber) + 1;
    updateBlockAndRender();
});

document.getElementById('search-btn').addEventListener('click', () => {
    blockNumber = document.getElementById('block-search').value;
    updateBlockAndRender();
});

// Helper function to update block number and render
function updateBlockAndRender() {
    localStorage.setItem("currentBlockNumber", blockNumber);
    document.getElementById('current-block').textContent = `Block Number: ${blockNumber}`;
    fetchAndRenderBlock(blockNumber);
}