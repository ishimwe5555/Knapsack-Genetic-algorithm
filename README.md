# Genetic Algorithms Demo

This is an interactive web application that demonstrates genetic algorithms using two classic optimization problems:
1. Traveling Salesman Problem (TSP)
2. Knapsack Problem

## Features

### Traveling Salesman Problem
- Interactive canvas where you can add cities by clicking
- Random city generation
- Visualization of the optimal route
- Configurable number of generations for the genetic algorithm

### Knapsack Problem
- Dynamic item management (add/remove items)
- Configurable item weights and values
- Configurable maximum weight capacity
- Configurable number of generations for the genetic algorithm

## Setup and Running

1. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Linux/Mac
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the application:
```bash
python app.py
```

4. Open your browser and navigate to `http://localhost:5000`

## How to Use

### TSP Demo
1. Add cities by either:
   - Clicking on the canvas
   - Using the "Add City" button for random placement
2. Set the number of generations
3. Click "Solve TSP" to find an optimal route
4. Use "Clear Cities" to start over

### Knapsack Demo
1. Set the maximum weight capacity
2. Add items with their weights and values
3. Set the number of generations
4. Click "Solve Knapsack" to find the optimal selection of items

## Implementation Details

The application uses:
- Flask for the backend
- Bootstrap for styling
- Canvas API for TSP visualization
- Genetic Algorithm implementation with:
  - Random initialization
  - Fitness-based selection
  - Crossover operations
  - Basic mutation (implicit in the implementation)
