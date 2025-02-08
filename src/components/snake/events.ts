export type Position = {
  x: number;
  y: number;
  fruitType?: number;  // Track which fruit was eaten at this position
};

export type ColorPosition = {
  x: number;
  y: number;
  type: number;
};

export type Direction = {
  x: number;
  y: number;
};

export type FoodItem = {
  position: Position;
  type: number;
};

export type GameEvent =
  | { type: 'DIRECTION_CHANGED'; direction: Direction }
  | { type: 'MOVE_REQUESTED' }
  | { type: 'FOOD_EATEN'; foodItem: FoodItem }
  | { type: 'SNAKE_COLLIDED' }
  | { type: 'GAME_RESET' }
  | { type: 'TOGGLE_PAUSE' };

export type GameState = {
  snake: Position[];
  foods: FoodItem[];
  direction: Direction;
  gameOver: boolean;
  score: number;
  isPaused: boolean;
  colorPositions: ColorPosition[];  // Track positions where fruits were eaten
};