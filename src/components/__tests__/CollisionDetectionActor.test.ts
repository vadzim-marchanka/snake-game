import { CollisionDetectionActor } from '../snake/CollisionDetectionActor';
import { Position, Direction, FoodItem } from '../snake/events';

describe('CollisionDetectionActor', () => {
  let collisionDetector: CollisionDetectionActor;

  beforeEach(() => {
    collisionDetector = new CollisionDetectionActor();
  });

  describe('getNextPosition', () => {
    it('should calculate correct next position based on direction', () => {
      const currentHead: Position = { x: 10, y: 10 };
      const directions: Direction[] = [
        { x: 0, y: -1 }, // UP
        { x: 0, y: 1 },  // DOWN
        { x: -1, y: 0 }, // LEFT
        { x: 1, y: 0 },  // RIGHT
      ];

      const expectedPositions: Position[] = [
        { x: 10, y: 9 },  // UP
        { x: 10, y: 11 }, // DOWN
        { x: 9, y: 10 },  // LEFT
        { x: 11, y: 10 }, // RIGHT
      ];

      directions.forEach((direction, index) => {
        const nextPosition = collisionDetector.getNextPosition(currentHead, direction);
        expect(nextPosition).toEqual(expectedPositions[index]);
      });
    });
  });

  describe('wall collision detection', () => {
    it('should detect collision with left wall', () => {
      const head: Position = { x: -1, y: 10 };
      const snake: Position[] = [head];
      expect(collisionDetector.checkCollision(head, snake)).toBe(true);
    });

    it('should detect collision with right wall', () => {
      const head: Position = { x: 20, y: 10 };
      const snake: Position[] = [head];
      expect(collisionDetector.checkCollision(head, snake)).toBe(true);
    });

    it('should detect collision with top wall', () => {
      const head: Position = { x: 10, y: -1 };
      const snake: Position[] = [head];
      expect(collisionDetector.checkCollision(head, snake)).toBe(true);
    });

    it('should detect collision with bottom wall', () => {
      const head: Position = { x: 10, y: 20 };
      const snake: Position[] = [head];
      expect(collisionDetector.checkCollision(head, snake)).toBe(true);
    });

    it('should not detect wall collision for valid position', () => {
      const head: Position = { x: 10, y: 10 };
      const snake: Position[] = [head];
      expect(collisionDetector.checkCollision(head, snake)).toBe(false);
    });
  });

  describe('self collision detection', () => {
    it('should detect collision with snake body', () => {
      const head: Position = { x: 5, y: 5 };
      const snake: Position[] = [
        { x: 5, y: 4 },
        { x: 5, y: 5 }, // Collision point
        { x: 5, y: 6 },
      ];
      expect(collisionDetector.checkCollision(head, snake)).toBe(true);
    });

    it('should not detect self collision when snake is straight', () => {
      const head: Position = { x: 5, y: 4 };
      const snake: Position[] = [
        { x: 5, y: 5 },
        { x: 5, y: 6 },
        { x: 5, y: 7 },
      ];
      expect(collisionDetector.checkCollision(head, snake)).toBe(false);
    });
  });

  describe('food collision detection', () => {
    it('should detect collision with food', () => {
      const position: Position = { x: 5, y: 5 };
      const foods: FoodItem[] = [
        { position: { x: 3, y: 3 }, type: 1 },
        { position: { x: 5, y: 5 }, type: 2 },
        { position: { x: 7, y: 7 }, type: 3 },
      ];

      const collidedFood = collisionDetector.checkFoodCollision(position, foods);
      expect(collidedFood).toBeDefined();
      expect(collidedFood?.position).toEqual(position);
      expect(collidedFood?.type).toBe(2);
    });

    it('should return undefined when no food collision', () => {
      const position: Position = { x: 0, y: 0 };
      const foods: FoodItem[] = [
        { position: { x: 3, y: 3 }, type: 1 },
        { position: { x: 5, y: 5 }, type: 2 },
      ];

      const collidedFood = collisionDetector.checkFoodCollision(position, foods);
      expect(collidedFood).toBeUndefined();
    });
  });

  describe('next move collision detection', () => {
    it('should detect collision for next move', () => {
      const currentHead: Position = { x: 0, y: 0 };
      const direction: Direction = { x: -1, y: 0 }; // Moving left into wall
      const snake: Position[] = [currentHead];

      const willCollide = collisionDetector.checkCollisionForNextMove(currentHead, direction, snake);
      expect(willCollide).toBe(true);
    });

    it('should not detect collision for safe next move', () => {
      const currentHead: Position = { x: 5, y: 5 };
      const direction: Direction = { x: 0, y: 1 }; // Moving down safely
      const snake: Position[] = [currentHead];

      const willCollide = collisionDetector.checkCollisionForNextMove(currentHead, direction, snake);
      expect(willCollide).toBe(false);
    });
  });
}); 