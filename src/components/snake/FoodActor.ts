import { Position, FoodItem } from './events';

const GRID_SIZE = 20;
const FOOD_COUNT = 10;

export class FoodActor {
  private foods: FoodItem[] = [];

  constructor() {
    this.foods = this.generateFoods([]);
  }

  getFoods(): FoodItem[] {
    return this.foods;
  }

  private getAvailableCells(occupiedCells: Position[] = []): Position[] {
    const availableCells: Position[] = [];
    
    // Generate all possible grid positions
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        // Check if this position is occupied
        const isOccupied = (Array.isArray(occupiedCells) && occupiedCells.some(cell => 
          cell.x === x && cell.y === y
        )) || this.foods.some(food => 
          food.position.x === x && food.position.y === y
        );
        
        if (!isOccupied) {
          availableCells.push({ x, y });
        }
      }
    }
    
    return availableCells;
  }

  private generateFood(availableCells: Position[]): FoodItem | null {
    if (availableCells.length === 0) {
      return null;
    }
    
    const randomIndex = Math.floor(Math.random() * availableCells.length);
    const position = availableCells[randomIndex];
    const type = Math.floor(Math.random() * 10);
    
    return { position, type };
  }

  private generateFoods(occupiedCells: Position[]): FoodItem[] {
    const foods: FoodItem[] = [];
    let availableCells = this.getAvailableCells(occupiedCells);

    while (foods.length < FOOD_COUNT && availableCells.length > 0) {
      const newFood = this.generateFood(availableCells);
      if (newFood) {
        foods.push(newFood);
        // Update available cells by removing the one we just used
        availableCells = availableCells.filter(cell => 
          cell.x !== newFood.position.x || cell.y !== newFood.position.y
        );
      } else {
        break;
      }
    }
    
    return foods;
  }

  replaceFoodAtPosition(position: Position, occupiedCells: Position[]): void {
    const foodIndex = this.foods.findIndex(food => 
      food.position.x === position.x && food.position.y === position.y
    );
    
    if (foodIndex !== -1) {
      const availableCells = this.getAvailableCells(occupiedCells);
      const newFood = this.generateFood(availableCells);
      if (newFood) {
        this.foods[foodIndex] = newFood;
      } else {
        // If no available cells, remove the food
        this.foods = this.foods.filter((_, index) => index !== foodIndex);
      }
    }
  }

  reset(occupiedCells: Position[] = []): void {
    this.foods = this.generateFoods(occupiedCells);
  }
} 