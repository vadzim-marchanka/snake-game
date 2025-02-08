import { SnakeActor } from '../SnakeActor';
import { Direction } from '../events';

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
      expect(state.direction).toEqual({ x: 0, y: -1 });
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

    it('does not allow 180° reversal when snake length > 1', () => {
      const initialDirection = snakeActor.getState().direction; // initial direction is { x: 0, y: -1 }
      snakeActor.handleEvent({ type: 'DIRECTION_CHANGED', direction: { x: 0, y: 1 } });
      expect(snakeActor.getState().direction).toEqual(initialDirection);
    });

    it('does not allow 180° reversal even when snake length is 1', () => {
      // Artificially set snake length to 1 by keeping only the head
      (snakeActor as any).state.snake = [ snakeActor.getState().snake[0] ];
      const initialDirection = snakeActor.getState().direction;
      // Attempt reversal
      snakeActor.handleEvent({ type: 'DIRECTION_CHANGED', direction: { x: -initialDirection.x, y: -initialDirection.y } });
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
      // Initial state: head at (10, 10), tail at (10, 11), moving up
      console.log('Initial state:', snakeActor.getState().snake);

      // Grow the snake by feeding it multiple times to make it long enough
      for (let i = 0; i < 4; i++) {
        snakeActor.handleEvent({ 
          type: 'FOOD_EATEN', 
          position: { x: 15, y: 15 } 
        });
        snakeActor.handleEvent({ type: 'MOVE_REQUESTED' });
      }

      console.log('After growing:', snakeActor.getState().snake);

      // Create self collision via 90° turns:
      // Turn left and move
      snakeActor.handleEvent({ type: 'DIRECTION_CHANGED', direction: { x: -1, y: 0 } });
      snakeActor.handleEvent({ type: 'MOVE_REQUESTED' });

      // Turn down and move
      snakeActor.handleEvent({ type: 'DIRECTION_CHANGED', direction: { x: 0, y: 1 } });
      snakeActor.handleEvent({ type: 'MOVE_REQUESTED' });

      // Turn right and move, which should cause self collision
      snakeActor.handleEvent({ type: 'DIRECTION_CHANGED', direction: { x: 1, y: 0 } });
      const events = snakeActor.handleEvent({ type: 'MOVE_REQUESTED' });
      console.log('After move (self collision attempt):', snakeActor.getState().snake);
      console.log('Events:', events);

      expect(events).toContainEqual({ type: 'SNAKE_COLLIDED' });
      expect(snakeActor.getState().gameOver).toBe(true);
    });
  });

  describe('food interaction', () => {
    it('grows snake and increases score when eating food', () => {
      let state = snakeActor.getState();
      const initialLength = state.snake.length;
      const foodPosition = state.food;

      // Move snake to food
      while (state.snake[0].x !== foodPosition.x || state.snake[0].y !== foodPosition.y) {
        const dx = Math.sign(foodPosition.x - state.snake[0].x);
        const dy = Math.sign(foodPosition.y - state.snake[0].y);
        
        if (dx !== 0) {
          snakeActor.handleEvent({ 
            type: 'DIRECTION_CHANGED', 
            direction: { x: dx, y: 0 } 
          });
        } else if (dy !== 0) {
          snakeActor.handleEvent({ 
            type: 'DIRECTION_CHANGED', 
            direction: { x: 0, y: dy } 
          });
        }
        
        const events = snakeActor.handleEvent({ type: 'MOVE_REQUESTED' });
        state = snakeActor.getState();
        
        if (events.some(e => e.type === 'FOOD_EATEN')) {
          expect(state.snake.length).toBe(initialLength + 1);
          expect(state.score).toBe(1);
          break;
        }
      }
    });

    it('generates new food in valid position after eating', () => {
      let state = snakeActor.getState();
      const initialFood = state.food;

      // Move snake to food
      while (state.snake[0].x !== initialFood.x || state.snake[0].y !== initialFood.y) {
        const dx = Math.sign(initialFood.x - state.snake[0].x);
        const dy = Math.sign(initialFood.y - state.snake[0].y);
        
        if (dx !== 0) {
          snakeActor.handleEvent({ 
            type: 'DIRECTION_CHANGED', 
            direction: { x: dx, y: 0 } 
          });
        } else if (dy !== 0) {
          snakeActor.handleEvent({ 
            type: 'DIRECTION_CHANGED', 
            direction: { x: 0, y: dy } 
          });
        }
        
        snakeActor.handleEvent({ type: 'MOVE_REQUESTED' });
        state = snakeActor.getState();
      }

      expect(state.food).not.toEqual(initialFood);
      expect(state.food.x).toBeGreaterThanOrEqual(0);
      expect(state.food.x).toBeLessThan(20);
      expect(state.food.y).toBeGreaterThanOrEqual(0);
      expect(state.food.y).toBeLessThan(20);
    });

    it('grows snake when receiving food eaten event', () => {
      const initialLength = snakeActor.getState().snake.length;
      
      snakeActor.handleEvent({ 
        type: 'FOOD_EATEN', 
        position: { x: 15, y: 15 } 
      });
      snakeActor.handleEvent({ type: 'MOVE_REQUESTED' });

      const newLength = snakeActor.getState().snake.length;
      expect(newLength).toBe(initialLength + 1);
    });
  });

  describe('game reset', () => {
    it('resets to initial state after game over', () => {
      // First cause game over
      for (let i = 0; i < 11; i++) {
        snakeActor.handleEvent({ type: 'MOVE_REQUESTED' });
      }
      
      expect(snakeActor.getState().gameOver).toBe(true);
      
      // Reset game
      snakeActor.handleEvent({ type: 'GAME_RESET' });
      const newState = snakeActor.getState();
      
      expect(newState.gameOver).toBe(false);
      expect(newState.score).toBe(0);
      expect(newState.snake).toHaveLength(2);
      expect(newState.direction).toEqual({ x: 0, y: -1 });
    });

    it('allows movement after reset', () => {
      // Cause game over and reset
      for (let i = 0; i < 11; i++) {
        snakeActor.handleEvent({ type: 'MOVE_REQUESTED' });
      }
      snakeActor.handleEvent({ type: 'GAME_RESET' });

      // Try moving
      const initialHead = snakeActor.getState().snake[0];
      snakeActor.handleEvent({ type: 'MOVE_REQUESTED' });
      const newHead = snakeActor.getState().snake[0];

      expect(newHead).not.toEqual(initialHead);
    });
  });
}); 