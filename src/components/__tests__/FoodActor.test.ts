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
      expect(foods).toHaveLength(100); // FOOD_COUNT constant is now 100
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

    it('should not generate food items on occupied cells', () => {
      const occupiedCells: Position[] = [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 2 }
      ];
      
      foodActor = new FoodActor();
      foodActor.reset(occupiedCells);
      const foods = foodActor.getFoods();
      
      foods.forEach(food => {
        const isOccupied = occupiedCells.some(cell => 
          cell.x === food.position.x && cell.y === food.position.y
        );
        expect(isOccupied).toBe(false);
      });
    });
  });

  describe('food replacement', () => {
    it('should replace food at given position avoiding occupied cells', () => {
      const initialFoods = foodActor.getFoods();
      const foodToReplace = initialFoods[0];
      const position: Position = foodToReplace.position;
      const occupiedCells: Position[] = [
        { x: position.x + 1, y: position.y },
        { x: position.x, y: position.y + 1 }
      ];

      foodActor.replaceFoodAtPosition(position, occupiedCells);
      const newFoods = foodActor.getFoods();
      
      // Check that a food item still exists at the index
      expect(newFoods).toHaveLength(initialFoods.length);
      
      // Verify new food is not on occupied cells
      const newFood = newFoods.find(food => 
        food !== initialFoods[0]
      );
      if (newFood) {
        const isOccupied = occupiedCells.some(cell => 
          cell.x === newFood.position.x && cell.y === newFood.position.y
        );
        expect(isOccupied).toBe(false);
      }
    });

    it('should do nothing when replacing non-existent food position', () => {
      const initialFoods = foodActor.getFoods();
      const nonExistentPosition: Position = { x: -1, y: -1 };
      const occupiedCells: Position[] = [{ x: 0, y: 0 }];

      foodActor.replaceFoodAtPosition(nonExistentPosition, occupiedCells);
      const newFoods = foodActor.getFoods();

      expect(newFoods).toEqual(initialFoods);
    });

    it('should remove food if no available cells for replacement', () => {
      const initialFoods = foodActor.getFoods();
      const foodToReplace = initialFoods[0];
      const position: Position = foodToReplace.position;
      
      // Create occupied cells for all positions except the one being replaced
      const occupiedCells: Position[] = [];
      for (let x = 0; x < 20; x++) {
        for (let y = 0; y < 20; y++) {
          if (x !== position.x || y !== position.y) {
            occupiedCells.push({ x, y });
          }
        }
      }

      foodActor.replaceFoodAtPosition(position, occupiedCells);
      const newFoods = foodActor.getFoods();

      expect(newFoods).toHaveLength(initialFoods.length - 1);
    });
  });

  describe('reset', () => {
    it('should generate new set of foods on reset respecting occupied cells', () => {
      const occupiedCells: Position[] = [
        { x: 0, y: 0 },
        { x: 1, y: 1 }
      ];
      
      const initialFoods = foodActor.getFoods();
      foodActor.reset(occupiedCells);
      const newFoods = foodActor.getFoods();

      expect(newFoods).toHaveLength(initialFoods.length);
      
      // Verify no food on occupied cells
      newFoods.forEach(food => {
        const isOccupied = occupiedCells.some(cell => 
          cell.x === food.position.x && cell.y === food.position.y
        );
        expect(isOccupied).toBe(false);
      });
    });
  });
}); 