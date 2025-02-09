import { FoodActor } from '../snake/FoodActor';
import { Position } from '../snake/events';

describe('FoodActor', () => {
  let foodActor: FoodActor;

  beforeEach(() => {
    foodActor = new FoodActor();
  });

  describe('initial state', () => {
    it('should initialize with correct number of food items', () => {
      const foods = foodActor.getFoods();
      expect(foods).toHaveLength(10); // FOOD_COUNT constant
    });

    it('should generate food items with valid positions', () => {
      const foods = foodActor.getFoods();
      foods.forEach(food => {
        expect(food.position.x).toBeGreaterThanOrEqual(0);
        expect(food.position.x).toBeLessThan(20); // GRID_SIZE constant
        expect(food.position.y).toBeGreaterThanOrEqual(0);
        expect(food.position.y).toBeLessThan(20);
      });
    });

    it('should generate food items with valid types', () => {
      const foods = foodActor.getFoods();
      foods.forEach(food => {
        expect(food.type).toBeGreaterThanOrEqual(0);
        expect(food.type).toBeLessThan(10);
      });
    });

    it('should not generate food items with duplicate positions', () => {
      const foods = foodActor.getFoods();
      const positions = new Set();
      
      foods.forEach(food => {
        const posKey = `${food.position.x},${food.position.y}`;
        expect(positions.has(posKey)).toBe(false);
        positions.add(posKey);
      });
    });
  });

  describe('food replacement', () => {
    it('should replace food at given position', () => {
      const initialFoods = foodActor.getFoods();
      const foodToReplace = initialFoods[0];
      const position: Position = foodToReplace.position;

      foodActor.replaceFoodAtPosition(position);
      const newFoods = foodActor.getFoods();
      
      // Check that a food item still exists at the index
      expect(newFoods).toHaveLength(initialFoods.length);
      
      // Find if there's still a food at the exact same position
      const foodAtSamePosition = newFoods.find(food => 
        food.position.x === position.x && food.position.y === position.y
      );
      
      // Either the position should be different, or if same, the type should be different
      if (foodAtSamePosition) {
        expect(foodAtSamePosition.type).not.toBe(foodToReplace.type);
      }
    });

    it('should do nothing when replacing non-existent food position', () => {
      const initialFoods = foodActor.getFoods();
      const nonExistentPosition: Position = { x: -1, y: -1 };

      foodActor.replaceFoodAtPosition(nonExistentPosition);
      const newFoods = foodActor.getFoods();

      expect(newFoods).toEqual(initialFoods);
    });
  });

  describe('reset', () => {
    it('should generate new set of foods on reset', () => {
      const initialFoods = foodActor.getFoods();
      foodActor.reset();
      const newFoods = foodActor.getFoods();

      expect(newFoods).toHaveLength(initialFoods.length);
      // Foods should be different after reset (this might rarely fail due to randomness)
      expect(newFoods).not.toEqual(initialFoods);
    });
  });
}); 