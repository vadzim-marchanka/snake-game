import { SnakeActor } from '../snake/SnakeActor';
import { Direction } from '../snake/events';

describe('SnakeActor', () => {
  let snakeActor: SnakeActor;

  beforeEach(() => {
    snakeActor = new SnakeActor();
  });

  describe('initial state', () => {
    it('should initialize with correct default values', () => {
      const state = snakeActor.getState();
      expect(state.snake).toHaveLength(2);
      expect(state.direction).toEqual({ x: 0, y: -1 });
      expect(state.gameOver).toBe(false);
      expect(state.isPaused).toBe(false);
      expect(state.colorPositions).toEqual([]);
    });
  });

  describe('movement', () => {
    it('should move snake in the current direction', () => {
      const initialState = snakeActor.getState();
      const initialHead = initialState.snake[0];

      snakeActor.moveSnake();
      
      const newState = snakeActor.getState();
      const newHead = newState.snake[0];
      
      expect(newHead.x).toBe(initialHead.x);
      expect(newHead.y).toBe(initialHead.y - 1); // Moving up (y: -1)
      expect(newState.snake).toHaveLength(2); // Length should remain same without food
    });

    it('should grow snake when food is eaten', () => {
      const initialLength = snakeActor.getState().snake.length;
      
      snakeActor.foodEaten(1);
      snakeActor.moveSnake();
      
      const newLength = snakeActor.getState().snake.length;
      expect(newLength).toBe(initialLength + 1);
    });
  });

  describe('direction changes', () => {
    it('should change direction when valid', () => {
      const newDirection: Direction = { x: 1, y: 0 }; // RIGHT
      snakeActor.changeDirection(newDirection);
      
      expect(snakeActor.getState().direction).toEqual(newDirection);
    });

    it('should not allow 180-degree turns', () => {
      const initialDirection = snakeActor.getState().direction;
      const oppositeDirection: Direction = { 
        x: -initialDirection.x, 
        y: -initialDirection.y 
      };
      
      snakeActor.changeDirection(oppositeDirection);
      
      expect(snakeActor.getState().direction).toEqual(initialDirection);
    });

    it('should not change direction when game is over', () => {
      snakeActor.snakeCollided();
      const directionBeforeChange = snakeActor.getState().direction;
      
      snakeActor.changeDirection({ x: 1, y: 0 });
      
      expect(snakeActor.getState().direction).toEqual(directionBeforeChange);
    });
  });

  describe('game state changes', () => {
    it('should handle collision correctly', () => {
      snakeActor.snakeCollided();
      expect(snakeActor.getState().gameOver).toBe(true);
    });

    it('should reset to initial state', () => {
      // Change some state first
      snakeActor.foodEaten(1);
      snakeActor.moveSnake();
      snakeActor.snakeCollided();

      snakeActor.reset();
      const state = snakeActor.getState();
      
      expect(state.snake).toHaveLength(2);
      expect(state.direction).toEqual({ x: 0, y: -1 });
      expect(state.gameOver).toBe(false);
      expect(state.isPaused).toBe(false);
      expect(state.colorPositions).toEqual([]);
    });
  });

  describe('fruit handling', () => {
    it('should properly handle fruit types when snake grows', () => {
      const fruitType = 2;
      snakeActor.foodEaten(fruitType);
      snakeActor.moveSnake();
      
      const state = snakeActor.getState();
      expect(state.snake[0].fruitType).toBe(fruitType);
    });
  });
}); 