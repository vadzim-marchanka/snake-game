import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SnakeRenderer } from '../SnakeRenderer';
import { GameState } from '../events';

describe('SnakeRenderer', () => {
  const mockOnReset = jest.fn();

  const createGameState = (partial: Partial<GameState>): GameState => ({
    snake: [{ x: 10, y: 10 }, { x: 10, y: 11 }],
    food: { x: 5, y: 5 },
    direction: { x: 0, y: -1 },
    gameOver: false,
    score: 0,
    ...partial
  });

  beforeEach(() => {
    mockOnReset.mockClear();
  });

  describe('game board rendering', () => {
    it('renders initial game state correctly', () => {
      const gameState = createGameState({});
      render(<SnakeRenderer gameState={gameState} onReset={mockOnReset} />);

      expect(screen.getByTestId('game-board')).toBeInTheDocument();
      expect(screen.getAllByTestId('snake-segment')).toHaveLength(2);
      expect(screen.getByTestId('food')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('renders snake segments with correct positions', () => {
      const gameState = createGameState({
        snake: [
          { x: 5, y: 5 },
          { x: 5, y: 6 },
          { x: 5, y: 7 }
        ]
      });

      render(<SnakeRenderer gameState={gameState} onReset={mockOnReset} />);

      const segments = screen.getAllByTestId('snake-segment');
      expect(segments).toHaveLength(3);

      // Check head position (first segment)
      expect(segments[0]).toHaveStyle({
        left: '100px', // 5 * CELL_SIZE
        top: '100px',  // 5 * CELL_SIZE
        borderRadius: '4px'
      });

      // Check body segments
      expect(segments[1]).toHaveStyle({
        left: '100px',
        top: '120px', // 6 * CELL_SIZE
        borderRadius: '0'
      });
    });

    it('renders food at correct position', () => {
      const gameState = createGameState({
        food: { x: 15, y: 15 }
      });

      render(<SnakeRenderer gameState={gameState} onReset={mockOnReset} />);

      const food = screen.getByTestId('food');
      expect(food).toHaveStyle({
        left: '300px', // 15 * CELL_SIZE
        top: '300px'   // 15 * CELL_SIZE
      });
    });
  });

  describe('score display', () => {
    it('displays current score', () => {
      const gameState = createGameState({ score: 42 });
      render(<SnakeRenderer gameState={gameState} onReset={mockOnReset} />);

      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('updates score when it changes', () => {
      const { rerender } = render(
        <SnakeRenderer 
          gameState={createGameState({ score: 0 })} 
          onReset={mockOnReset} 
        />
      );

      expect(screen.getByText('0')).toBeInTheDocument();

      rerender(
        <SnakeRenderer 
          gameState={createGameState({ score: 1 })} 
          onReset={mockOnReset} 
        />
      );

      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  describe('game over state', () => {
    it('shows game over message and reset button when game is over', () => {
      const gameState = createGameState({ gameOver: true });
      render(<SnakeRenderer gameState={gameState} onReset={mockOnReset} />);

      expect(screen.getByText(/game over/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /play again/i })).toBeInTheDocument();
    });

    it('does not show game over message when game is active', () => {
      const gameState = createGameState({ gameOver: false });
      render(<SnakeRenderer gameState={gameState} onReset={mockOnReset} />);

      expect(screen.queryByText(/game over/i)).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /play again/i })).not.toBeInTheDocument();
    });
  });
}); 