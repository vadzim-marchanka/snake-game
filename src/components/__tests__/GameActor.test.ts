import { GameActor } from '../snake/GameActor';
import { Direction, GameEvent, GameState, FoodItem } from '../snake/events';
import { CollisionDetectionActor } from '../snake/CollisionDetectionActor';
import { FoodActor } from '../snake/FoodActor';

const GRID_SIZE = 20;
const fail = (message: string) => { throw new Error(message); };

describe('GameActor', () => {
  let gameActor: GameActor;
  let mockCollisionDetector: CollisionDetectionActor;
  let mockFoodActor: FoodActor;
  let initialFoods: FoodItem[];

  beforeEach(() => {
    initialFoods = [
      { position: { x: 5, y: 5 }, type: 1 },
      { position: { x: 10, y: 10 }, type: 2 }
    ];
    
    mockCollisionDetector = new CollisionDetectionActor();
    mockFoodActor = new FoodActor();
    
    // Mock food actor methods
    jest.spyOn(mockFoodActor, 'getFoods').mockReturnValue(initialFoods);
    jest.spyOn(mockFoodActor, 'replaceFoodAtPosition').mockImplementation(() => {
      initialFoods[0] = { 
        position: { x: 15, y: 15 }, 
        type: 3 
      };
    });
    
    gameActor = new GameActor(mockCollisionDetector, mockFoodActor);
  });

  describe('initial state', () => {
    it('should initialize with correct default values', () => {
      const state = gameActor.getState();
      expect(state.score).toBe(0);
      expect(state.gameOver).toBe(false);
      expect(state.isPaused).toBe(false);
      expect(state.snake.length).toBeGreaterThan(0);
      expect(state.foods.length).toBeGreaterThan(0);
      expect(state.colorPositions).toEqual([]);
    });
  });

  describe('event handling', () => {
    it('should handle DIRECTION_CHANGED event', () => {
      const initialState = gameActor.getState();
      const event: GameEvent = {
        type: 'DIRECTION_CHANGED',
        direction: { x: 1, y: 0 } // RIGHT direction as an object
      };

      gameActor.handleEvent(event);
      const newState = gameActor.getState();

      expect(newState.direction).toEqual({ x: 1, y: 0 });
    });

    it('should handle TOGGLE_PAUSE event', () => {
      const event: GameEvent = { type: 'TOGGLE_PAUSE' };
      
      gameActor.handleEvent(event);
      expect(gameActor.getState().isPaused).toBe(true);
      
      gameActor.handleEvent(event);
      expect(gameActor.getState().isPaused).toBe(false);
    });

    it('should handle GAME_RESET event', () => {
      // First change some state
      gameActor.handleEvent({ type: 'TOGGLE_PAUSE' });
      const scoreUpdateEvent: GameEvent = {
        type: 'MOVE_REQUESTED'
      };
      gameActor.handleEvent(scoreUpdateEvent);

      // Then reset
      gameActor.handleEvent({ type: 'GAME_RESET' });
      const state = gameActor.getState();

      expect(state.score).toBe(0);
      expect(state.isPaused).toBe(false);
      expect(state.gameOver).toBe(false);
    });

    it('should not move snake when game is paused', () => {
      const initialState = gameActor.getState();
      gameActor.handleEvent({ type: 'TOGGLE_PAUSE' });
      gameActor.handleEvent({ type: 'MOVE_REQUESTED' });
      
      const newState = gameActor.getState();
      expect(newState.snake).toEqual(initialState.snake);
    });
  });

  describe('subscription system', () => {
    it('should notify subscribers when state changes', () => {
      const mockListener = jest.fn();
      const unsubscribe = gameActor.subscribe(mockListener);

      gameActor.handleEvent({ type: 'TOGGLE_PAUSE' });
      expect(mockListener).toHaveBeenCalledTimes(1);

      unsubscribe();
      gameActor.handleEvent({ type: 'TOGGLE_PAUSE' });
      expect(mockListener).toHaveBeenCalledTimes(1);
    });
  });

  describe('food and scoring', () => {
    it('should handle food collision and update score', () => {
      const initialState = gameActor.getState();
      const initialScore = initialState.score;
      const mockFood = initialFoods[0];

      // Mock collision detector to force a food collision
      jest.spyOn(mockCollisionDetector, 'checkCollision').mockReturnValue(false);
      jest.spyOn(mockCollisionDetector, 'checkFoodCollision').mockReturnValue(mockFood);

      // Move snake to trigger food collision
      const events = gameActor.handleEvent({ type: 'MOVE_REQUESTED' });
      
      // Verify that food was eaten and score was updated
      const foodEatenEvent = events.find(e => e.type === 'FOOD_EATEN');
      expect(foodEatenEvent).toBeDefined();
      if (foodEatenEvent && foodEatenEvent.type === 'FOOD_EATEN') {
        expect(foodEatenEvent.foodItem).toEqual(mockFood);
      }

      const newState = gameActor.getState();
      expect(newState.score).toBe(initialScore + 1);
      expect(mockFoodActor.replaceFoodAtPosition).toHaveBeenCalledWith(mockFood.position);
      
      // Verify that the first food item was replaced
      expect(newState.foods[0]).toEqual({ position: { x: 15, y: 15 }, type: 3 });
      // Verify that other food items remain unchanged
      expect(newState.foods[1]).toEqual(initialFoods[1]);
    });

    it('should emit FOOD_EATEN event on collision', () => {
      const initialState = gameActor.getState();
      const foodPosition = initialState.foods[0].position;
      
      // Force a food collision
      const mockEvent: GameEvent = {
        type: 'DIRECTION_CHANGED',
        direction: { 
          x: foodPosition.x - initialState.snake[0].x,
          y: foodPosition.y - initialState.snake[0].y
        }
      };
      
      gameActor.handleEvent(mockEvent);
      const events = gameActor.handleEvent({ type: 'MOVE_REQUESTED' });
      
      const foodEatenEvent = events.find(e => e.type === 'FOOD_EATEN');
      expect(foodEatenEvent).toBeDefined();
      expect(foodEatenEvent?.foodItem).toBeDefined();
    });
  });

  describe('multiple event handling', () => {
    it('should handle multiple events in sequence', () => {
      const events: GameEvent[] = [
        { type: 'DIRECTION_CHANGED', direction: { x: 1, y: 0 } },
        { type: 'MOVE_REQUESTED' },
        { type: 'DIRECTION_CHANGED', direction: { x: 0, y: 1 } },
        { type: 'MOVE_REQUESTED' }
      ];

      const initialPosition = gameActor.getState().snake[0];
      events.forEach(event => gameActor.handleEvent(event));
      const finalPosition = gameActor.getState().snake[0];

      expect(finalPosition.x).toBe(initialPosition.x + 1);
      expect(finalPosition.y).toBe(initialPosition.y + 1);
    });

    it('should maintain state consistency during multiple events', () => {
      const events: GameEvent[] = [
        { type: 'DIRECTION_CHANGED', direction: { x: 1, y: 0 } },
        { type: 'MOVE_REQUESTED' },
        { type: 'TOGGLE_PAUSE' },
        { type: 'MOVE_REQUESTED' }, // Should not move when paused
        { type: 'TOGGLE_PAUSE' },
        { type: 'MOVE_REQUESTED' }
      ];

      const initialState = gameActor.getState();
      let finalState = initialState;

      events.forEach(event => {
        gameActor.handleEvent(event);
        finalState = gameActor.getState();
      });

      // Snake length should remain the same as no food was eaten
      expect(finalState.snake.length).toBe(initialState.snake.length);
      expect(finalState.isPaused).toBe(false);
    });
  });

  describe('state synchronization', () => {
    it('should sync snake state after collision', () => {
      // Force a wall collision
      const initialState = gameActor.getState();
      const snakeHead = initialState.snake[0];
      
      // Move towards nearest wall
      const direction: Direction = snakeHead.x < GRID_SIZE / 2 ? 
        { x: -1, y: 0 } : { x: 1, y: 0 };
      
      gameActor.handleEvent({ type: 'DIRECTION_CHANGED', direction });
      
      // Move until collision
      while (!gameActor.getState().gameOver) {
        gameActor.handleEvent({ type: 'MOVE_REQUESTED' });
      }
      
      const state = gameActor.getState();
      expect(state.gameOver).toBe(true);
      expect(state.snake).toBeDefined();
      expect(state.direction).toBeDefined();
    });

    it('should sync state between all actors after reset', () => {
      // First make some changes
      const events: GameEvent[] = [
        { type: 'DIRECTION_CHANGED', direction: { x: 1, y: 0 } },
        { type: 'MOVE_REQUESTED' },
        { type: 'TOGGLE_PAUSE' }
      ];

      events.forEach(event => gameActor.handleEvent(event));
      gameActor.handleEvent({ type: 'GAME_RESET' });
      
      const state = gameActor.getState();
      expect(state.snake).toBeDefined();
      expect(state.foods.length).toBeGreaterThan(0);
      expect(state.score).toBe(0);
      expect(state.isPaused).toBe(false);
      expect(state.gameOver).toBe(false);
    });
  });
}); 