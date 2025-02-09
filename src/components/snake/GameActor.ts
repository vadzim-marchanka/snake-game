import { GameEvent, GameState, Position } from './events';
import { SnakeActor } from './SnakeActor';
import { FoodActor } from './FoodActor';
import { CollisionDetectionActor } from './CollisionDetectionActor';

export class GameActor {
  private state: GameState;
  private listeners: ((state: GameState) => void)[] = [];
  private snakeActor: SnakeActor;
  private foodActor: FoodActor;
  private collisionDetector: CollisionDetectionActor;

  constructor() {
    this.snakeActor = new SnakeActor();
    this.foodActor = new FoodActor();
    this.collisionDetector = new CollisionDetectionActor();
    const snakeState = this.snakeActor.getState();
    this.state = {
      snake: snakeState.snake,
      foods: this.foodActor.getFoods(),
      direction: snakeState.direction,
      gameOver: false,
      score: 0,
      isPaused: false,
      colorPositions: [],
    };
  }

  getState(): GameState {
    return this.state;
  }

  subscribe(listener: (state: GameState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  handleEvent(event: GameEvent): GameEvent[] {
    const resultEvents: GameEvent[] = [];

    switch (event.type) {
      case 'MOVE_REQUESTED': {
        if (this.state.gameOver || this.state.isPaused) {
          break;
        }

        const snakeState = this.snakeActor.getState();
        const nextPosition = this.collisionDetector.getNextPosition(snakeState.snake[0], snakeState.direction);

        // Check wall/self collision before updating state
        if (this.collisionDetector.checkCollision(nextPosition, snakeState.snake)) {
          // If collision detected, send collision event
          resultEvents.push({ type: 'SNAKE_COLLIDED' });
          this.snakeActor.snakeCollided();
        } else {
          // Check for food collision
          const eatenFood = this.collisionDetector.checkFoodCollision(nextPosition, this.state.foods);
          
          if (eatenFood) {
            // Food collision: emit event, update food, and move snake
            this.foodActor.replaceFoodAtPosition(eatenFood.position);
            this.state = {
              ...this.state,
              foods: this.foodActor.getFoods(),
              score: this.state.score + 1,
            };
            // Handle food eaten before moving
            this.snakeActor.foodEaten(eatenFood.type);
            resultEvents.push({ type: 'FOOD_EATEN', foodItem: eatenFood });
          }

          // Process the move after handling collisions
          this.snakeActor.moveSnake();
        }
        break;
      }

      case 'DIRECTION_CHANGED': {
        this.snakeActor.changeDirection(event.direction);
        break;
      }

      case 'TOGGLE_PAUSE': {
        if (!this.state.gameOver) {
          this.state = {
            ...this.state,
            isPaused: !this.state.isPaused
          };
        }
        break;
      }

      case 'GAME_RESET': {
        this.foodActor.reset();
        this.snakeActor.reset();
        this.state = {
          ...this.state,
          foods: this.foodActor.getFoods(),
          score: 0,
          isPaused: false,
        };
        break;
      }
    }

    // Update our state with the latest from SnakeActor
    const newSnakeState = this.snakeActor.getState();
    this.state = {
      ...this.state,
      snake: newSnakeState.snake,
      direction: newSnakeState.direction,
      gameOver: newSnakeState.gameOver,
      colorPositions: newSnakeState.colorPositions,
    };
    this.notify();

    return resultEvents;
  }
} 