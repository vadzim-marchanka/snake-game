import { FoodActor } from '../FoodActor';
import { Position } from '../events';

describe('FoodActor', () => {
  let foodActor: FoodActor;

  beforeEach(() => {
    foodActor = new FoodActor();
  });

  describe('initialization', () => {
    it('initializes with correct number of food items', () => {
      const foods = foodActor.getFoods();
      expect(foods).toHaveLength(10);
    });

    it('generates food items with valid positions and types', () => {
      const foods = foodActor.getFoods();
      foods.forEach(food => {
        expect(food.position.x).toBeGreaterThanOrEqual(0);
        expect(food.position.x).toBeLessThan(20);
        expect(food.position.y).toBeGreaterThanOrEqual(0);
        expect(food.position.y).toBeLessThan(20);
        expect(food.type).toBeGreaterThanOrEqual(0);
        expect(food.type).toBeLessThan(10);
      });
    });

    it('generates food items with unique positions', () => {
      const foods = foodActor.getFoods();
      const positions = new Set<string>();
      foods.forEach(food => {
        const posKey = `${food.position.x},${food.position.y}`;
        expect(positions.has(posKey)).toBe(false);
        positions.add(posKey);
      });
    });
  });

  describe('food collision', () => {
    it('detects collision with food', () => {
      const foods = foodActor.getFoods();
      const firstFood = foods[0];
      const collision = foodActor.checkFoodCollision(firstFood.position);
      expect(collision).toBeDefined();
      expect(collision).toEqual(firstFood);
    });

    it('returns undefined when no collision', () => {
      const noFoodPosition: Position = { x: -1, y: -1 };
      const collision = foodActor.checkFoodCollision(noFoodPosition);
      expect(collision).toBeUndefined();
    });
  });

  describe('food replacement', () => {
    it('replaces food at given position', () => {
      const foods = foodActor.getFoods();
      const firstFood = foods[0];
      foodActor.replaceFoodAtPosition(firstFood.position);
      const newFoods = foodActor.getFoods();
      const replacedFood = newFoods.find(food => 
        food.position.x === firstFood.position.x && 
        food.position.y === firstFood.position.y
      );
      expect(replacedFood).toBeUndefined();
    });

    it('maintains food count after replacement', () => {
      const foods = foodActor.getFoods();
      const firstFood = foods[0];
      foodActor.replaceFoodAtPosition(firstFood.position);
      const newFoods = foodActor.getFoods();
      expect(newFoods).toHaveLength(10);
    });
  });

  describe('reset', () => {
    it('generates new food items on reset', () => {
      const initialFoods = foodActor.getFoods();
      foodActor.reset();
      const newFoods = foodActor.getFoods();
      expect(newFoods).toHaveLength(initialFoods.length);
      expect(newFoods).not.toEqual(initialFoods);
    });
  });

  describe('position checking', () => {
    it('correctly identifies positions occupied by food', () => {
      const foods = foodActor.getFoods();
      const firstFood = foods[0];
      expect(foodActor.isPositionOccupiedByFood(firstFood.position)).toBe(true);
    });

    it('correctly identifies positions not occupied by food', () => {
      const noFoodPosition: Position = { x: -1, y: -1 };
      expect(foodActor.isPositionOccupiedByFood(noFoodPosition)).toBe(false);
    });
  });
}); 