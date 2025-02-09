import { Position, Direction, FoodItem } from './events';

const GRID_SIZE = 20;

export class CollisionDetectionActor {
  getNextPosition(currentHead: Position, direction: Direction): Position {
    return {
      x: currentHead.x + direction.x,
      y: currentHead.y + direction.y,
    };
  }

  checkCollisionForNextMove(currentHead: Position, direction: Direction, snake: Position[]): boolean {
    const nextPosition = this.getNextPosition(currentHead, direction);
    return this.checkCollision(nextPosition, snake);
  }

  checkCollision(head: Position, snake: Position[]): boolean {
    return this.checkWallCollision(head) || this.checkSelfCollision(head, snake);
  }

  checkFoodCollision(position: Position, foods: FoodItem[]): FoodItem | undefined {
    return foods.find(food => food.position.x === position.x && food.position.y === position.y);
  }

  private checkWallCollision(head: Position): boolean {
    return (
      head.x < 0 ||
      head.x >= GRID_SIZE ||
      head.y < 0 ||
      head.y >= GRID_SIZE
    );
  }

  private checkSelfCollision(head: Position, snake: Position[]): boolean {
    // Check self collision starting from second segment
    for (let i = 1; i < snake.length; i++) {
      const segment = snake[i];
      if (head.x === segment.x && head.y === segment.y) {
        return true;
      }
    }
    return false;
  }
} 