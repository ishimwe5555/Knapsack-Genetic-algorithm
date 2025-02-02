from flask import Flask, render_template, jsonify, request
import numpy as np
import random
import json

app = Flask(__name__)

# TSP Implementation
def create_tsp_population(cities, population_size):
    return [random.sample(range(len(cities)), len(cities)) for _ in range(population_size)]

def tsp_fitness(route, cities):
    total_distance = 0
    for i in range(len(route)):
        city1 = cities[route[i]]
        city2 = cities[route[(i + 1) % len(route)]]
        total_distance += np.sqrt((city1[0] - city2[0])**2 + (city1[1] - city2[1])**2)
    return 1 / total_distance

def tsp_crossover(parent1, parent2):
    size = len(parent1)
    start, end = sorted(random.sample(range(size), 2))
    child = [-1] * size
    child[start:end] = parent1[start:end]
    remaining = [x for x in parent2 if x not in child[start:end]]
    child[:start] = remaining[:start]
    child[end:] = remaining[start:]
    return child

def tsp_mutate(route, mutation_rate=0.01):
    if random.random() < mutation_rate:
        i, j = random.sample(range(len(route)), 2)
        route[i], route[j] = route[j], route[i]
    return route

# Knapsack Implementation
def create_knapsack_population(items, population_size):
    n_items = len(items)
    return [[random.randint(0, 1) for _ in range(n_items)] for _ in range(population_size)]

def knapsack_fitness(solution, items, max_weight):
    total_value = 0
    total_weight = 0
    for i, include in enumerate(solution):
        if include:
            total_value += items[i]['value']
            total_weight += items[i]['weight']
    if total_weight > max_weight:
        return 0
    return total_value

def knapsack_crossover(parent1, parent2):
    crossover_point = random.randint(0, len(parent1)-1)
    child = parent1[:crossover_point] + parent2[crossover_point:]
    return child

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/solve-tsp', methods=['POST'])
def solve_tsp():
    data = request.get_json()
    cities = data['cities']
    generations = data['generations']
    population_size = 100  
    mutation_rate = 0.01
    
    population = create_tsp_population(cities, population_size)
    best_route = None
    best_fitness = 0
    best_distance = float('inf')
    
    for _ in range(generations):
        # Calculate fitness for each route
        fitness_scores = [tsp_fitness(route, cities) for route in population]
        
        # Update best solution if we found a better one
        current_best_idx = max(range(len(fitness_scores)), key=lambda i: fitness_scores[i])
        current_best = population[current_best_idx]
        current_fitness = fitness_scores[current_best_idx]
        current_distance = 1/current_fitness
        
        if current_distance < best_distance:
            best_distance = current_distance
            best_route = current_best.copy()
            best_fitness = current_fitness
        
        # Select parents for next generation using tournament selection
        def tournament_select():
            tournament = random.sample(list(enumerate(fitness_scores)), 3)
            return population[max(tournament, key=lambda x: x[1])[0]]
        
        # Create new generation
        new_population = []
        elite_count = 2  # Keep the best solutions
        new_population.extend([population[i] for i in sorted(range(len(fitness_scores)), 
                                                           key=lambda i: fitness_scores[i], 
                                                           reverse=True)[:elite_count]])
        
        while len(new_population) < population_size:
            parent1 = tournament_select()
            parent2 = tournament_select()
            child = tsp_crossover(parent1, parent2)
            child = tsp_mutate(child, mutation_rate)
            new_population.append(child)
        
        population = new_population
    
    return jsonify({
        'route': best_route,
        'distance': best_distance
    })

@app.route('/solve-knapsack', methods=['POST'])
def solve_knapsack():
    data = request.get_json()
    items = data['items']
    max_weight = data['maxWeight']
    generations = data['generations']
    population_size = 50
    
    population = create_knapsack_population(items, population_size)
    best_solution = None
    best_value = 0
    
    for _ in range(generations):
        # Calculate fitness for each solution
        fitness_scores = [knapsack_fitness(solution, items, max_weight) for solution in population]
        
        # Select parents for next generation
        parents = random.choices(population, weights=fitness_scores, k=population_size)
        
        # Create new generation
        new_population = []
        for i in range(0, population_size, 2):
            parent1 = parents[i]
            parent2 = parents[min(i+1, population_size-1)]
            child1 = knapsack_crossover(parent1, parent2)
            child2 = knapsack_crossover(parent2, parent1)
            new_population.extend([child1, child2])
        
        population = new_population[:population_size]
        
        # Track best solution
        current_best = max(zip(fitness_scores, population))[1]
        current_value = knapsack_fitness(current_best, items, max_weight)
        if current_value > best_value:
            best_value = current_value
            best_solution = current_best
    
    selected_items = [
        {'index': i, **item} 
        for i, (selected, item) in enumerate(zip(best_solution, items)) 
        if selected
    ]
    
    return jsonify({
        'selectedItems': selected_items,
        'totalValue': best_value
    })

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
