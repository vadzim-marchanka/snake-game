import { GameActor } from '../snake/GameActor';
import { Direction, GameEvent, GameState } from '../snake/events';

describe('GameActor', () => {
  let gameActor: GameActor;

  beforeEach(() => {
    gameActor = new GameActor();
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
}); 