import { Direction, GameState, Position } from './events';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
];
const INITIAL_DIRECTION = { x: 0, y: -1 };

export class SnakeActor {
  private state: GameState;
  private shouldGrow: boolean = false;
  private pendingFruitType: number | undefined = undefined;

  constructor() {
    this.state = {
      snake: INITIAL_SNAKE,
      foods: [],
      direction: INITIAL_DIRECTION,
      gameOver: false,
      score: 0,
      isPaused: false,
      colorPositions: [],
    };
  }

  getState(): GameState {
    return this.state;
  }

  changeDirection(newDirection: Direction): void {
    if (this.state.gameOver || this.state.isPaused) {
      return;
    }

    // Prevent 180° reversal regardless of snake length
    if (newDirection.x === -this.state.direction.x && newDirection.y === -this.state.direction.y) {
      return;
    }

    this.state = {
      ...this.state,
      direction: newDirection,
    };
  }

  moveSnake(): void {
    if (this.state.gameOver || this.state.isPaused) {
      return;
    }

    const head = this.state.snake[0];
    const newHead: Position = {
      x: head.x + this.state.direction.x,
      y: head.y + this.state.direction.y,
      fruitType: this.pendingFruitType || (this.state.snake.length === 2 ? undefined : this.state.snake[0].fruitType)
    };

    // If we have a pending fruit type or shouldGrow is true, grow the snake
    if (this.pendingFruitType !== undefined || this.shouldGrow) {
      this.state = {
        ...this.state,
        snake: [newHead, ...this.state.snake],
      };
      this.pendingFruitType = undefined;
      this.shouldGrow = false;
    } else {
      // Normal move: shift snake and propagate existing head color
      this.state = {
        ...this.state,
        snake: [newHead, ...this.state.snake.slice(0, this.state.snake.length - 1)],
      };
    }
  }

  snakeCollided(): void {
    this.state = { ...this.state, gameOver: true };
  }

  foodEaten(foodType: number): void {
    this.shouldGrow = true;
    this.pendingFruitType = foodType;
  }

  reset(): void {
    this.state = {
      snake: INITIAL_SNAKE.map(pos => ({ ...pos })),
      foods: [],
      direction: INITIAL_DIRECTION,
      gameOver: false,
      score: 0,
      isPaused: false,
      colorPositions: [],
    };
    this.shouldGrow = false;
    this.pendingFruitType = undefined;
  }
}