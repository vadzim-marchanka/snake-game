export type Position = {
  x: number;
  y: number;
};

export type Direction = {
  x: number;
  y: number;
};

export type GameEvent =
  | { type: 'DIRECTION_CHANGED'; direction: Direction }
  | { type: 'MOVE_REQUESTED' }
  | { type: 'FOOD_EATEN'; position: Position }
  | { type: 'SNAKE_COLLIDED' }
  | { type: 'GAME_RESET' };

export type GameState = {
  snake: Position[];
  food: Position;
  direction: Direction;
  gameOver: boolean;
  score: number;
}; 