// TSP Canvas Setup
const tspCanvas = document.getElementById('tspCanvas');
const ctx = tspCanvas.getContext('2d');
let cities = [];

// TSP Canvas Event Listeners
tspCanvas.addEventListener('click', (e) => {
    const rect = tspCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cities.push([x, y]);
    drawCities();
});

function drawCities() {
    ctx.clearRect(0, 0, tspCanvas.width, tspCanvas.height);
    
    // Draw cities
    cities.forEach((city, index) => {
        ctx.beginPath();
        ctx.arc(city[0], city[1], index === 0 ? 8 : 5, 0, 2 * Math.PI);
        ctx.fillStyle = index === 0 ? '#ff0000' : '#007bff';
        ctx.fill();
        if (index === 0) {
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        ctx.fillStyle = '#000';
        ctx.fillText(index === 0 ? 'Start' : `City ${index + 1}`, city[0] + 10, city[1] + 10);
    });
}

function drawRoute(route) {
    ctx.beginPath();
    ctx.strokeStyle = '#28a745';
    ctx.lineWidth = 2;
    
    // Always start from city 0
    const startCityIndex = route.indexOf(0);
    const reorderedRoute = [...route.slice(startCityIndex), ...route.slice(0, startCityIndex)];
    
    reorderedRoute.forEach((cityIndex, i) => {
        const city = cities[cityIndex];
        if (i === 0) {
            ctx.moveTo(city[0], city[1]);
        } else {
            ctx.lineTo(city[0], city[1]);
        }
    });
    
    // Connect back to the first city
    if (route.length > 0) {
        const firstCity = cities[reorderedRoute[0]];
        ctx.lineTo(firstCity[0], firstCity[1]);
    }
    
    ctx.stroke();
    
    // Draw arrows to show direction
    reorderedRoute.forEach((cityIndex, i) => {
        const city1 = cities[cityIndex];
        const city2 = cities[reorderedRoute[(i + 1) % reorderedRoute.length]];
        drawArrow(city1[0], city1[1], city2[0], city2[1]);
    });
}

// Add this new function to draw arrows
function drawArrow(fromX, fromY, toX, toY) {
    const headLength = 10;
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);
    
    // Calculate the point slightly before the destination to avoid overlapping with the city circle
    const shortenBy = 8;
    const endX = toX - Math.cos(angle) * shortenBy;
    const endY = toY - Math.sin(angle) * shortenBy;
    
    ctx.beginPath();
    ctx.moveTo(endX - headLength * Math.cos(angle - Math.PI / 6), 
               endY - headLength * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(endX, endY);
    ctx.lineTo(endX - headLength * Math.cos(angle + Math.PI / 6),
               endY - headLength * Math.sin(angle + Math.PI / 6));
    ctx.strokeStyle = '#28a745';
    ctx.lineWidth = 2;
    ctx.stroke();
}

// TSP Buttons
document.getElementById('addCityBtn').addEventListener('click', () => {
    const x = Math.random() * tspCanvas.width;
    const y = Math.random() * tspCanvas.height;
    cities.push([x, y]);
    drawCities();
});

document.getElementById('clearCitiesBtn').addEventListener('click', () => {
    cities = [];
    ctx.clearRect(0, 0, tspCanvas.width, tspCanvas.height);
    document.getElementById('tspResult').innerHTML = '';
});

document.getElementById('solveTspBtn').addEventListener('click', async () => {
    if (cities.length < 2) {
        alert('Please add at least 2 cities');
        return;
    }
    
    const generations = parseInt(document.getElementById('tspGenerations').value);
    
    const response = await fetch('/solve-tsp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            cities: cities,
            generations: generations
        }),
    });
    
    const result = await response.json();
    drawCities();
    drawRoute(result.route);
    
    document.getElementById('tspResult').innerHTML = `
        <strong>Total Distance:</strong> ${result.distance.toFixed(2)} units
    `;
});

// Knapsack Problem Setup
let items = [];

function createItemEntry(weight, value) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'item-entry';
    itemDiv.innerHTML = `
        <div class="row">
            <div class="col">
                <label>Weight:</label>
                <input type="number" class="form-control weight-input" value="${weight}" min="1">
            </div>
            <div class="col">
                <label>Value:</label>
                <input type="number" class="form-control value-input" value="${value}" min="1">
            </div>
            <div class="col-auto">
                <button class="btn btn-danger remove-item-btn mt-4">Remove</button>
            </div>
        </div>
    `;
    
    itemDiv.querySelector('.remove-item-btn').addEventListener('click', () => {
        itemDiv.remove();
    });
    
    return itemDiv;
}

document.getElementById('addItemBtn').addEventListener('click', () => {
    const weight = Math.floor(Math.random() * 20) + 1;
    const value = Math.floor(Math.random() * 50) + 1;
    document.getElementById('itemsContainer').appendChild(createItemEntry(weight, value));
});

// Add some initial items
for (let i = 0; i < 5; i++) {
    document.getElementById('addItemBtn').click();
}

document.getElementById('solveKnapsackBtn').addEventListener('click', async () => {
    const itemEntries = document.querySelectorAll('.item-entry');
    if (itemEntries.length === 0) {
        alert('Please add at least one item');
        return;
    }
    
    const items = Array.from(itemEntries).map(entry => ({
        weight: parseInt(entry.querySelector('.weight-input').value),
        value: parseInt(entry.querySelector('.value-input').value)
    }));
    
    const maxWeight = parseInt(document.getElementById('maxWeight').value);
    const generations = parseInt(document.getElementById('knapsackGenerations').value);
    
    const response = await fetch('/solve-knapsack', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            items: items,
            maxWeight: maxWeight,
            generations: generations
        }),
    });
    
    const result = await response.json();
    
    let resultHtml = `
        <strong>Total Value:</strong> ${result.totalValue}<br>
        <strong>Selected Items:</strong><br>
        <ul>
    `;
    
    result.selectedItems.forEach(item => {
        resultHtml += `
            <li>Item ${item.index + 1}: Weight=${item.weight}, Value=${item.value}</li>
        `;
    });
    
    resultHtml += '</ul>';
    document.getElementById('knapsackResult').innerHTML = resultHtml;
});
