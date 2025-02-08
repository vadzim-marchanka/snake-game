import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SnakeRenderer } from '../SnakeRenderer';
import { GameState } from '../events';

// Mock the SVG components to avoid SVG-related warnings
jest.mock('../FoodSprites', () => ({
  FoodSprites: () => <div data-testid="food-sprites" />
}));

describe('SnakeRenderer', () => {
  const mockOnReset = jest.fn();

  const createGameState = (partial: Partial<GameState>): GameState => ({
    snake: [{ x: 10, y: 10 }, { x: 10, y: 11 }],
    foods: [
      { position: { x: 5, y: 5 }, type: 0 },
      { position: { x: 7, y: 7 }, type: 1 },
      { position: { x: 3, y: 3 }, type: 2 },
      { position: { x: 15, y: 15 }, type: 3 },
      { position: { x: 12, y: 12 }, type: 4 },
      { position: { x: 8, y: 8 }, type: 5 },
      { position: { x: 4, y: 4 }, type: 6 },
      { position: { x: 16, y: 16 }, type: 7 },
      { position: { x: 13, y: 13 }, type: 8 },
      { position: { x: 9, y: 9 }, type: 9 }
    ],
    direction: { x: 0, y: -1 },
    gameOver: false,
    score: 0,
    isPaused: false,
    colorPositions: [],
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
      expect(screen.getAllByTestId('food')).toHaveLength(10);
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
        left: '200px', // 5 * CELL_SIZE (40)
        top: '200px',  // 5 * CELL_SIZE (40)
      });

      // Check body segments
      expect(segments[1]).toHaveStyle({
        left: '200px',
        top: '240px', // 6 * CELL_SIZE (40)
      });

      expect(segments[2]).toHaveStyle({
        left: '200px',
        top: '280px', // 7 * CELL_SIZE (40)
      });
    });

    it('renders snake segments with fruit colors', () => {
      const gameState = createGameState({
        snake: [
          { x: 5, y: 5 },  // Head (default color)
          { x: 5, y: 6, fruitType: 0 },  // Apple red
          { x: 5, y: 7, fruitType: 3 },  // Banana yellow
        ]
      });

      render(<SnakeRenderer gameState={gameState} onReset={mockOnReset} />);

      const segments = screen.getAllByTestId('snake-segment');
      expect(segments).toHaveLength(3);

      // Head should have default color class
      expect(segments[0].querySelector('svg path')).toHaveAttribute('fill', '#4CAF50');

      // Second segment should be apple red
      expect(segments[1].querySelector('svg rect')).toHaveAttribute('fill', '#FF5252');

      // Third segment should be banana yellow
      expect(segments[2].querySelector('svg rect')).toHaveAttribute('fill', '#FFEB3B');
    });

    it('renders all food items at correct positions with correct colors', () => {
      const testFoods = [
        { position: { x: 15, y: 15 }, type: 0 }, // Red apple
        { position: { x: 5, y: 5 }, type: 1 }    // Orange
      ];
      
      const gameState = createGameState({
        foods: testFoods
      });

      render(<SnakeRenderer gameState={gameState} onReset={mockOnReset} />);

      const foodElements = screen.getAllByTestId('food');
      expect(foodElements).toHaveLength(2);

      // Check positions
      expect(foodElements[0]).toHaveStyle({
        left: '600px', // 15 * CELL_SIZE (40)
        top: '600px'   // 15 * CELL_SIZE (40)
      });

      expect(foodElements[1]).toHaveStyle({
        left: '200px', // 5 * CELL_SIZE (40)
        top: '200px'   // 5 * CELL_SIZE (40)
      });
    });
  });

  describe('game state display', () => {
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

    it('shows game over message when game is over', () => {
      const gameState = createGameState({ gameOver: true });
      render(<SnakeRenderer gameState={gameState} onReset={mockOnReset} />);

      expect(screen.getByText(/game over/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /play again/i })).toBeInTheDocument();
    });

    it('shows pause message when game is paused', () => {
      const gameState = createGameState({ isPaused: true });
      render(<SnakeRenderer gameState={gameState} onReset={mockOnReset} />);

      expect(screen.getByText(/paused/i)).toBeInTheDocument();
    });

    it('does not show pause message when game is active', () => {
      const gameState = createGameState({ isPaused: false });
      render(<SnakeRenderer gameState={gameState} onReset={mockOnReset} />);

      expect(screen.queryByText(/paused/i)).not.toBeInTheDocument();
    });

    it('does not show pause message when game is over', () => {
      const gameState = createGameState({ 
        isPaused: true,
        gameOver: true 
      });
      render(<SnakeRenderer gameState={gameState} onReset={mockOnReset} />);

      expect(screen.queryByText(/paused/i)).not.toBeInTheDocument();
      expect(screen.getByText(/game over/i)).toBeInTheDocument();
    });
  });

  describe('color positions rendering', () => {
    it('renders color positions on the board', () => {
      const gameState = createGameState({
        colorPositions: [
          { x: 5, y: 5, type: 0 },  // Red position
          { x: 7, y: 7, type: 1 },  // Orange position
        ]
      });

      render(<SnakeRenderer gameState={gameState} onReset={mockOnReset} />);

      const colorPositions = screen.getAllByTestId('trail-position');
      expect(colorPositions).toHaveLength(2);

      // Check positions
      expect(colorPositions[0]).toHaveStyle({
        left: '200px', // 5 * CELL_SIZE (40)
        top: '200px'   // 5 * CELL_SIZE (40)
      });

      expect(colorPositions[1]).toHaveStyle({
        left: '280px', // 7 * CELL_SIZE (40)
        top: '280px'   // 7 * CELL_SIZE (40)
      });
    });
  });
}); 