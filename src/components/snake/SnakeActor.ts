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
  private pendingFruitType: number | undefined = undefined;
  private pendingFoodPosition: { x: number; y: number } | undefined = undefined;

  constructor() {
    this.state = {
      snake: INITIAL_SNAKE,
      foods: this.generateFoods(),
      direction: INITIAL_DIRECTION,
      gameOver: false,
      score: 0,
      isPaused: false,
      colorPositions: [],
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
        if (this.state.gameOver || this.state.isPaused) {
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
        if (this.state.gameOver || this.state.isPaused) {
          break;
        }

        const head = this.state.snake[0];
        const newHead: Position = {
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

        // Determine movement behavior
        const eatenFoodIndex = this.state.foods.findIndex(food => 
          food.position.x === newHead.x && food.position.y === newHead.y
        );

        let newSnake: Position[];

        if (eatenFoodIndex !== -1) {
          // Natural food collision: grow snake and assign food color immediately
          const eatenFood = this.state.foods[eatenFoodIndex];
          const newFoods = [...this.state.foods];
          newFoods[eatenFoodIndex] = this.generateFood();

          newHead.fruitType = eatenFood.type;
          newSnake = [ newHead, ...this.state.snake ];

          this.state = {
            ...this.state,
            snake: newSnake,
            foods: newFoods,
            score: this.state.score + 1,
          };
          resultEvents.push({ type: 'FOOD_EATEN', foodItem: eatenFood });
        } else if (this.pendingFoodPosition && newHead.x === this.pendingFoodPosition.x && newHead.y === this.pendingFoodPosition.y) {
          // Propagation move: snake goes through the food cell so propagate the color without growing
          newHead.fruitType = this.pendingFruitType;
          newSnake = [ newHead, ...this.state.snake.slice(0, this.state.snake.length - 1) ];
          this.state = { ...this.state, snake: newSnake };
          // Clear pending so subsequent moves propagate the color naturally
          this.pendingFruitType = undefined;
          this.pendingFoodPosition = undefined;
        } else if (this.pendingFruitType !== undefined) {
          // Growth move: apply pending food color to new head and grow snake
          newHead.fruitType = this.pendingFruitType;
          newSnake = [ newHead, ...this.state.snake ];
          this.state = { ...this.state, snake: newSnake };
          this.pendingFruitType = undefined;
          this.pendingFoodPosition = undefined;
        } else {
          // Normal move: shift snake and propagate existing head color
          newHead.fruitType = this.state.snake.length === 2 ? undefined : this.state.snake[0].fruitType;
          newSnake = [ newHead, ...this.state.snake.slice(0, this.state.snake.length - 1) ];
          this.state = { ...this.state, snake: newSnake };
        }

        this.notify();
        break;
      }

      case 'FOOD_EATEN': {
        // Instead of immediate growth, store pending food data for color propagation
        this.pendingFruitType = event.foodItem.type;
        this.pendingFoodPosition = event.foodItem.position;
        this.notify();
        break;
      }

      case 'TOGGLE_PAUSE': {
        if (!this.state.gameOver) {
          this.state = {
            ...this.state,
            isPaused: !this.state.isPaused
          };
          this.notify();
        }
        break;
      }

      case 'GAME_RESET': {
        this.state = {
          snake: INITIAL_SNAKE.map(pos => ({ ...pos })),
          foods: this.generateFoods(),
          direction: INITIAL_DIRECTION,
          gameOver: false,
          score: 0,
          isPaused: false,
          colorPositions: [],
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