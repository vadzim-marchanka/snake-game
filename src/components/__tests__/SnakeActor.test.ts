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

  describe('snake growth mechanics', () => {
    it('should maintain fruit type chain when growing', () => {
      const fruitTypes = [1, 2, 3];
      fruitTypes.forEach(type => {
        snakeActor.foodEaten(type);
        snakeActor.moveSnake();
      });

      const state = snakeActor.getState();
      expect(state.snake[0].fruitType).toBe(fruitTypes[fruitTypes.length - 1]);
      expect(state.snake[1].fruitType).toBe(fruitTypes[fruitTypes.length - 2]);
      expect(state.snake[2].fruitType).toBe(fruitTypes[fruitTypes.length - 3]);
    });

    it('should handle multiple fruit types in sequence', () => {
      // First growth
      snakeActor.foodEaten(1);
      snakeActor.moveSnake();
      let state = snakeActor.getState();
      expect(state.snake.length).toBe(3);
      expect(state.snake[0].fruitType).toBe(1);

      // Second growth
      snakeActor.foodEaten(2);
      snakeActor.moveSnake();
      state = snakeActor.getState();
      expect(state.snake.length).toBe(4);
      expect(state.snake[0].fruitType).toBe(2);
      expect(state.snake[1].fruitType).toBe(1);
    });

    it('should maintain fruit types during normal movement', () => {
      // First add some fruit types
      snakeActor.foodEaten(1);
      snakeActor.moveSnake();
      snakeActor.foodEaten(2);
      snakeActor.moveSnake();

      // Then move without eating
      const beforeMove = snakeActor.getState();
      snakeActor.moveSnake();
      const afterMove = snakeActor.getState();

      expect(afterMove.snake.length).toBe(beforeMove.snake.length);
      expect(afterMove.snake[0].fruitType).toBe(beforeMove.snake[0].fruitType);
      expect(afterMove.snake[1].fruitType).toBe(beforeMove.snake[0].fruitType);
    });
  });

  describe('edge cases', () => {
    it('should handle rapid direction changes', () => {
      const directions: Direction[] = [
        { x: 1, y: 0 },  // RIGHT
        { x: 0, y: -1 }, // UP
        { x: 1, y: 0 },  // RIGHT
        { x: 0, y: 1 },  // DOWN
      ];

      directions.forEach(direction => {
        snakeActor.changeDirection(direction);
        snakeActor.moveSnake();
      });

      const state = snakeActor.getState();
      expect(state.snake.length).toBe(2); // Original length
      expect(state.direction).toEqual(directions[directions.length - 1]);
    });

    it('should handle movement after game over', () => {
      snakeActor.snakeCollided();
      const beforeMove = snakeActor.getState();
      snakeActor.moveSnake();
      const afterMove = snakeActor.getState();

      expect(afterMove.snake).toEqual(beforeMove.snake);
      expect(afterMove.gameOver).toBe(true);
    });

    it('should handle direction change after game over', () => {
      snakeActor.snakeCollided();
      const beforeDirection = snakeActor.getState().direction;
      snakeActor.changeDirection({ x: 1, y: 0 });
      const afterDirection = snakeActor.getState().direction;

      expect(afterDirection).toEqual(beforeDirection);
    });
  });

  describe('state management', () => {
    it('should properly reset all internal state', () => {
      // First modify the state
      snakeActor.foodEaten(1);
      snakeActor.moveSnake();
      snakeActor.foodEaten(2);
      snakeActor.moveSnake();
      snakeActor.snakeCollided();

      // Then reset
      snakeActor.reset();
      const state = snakeActor.getState();

      expect(state.snake).toHaveLength(2);
      expect(state.direction).toEqual({ x: 0, y: -1 });
      expect(state.gameOver).toBe(false);
      expect(state.snake[0].fruitType).toBeUndefined();
    });

    it('should maintain state consistency during pause', () => {
      // Set up initial state with some fruit types
      snakeActor.foodEaten(1);
      snakeActor.moveSnake();
      
      const beforePause = snakeActor.getState();
      snakeActor.getState().isPaused = true;
      
      // Try to move and change direction while paused
      snakeActor.moveSnake();
      snakeActor.changeDirection({ x: 1, y: 0 });
      
      const afterPause = snakeActor.getState();
      expect(afterPause.snake).toEqual(beforePause.snake);
      expect(afterPause.direction).toEqual(beforePause.direction);
    });
  });
}); 