import { Direction, GameEvent, GameState, Position, FoodItem } from './events';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const FOOD_COUNT = 10;

export class SnakeActor {
  private state: GameState;
  private listeners: ((state: GameState) => void)[] = [];
  private shouldGrow: boolean = false;

  constructor() {
    this.state = {
      snake: INITIAL_SNAKE,
      foods: this.generateFoods(),
      direction: INITIAL_DIRECTION,
      gameOver: false,
      score: 0,
    };
  }

  subscribe(listener: (state: GameState) => void) {
    this.listeners.push(listener);
    listener(this.state);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener(this.state));
  }

  private generateFood(): FoodItem {
    return {
      position: {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      },
      type: Math.floor(Math.random() * 10)
    };
  }

  private generateFoods(): FoodItem[] {
    const foods: FoodItem[] = [];
    while (foods.length < FOOD_COUNT) {
      const newFood = this.generateFood();
      // Check if the position is already occupied by snake or other food
      const isOccupied = foods.some(food => 
        food.position.x === newFood.position.x && food.position.y === newFood.position.y
      ) || this.state?.snake.some(segment => 
        segment.x === newFood.position.x && segment.y === newFood.position.y
      );
      
      if (!isOccupied) {
        foods.push(newFood);
      }
    }
    return foods;
  }

  private checkCollision(head: Position): boolean {
    // Check wall collision
    if (
      head.x < 0 ||
      head.x >= GRID_SIZE ||
      head.y < 0 ||
      head.y >= GRID_SIZE
    ) {
      return true;
    }

    // Check self collision
    for (let i = 1; i < this.state.snake.length; i++) {
      const segment = this.state.snake[i];
      if (head.x === segment.x && head.y === segment.y) {
        return true;
      }
    }
    return false;
  }

  handleEvent(event: GameEvent): GameEvent[] {
    const resultEvents: GameEvent[] = [];

    switch (event.type) {
      case 'DIRECTION_CHANGED': {
        if (this.state.gameOver) {
          break;
        }

        // Prevent 180° reversal regardless of snake length
        if (event.direction.x === -this.state.direction.x && event.direction.y === -this.state.direction.y) {
          break;
        }

        this.state = {
          ...this.state,
          direction: event.direction,
        };
        this.notify();
        break;
      }

      case 'MOVE_REQUESTED': {
        if (this.state.gameOver) {
          break;
        }

        const head = this.state.snake[0];
        const newHead = {
          x: head.x + this.state.direction.x,
          y: head.y + this.state.direction.y,
        };

        // Check collision before updating state
        if (this.checkCollision(newHead)) {
          this.state = { ...this.state, gameOver: true };
          resultEvents.push({ type: 'SNAKE_COLLIDED' });
          this.notify();
          break;
        }

        const newSnake = [newHead, ...this.state.snake];

        // Check if snake ate any food
        const eatenFoodIndex = this.state.foods.findIndex(food => 
          food.position.x === newHead.x && food.position.y === newHead.y
        );

        if (eatenFoodIndex !== -1) {
          const eatenFood = this.state.foods[eatenFoodIndex];
          const newFoods = [...this.state.foods];
          newFoods[eatenFoodIndex] = this.generateFood(); // Replace eaten food with new one
          
          this.state = {
            ...this.state,
            snake: newSnake,
            foods: newFoods,
            score: this.state.score + 1,
          };
          resultEvents.push({ type: 'FOOD_EATEN', foodItem: eatenFood });
        } else {
          if (!this.shouldGrow) {
            newSnake.pop();
          }
          this.state = {
            ...this.state,
            snake: newSnake,
          };
          this.shouldGrow = false;
        }
        this.notify();
        break;
      }

      case 'FOOD_EATEN': {
        // Mark that the snake should grow on next move
        this.shouldGrow = true;
        this.notify();
        break;
      }

      case 'GAME_RESET': {
        this.state = {
          snake: INITIAL_SNAKE,
          foods: this.generateFoods(),
          direction: INITIAL_DIRECTION,
          gameOver: false,
          score: 0,
        };
        this.shouldGrow = false;
        this.notify();
        break;
      }
    }

    return resultEvents;
  }

  getState(): GameState {
    return this.state;
  }
}