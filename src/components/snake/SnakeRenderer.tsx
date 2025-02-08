import { GameState } from './events';

const CELL_SIZE = 20;
const GRID_SIZE = 20;

type SnakeRendererProps = {
  gameState: GameState;
  onReset: () => void;
};

export const SnakeRenderer = ({ gameState, onReset }: SnakeRendererProps) => {
  const { snake, food, gameOver, score } = gameState;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg px-8 py-4 mb-8">
        <div className="text-4xl font-bold text-gray-800">
          Score: <span className="text-blue-600">{score}</span>
        </div>
      </div>
      <div
        data-testid="game-board"
        className="relative bg-white border-2 border-gray-300 shadow-lg rounded-lg overflow-hidden"
        style={{
          width: GRID_SIZE * CELL_SIZE,
          height: GRID_SIZE * CELL_SIZE,
        }}
      >
        {snake.map((segment, index) => (
          <div
            key={index}
            data-testid="snake-segment"
            className="absolute bg-green-500"
            style={{
              width: CELL_SIZE - 2,
              height: CELL_SIZE - 2,
              left: segment.x * CELL_SIZE,
              top: segment.y * CELL_SIZE,
              borderRadius: index === 0 ? '4px' : '0',
            }}
          />
        ))}
        <div
          data-testid="food"
          className="absolute bg-red-500 rounded-full"
          style={{
            width: CELL_SIZE - 2,
            height: CELL_SIZE - 2,
            left: food.x * CELL_SIZE,
            top: food.y * CELL_SIZE,
          }}
        />
      </div>
      {gameOver && (
        <div className="mt-8 text-center">
          <div className="text-2xl font-bold text-red-500 mb-4">Game Over!</div>
          <button
            className="px-6 py-3 bg-blue-500 text-white text-lg rounded-lg shadow-md hover:bg-blue-600 transition-colors"
            onClick={onReset}
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}; 