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
      expect(state.direction).toEqual({ x: 0, y: -1 });
      expect(state.foods).toHaveLength(10);
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
          foodItem: { position: { x: 15, y: 15 }, type: 0 }
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
      const targetFood = state.foods[0];

      // Move snake to food
      while (state.snake[0].x !== targetFood.position.x || state.snake[0].y !== targetFood.position.y) {
        const dx = Math.sign(targetFood.position.x - state.snake[0].x);
        const dy = Math.sign(targetFood.position.y - state.snake[0].y);
        
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

    it('preserves fruit colors based on positions', () => {
      // Initial state: snake at (10,10) moving up
      const state = snakeActor.getState();
      
      // Place a fruit and eat it
      snakeActor.handleEvent({ 
        type: 'FOOD_EATEN', 
        foodItem: { position: { x: 10, y: 9 }, type: 0 }  // Apple at (10,9)
      });
      
      // Move snake up to the fruit position
      snakeActor.handleEvent({ type: 'MOVE_REQUESTED' });
      
      // Head should be yellow at (10,9), second segment at (10,10) should be green
      let currentState = snakeActor.getState();
      expect(currentState.snake[0].fruitType).toBe(0);  // Head is yellow
      expect(currentState.snake[1].fruitType).toBeUndefined();  // Second segment still green
      
      // Move again
      snakeActor.handleEvent({ type: 'MOVE_REQUESTED' });
      
      // Head should be green at (10,8), second segment at (10,9) should be yellow
      currentState = snakeActor.getState();
      expect(currentState.snake[0].fruitType).toBeUndefined();  // Head back to green
      expect(currentState.snake[1].fruitType).toBe(0);  // Second segment now yellow
      
      // Place another fruit and eat it
      snakeActor.handleEvent({ 
        type: 'FOOD_EATEN', 
        foodItem: { position: { x: 10, y: 8 }, type: 1 }  // Orange at current head position
      });
      
      // Move snake
      snakeActor.handleEvent({ type: 'MOVE_REQUESTED' });
      
      // Verify colors
      currentState = snakeActor.getState();
      expect(currentState.snake[0].fruitType).toBe(1);  // Head is orange
      expect(currentState.snake[1].fruitType).toBeUndefined();  // Second segment green
      expect(currentState.snake[2].fruitType).toBe(0);  // Third segment still yellow
    });

    it('generates new food in valid position after eating', () => {
      let state = snakeActor.getState();
      const initialFood = state.foods[0];

      // Move snake to food
      while (state.snake[0].x !== initialFood.position.x || state.snake[0].y !== initialFood.position.y) {
        const dx = Math.sign(initialFood.position.x - state.snake[0].x);
        const dy = Math.sign(initialFood.position.y - state.snake[0].y);
        
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

      const newFood = state.foods[0];
      expect(newFood).not.toEqual(initialFood);
      expect(newFood.position.x).toBeGreaterThanOrEqual(0);
      expect(newFood.position.x).toBeLessThan(20);
      expect(newFood.position.y).toBeGreaterThanOrEqual(0);
      expect(newFood.position.y).toBeLessThan(20);
      expect(newFood.type).toBeGreaterThanOrEqual(0);
      expect(newFood.type).toBeLessThan(10);
    });

    it('grows snake when receiving food eaten event', () => {
      const initialLength = snakeActor.getState().snake.length;
      
      snakeActor.handleEvent({ 
        type: 'FOOD_EATEN', 
        foodItem: { position: { x: 15, y: 15 }, type: 0 }
      });
      snakeActor.handleEvent({ type: 'MOVE_REQUESTED' });

      const newLength = snakeActor.getState().snake.length;
      expect(newLength).toBe(initialLength + 1);
    });

    it('propagates fruit colors through snake segments one at a time', () => {
      // Create a longer snake first
      for (let i = 0; i < 3; i++) {
        snakeActor.handleEvent({ 
          type: 'FOOD_EATEN', 
          foodItem: { position: { x: 15, y: 15 }, type: 0 }
        });
        snakeActor.handleEvent({ type: 'MOVE_REQUESTED' });
      }

      // Now we have a 5-segment snake
      let state = snakeActor.getState();
      expect(state.snake.length).toBe(5);

      // Place a yellow fruit (type 0) at the next position
      const headPos = state.snake[0];
      const fruitPos = { x: headPos.x, y: headPos.y - 1 }; // One position ahead
      snakeActor.handleEvent({ 
        type: 'FOOD_EATEN', 
        foodItem: { position: fruitPos, type: 0 } 
      });
      state = snakeActor.getState();  // Refresh state after FOOD_EATEN event

      // Initial state: [G,G,G,G,G] (all segments should have default undefined color)
      expect(state.snake.map(s => s.fruitType)).toEqual([undefined, undefined, undefined, undefined, undefined]);

      // Move 1: [Y,G,G,G,G]
      snakeActor.handleEvent({ type: 'MOVE_REQUESTED' });
      state = snakeActor.getState();
      expect(state.snake.map(s => s.fruitType))
        .toEqual([0, undefined, undefined, undefined, undefined]);

      // Move 2: [Y,Y,G,G,G]
      snakeActor.handleEvent({ type: 'MOVE_REQUESTED' });
      state = snakeActor.getState();
      expect(state.snake.map(s => s.fruitType))
        .toEqual([0, 0, undefined, undefined, undefined]);

      // Move 3: [Y,Y,Y,G,G]
      snakeActor.handleEvent({ type: 'MOVE_REQUESTED' });
      state = snakeActor.getState();
      expect(state.snake.map(s => s.fruitType))
        .toEqual([0, 0, 0, undefined, undefined]);

      // Move 4: [Y,Y,Y,Y,G]
      snakeActor.handleEvent({ type: 'MOVE_REQUESTED' });
      state = snakeActor.getState();
      expect(state.snake.map(s => s.fruitType))
        .toEqual([0, 0, 0, 0, undefined]);

      // Move 5: [Y,Y,Y,Y,Y]
      snakeActor.handleEvent({ type: 'MOVE_REQUESTED' });
      state = snakeActor.getState();
      expect(state.snake.map(s => s.fruitType))
        .toEqual([0, 0, 0, 0, 0]);
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
      expect(newState.foods).toHaveLength(10);
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

  describe('pause functionality', () => {
    it('starts in unpaused state', () => {
      expect(snakeActor.getState().isPaused).toBe(false);
    });

    it('toggles pause state when TOGGLE_PAUSE event is received', () => {
      snakeActor.handleEvent({ type: 'TOGGLE_PAUSE' });
      expect(snakeActor.getState().isPaused).toBe(true);

      snakeActor.handleEvent({ type: 'TOGGLE_PAUSE' });
      expect(snakeActor.getState().isPaused).toBe(false);
    });

    it('does not move snake when paused', () => {
      const initialHead = snakeActor.getState().snake[0];
      
      snakeActor.handleEvent({ type: 'TOGGLE_PAUSE' });
      snakeActor.handleEvent({ type: 'MOVE_REQUESTED' });
      
      expect(snakeActor.getState().snake[0]).toEqual(initialHead);
    });

    it('does not change direction when paused', () => {
      const initialDirection = snakeActor.getState().direction;
      
      snakeActor.handleEvent({ type: 'TOGGLE_PAUSE' });
      snakeActor.handleEvent({ 
        type: 'DIRECTION_CHANGED', 
        direction: { x: 1, y: 0 } 
      });
      
      expect(snakeActor.getState().direction).toEqual(initialDirection);
    });

    it('cannot toggle pause when game is over', () => {
      // Cause game over by moving into wall
      for (let i = 0; i < 11; i++) {
        snakeActor.handleEvent({ type: 'MOVE_REQUESTED' });
      }
      
      expect(snakeActor.getState().gameOver).toBe(true);
      
      snakeActor.handleEvent({ type: 'TOGGLE_PAUSE' });
      expect(snakeActor.getState().isPaused).toBe(false);
    });

    it('resets pause state when game is reset', () => {
      snakeActor.handleEvent({ type: 'TOGGLE_PAUSE' });
      expect(snakeActor.getState().isPaused).toBe(true);
      
      snakeActor.handleEvent({ type: 'GAME_RESET' });
      expect(snakeActor.getState().isPaused).toBe(false);
    });
  });
}); 