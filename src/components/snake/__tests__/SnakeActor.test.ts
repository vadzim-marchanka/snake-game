import { SnakeActor } from '../SnakeActor';
import { Direction, Position, FoodItem } from '../events';

describe('SnakeActor', () => {
  let snakeActor: SnakeActor;

  beforeEach(() => {
    snakeActor = new SnakeActor();
  });

  describe('initial state', () => {
    it('initializes with correct default values', () => {
      const state = snakeActor.getState();
      expect(state.snake).toHaveLength(2);
      expect(state.score).toBe(0);
      expect(state.gameOver).toBe(false);
      expect(state.isPaused).toBe(false);
      expect(state.direction).toEqual({ x: 0, y: -1 });
      expect(state.foods).toHaveLength(10);
      expect(state.colorPositions).toHaveLength(0);
      state.foods.forEach(food => {
        expect(food.position.x).toBeGreaterThanOrEqual(0);
        expect(food.position.x).toBeLessThan(20);
        expect(food.position.y).toBeGreaterThanOrEqual(0);
        expect(food.position.y).toBeLessThan(20);
        expect(food.type).toBeGreaterThanOrEqual(0);
        expect(food.type).toBeLessThan(10);
      });
    });
  });

  describe('direction changes', () => {
    it('updates direction when valid direction change requested', () => {
      const newDirection: Direction = { x: 1, y: 0 };
      snakeActor.handleEvent({ type: 'DIRECTION_CHANGED', direction: newDirection });
      
      expect(snakeActor.getState().direction).toEqual(newDirection);
    });

    it('allows perpendicular direction changes', () => {
      // Initial direction is { x: 0, y: -1 }
      const newDirection: Direction = { x: 1, y: 0 };
      snakeActor.handleEvent({ type: 'DIRECTION_CHANGED', direction: newDirection });
      
      expect(snakeActor.getState().direction).toEqual(newDirection);
    });

    it('does not allow 180° reversal', () => {
      const initialDirection = snakeActor.getState().direction;
      snakeActor.handleEvent({ type: 'DIRECTION_CHANGED', direction: { x: 0, y: 1 } });
      expect(snakeActor.getState().direction).toEqual(initialDirection);
    });

    it('ignores direction changes when game is paused', () => {
      snakeActor.handleEvent({ type: 'TOGGLE_PAUSE' });
      const initialDirection = snakeActor.getState().direction;
      const newDirection: Direction = { x: 1, y: 0 };
      snakeActor.handleEvent({ type: 'DIRECTION_CHANGED', direction: newDirection });
      
      expect(snakeActor.getState().direction).toEqual(initialDirection);
    });

    it('ignores direction changes when game is over', () => {
      // First cause game over by moving up into wall
      for (let i = 0; i < 11; i++) {
        snakeActor.handleEvent({ type: 'MOVE_REQUESTED' });
      }

      const newDirection: Direction = { x: 1, y: 0 };
      snakeActor.handleEvent({ type: 'DIRECTION_CHANGED', direction: newDirection });
      
      expect(snakeActor.getState().direction).not.toEqual(newDirection);
    });
  });

  describe('movement and collisions', () => {
    it('moves snake in current direction on move request', () => {
      const initialHead = snakeActor.getState().snake[0];
      snakeActor.handleEvent({ type: 'MOVE_REQUESTED' });
      const newHead = snakeActor.getState().snake[0];
      
      expect(newHead).not.toEqual(initialHead);
      expect(newHead.y).toBe(initialHead.y - 1); // Moving up
    });

    it('ignores move requests when game is paused', () => {
      const initialState = snakeActor.getState();
      snakeActor.handleEvent({ type: 'TOGGLE_PAUSE' });
      snakeActor.handleEvent({ type: 'MOVE_REQUESTED' });
      
      expect(snakeActor.getState().snake).toEqual(initialState.snake);
    });

    it('detects wall collision and emits event', () => {
      // Initial position is { x: 10, y: 10 } moving up
      // Move up until y = 0, then one more move to hit wall
      for (let i = 0; i <= 10; i++) {
        const events = snakeActor.handleEvent({ type: 'MOVE_REQUESTED' });
        if (i === 10) { // Last move should cause collision
          expect(events).toContainEqual({ type: 'SNAKE_COLLIDED' });
          expect(snakeActor.getState().gameOver).toBe(true);
        }
      }
    });

    it('detects self collision', () => {
      // Create a longer snake first by feeding it
      for (let i = 0; i < 3; i++) {
        snakeActor.handleEvent({ 
          type: 'FOOD_EATEN', 
          foodItem: { position: { x: 10, y: 9 - i }, type: i }
        });
        snakeActor.handleEvent({ type: 'MOVE_REQUESTED' });
      }

      // Snake should now be 5 segments long, moving up
      // Turn right
      snakeActor.handleEvent({ type: 'DIRECTION_CHANGED', direction: { x: 1, y: 0 } });
      snakeActor.handleEvent({ type: 'MOVE_REQUESTED' });
      
      // Turn down
      snakeActor.handleEvent({ type: 'DIRECTION_CHANGED', direction: { x: 0, y: 1 } });
      snakeActor.handleEvent({ type: 'MOVE_REQUESTED' });
      snakeActor.handleEvent({ type: 'MOVE_REQUESTED' });
      
      // Turn left - this should cause collision with the snake's body
      snakeActor.handleEvent({ type: 'DIRECTION_CHANGED', direction: { x: -1, y: 0 } });
      const events = snakeActor.handleEvent({ type: 'MOVE_REQUESTED' });

      expect(events).toContainEqual({ type: 'SNAKE_COLLIDED' });
      expect(snakeActor.getState().gameOver).toBe(true);
    });
  });

  describe('food interaction and color propagation', () => {
    it('handles food eaten event with color propagation', () => {
      // Feed the snake and move it
      snakeActor.handleEvent({ 
        type: 'FOOD_EATEN', 
        foodItem: { position: { x: 10, y: 9 }, type: 0 }
      });
      snakeActor.handleEvent({ type: 'MOVE_REQUESTED' });

      const state = snakeActor.getState();
      expect(state.snake[0].fruitType).toBe(0); // Head should have the fruit color
      expect(state.snake[1].fruitType).toBeUndefined(); // Second segment should be default
    });

    it('propagates colors through snake segments on movement', () => {
      // Feed snake with two different fruits
      snakeActor.handleEvent({ 
        type: 'FOOD_EATEN', 
        foodItem: { position: { x: 10, y: 9 }, type: 0 }
      });
      snakeActor.handleEvent({ type: 'MOVE_REQUESTED' });
      
      snakeActor.handleEvent({ 
        type: 'FOOD_EATEN', 
        foodItem: { position: { x: 10, y: 8 }, type: 1 }
      });
      snakeActor.handleEvent({ type: 'MOVE_REQUESTED' });

      const state = snakeActor.getState();
      expect(state.snake[0].fruitType).toBe(1); // Head has second fruit color
      expect(state.snake[1].fruitType).toBe(0); // Second segment has first fruit color
      expect(state.snake[2].fruitType).toBeUndefined(); // Third segment is default
    });

    it('generates new food in valid position after eating', () => {
      const initialFoodCount = snakeActor.getState().foods.length;
      const initialFoods = [...snakeActor.getState().foods];
      
      // Move snake to a food position and eat it
      const targetFood = initialFoods[0];
      snakeActor.handleEvent({ 
        type: 'FOOD_EATEN', 
        foodItem: targetFood
      });
      snakeActor.handleEvent({ type: 'MOVE_REQUESTED' });

      const newState = snakeActor.getState();
      expect(newState.foods).toHaveLength(initialFoodCount);
      
      // Check that the exact food item with same position and type is not present
      const hasExactFood = newState.foods.some(food => 
        food.position.x === targetFood.position.x && 
        food.position.y === targetFood.position.y && 
        food.type === targetFood.type
      );
      expect(hasExactFood).toBe(false);
    });
  });

  describe('pause functionality', () => {
    it('toggles pause state', () => {
      expect(snakeActor.getState().isPaused).toBe(false);
      
      snakeActor.handleEvent({ type: 'TOGGLE_PAUSE' });
      expect(snakeActor.getState().isPaused).toBe(true);
      
      snakeActor.handleEvent({ type: 'TOGGLE_PAUSE' });
      expect(snakeActor.getState().isPaused).toBe(false);
    });

    it('cannot toggle pause when game is over', () => {
      // Cause game over by moving into wall
      for (let i = 0; i < 11; i++) {
        snakeActor.handleEvent({ type: 'MOVE_REQUESTED' });
      }
      
      snakeActor.handleEvent({ type: 'TOGGLE_PAUSE' });
      expect(snakeActor.getState().isPaused).toBe(false);
    });
  });

  describe('game reset', () => {
    it('resets game state to initial values', () => {
      // First create some game progress
      snakeActor.handleEvent({ 
        type: 'FOOD_EATEN', 
        foodItem: { position: { x: 10, y: 9 }, type: 0 }
      });
      snakeActor.handleEvent({ type: 'MOVE_REQUESTED' });
      snakeActor.handleEvent({ type: 'TOGGLE_PAUSE' });

      // Then reset
      snakeActor.handleEvent({ type: 'GAME_RESET' });
      
      const state = snakeActor.getState();
      expect(state.snake).toHaveLength(2);
      expect(state.score).toBe(0);
      expect(state.gameOver).toBe(false);
      expect(state.isPaused).toBe(false);
      expect(state.direction).toEqual({ x: 0, y: -1 });
      expect(state.foods).toHaveLength(10);
      expect(state.colorPositions).toHaveLength(0);
    });
  });
}); 