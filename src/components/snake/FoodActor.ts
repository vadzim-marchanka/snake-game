import { Position, FoodItem } from './events';

const GRID_SIZE = 20;
const FOOD_COUNT = 10;

export class FoodActor {
  private foods: FoodItem[] = [];

  constructor() {
    this.foods = this.generateFoods();
  }

  getFoods(): FoodItem[] {
    return this.foods;
  }

  private generateFood(): FoodItem {
    return {
      position: {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      },
      type: Math.floor(Math.random() * 10)
    };
  }

  private generateFoods(): FoodItem[] {
    const foods: FoodItem[] = [];
    while (foods.length < FOOD_COUNT) {
      const newFood = this.generateFood();
      // Check if the position is already occupied by other food
      const isOccupied = foods.some(food => 
        food.position.x === newFood.position.x && food.position.y === newFood.position.y
      );
      
      if (!isOccupied) {
        foods.push(newFood);
      }
    }
    return foods;
  }

  replaceFoodAtPosition(position: Position): void {
    const foodIndex = this.foods.findIndex(food => 
      food.position.x === position.x && food.position.y === position.y
    );
    if (foodIndex !== -1) {
      this.foods[foodIndex] = this.generateFood();
    }
  }

  reset(): void {
    this.foods = this.generateFoods();
  }
} 