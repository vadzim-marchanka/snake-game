export type Position = {
  x: number;
  y: number;
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
  | { type: 'GAME_RESET' };

export type GameState = {
  snake: Position[];
  foods: FoodItem[];
  direction: Direction;
  gameOver: boolean;
  score: number;
}; 