import { GameState } from './events';
import { SnakeRenderer } from './SnakeRenderer';
import { FoodRenderer } from './FoodRenderer';
import { useEffect } from 'react';

const CELL_SIZE = 40;
const GRID_SIZE = 20;

type GameRendererProps = {
  gameState: GameState;
  onReset: () => void;
};

export const GameRenderer = ({ gameState, onReset }: GameRendererProps) => {
  useEffect(() => {
    console.log('GameRenderer mounted');
    return () => console.log('GameRenderer unmounted');
  }, []);

  console.log('GameRenderer rendering with props:', { gameState, onReset });

  if (!gameState) {
    console.error('GameState is undefined');
    return <div className="text-white">Error: Game state is undefined</div>;
  }

  const { snake, foods, gameOver, score, direction, isPaused } = gameState;

  // Detailed debug logs
  console.log('Destructured GameState:', {
    snake: snake ? `${snake.length} segments` : 'undefined',
    foods: foods ? `${foods.length} foods` : 'undefined',
    direction: direction ? `x:${direction.x}, y:${direction.y}` : 'undefined',
    gameOver,
    score,
    isPaused
  });

  console.log('Snake data:', snake);
  console.log('Food data:', foods);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
      <div className="bg-gray-800 shadow-lg rounded-lg px-8 py-4 mb-8">
        <div className="text-4xl font-bold text-green-400 font-[monospace]">
          Score: <span className="text-green-500">{score}</span>
        </div>
      </div>
      <div
        data-testid="game-board"
        className="relative bg-gray-800 border-4 border-green-600 shadow-lg rounded-lg overflow-hidden"
        style={{
          width: GRID_SIZE * CELL_SIZE,
          height: GRID_SIZE * CELL_SIZE,
        }}
      >
        {snake && direction ? (
          <SnakeRenderer snake={snake} direction={direction} />
        ) : (
          <div className="text-white p-4">No snake data available</div>
        )}
        {foods ? (
          <FoodRenderer foods={foods} />
        ) : (
          <div className="text-white p-4">No food data available</div>
        )}
        {isPaused && !gameOver && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-4xl font-bold text-white font-[monospace]">PAUSED</div>
          </div>
        )}
      </div>
      {gameOver && (
        <div className="mt-8 text-center">
          <div className="text-2xl font-bold text-red-500 mb-4 font-[monospace]">Game Over!</div>
          <button
            className="px-6 py-3 bg-green-500 text-white text-lg rounded-lg shadow-md hover:bg-green-600 transition-colors font-[monospace]"
            onClick={onReset}
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}; 