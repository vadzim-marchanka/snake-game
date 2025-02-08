import { GameState, Direction, Position, FoodItem } from './events';
import { useMemo } from 'react';

const CELL_SIZE = 40;
const GRID_SIZE = 20;

// Helper function to calculate rotation angle based on direction
const getRotationAngle = (direction: Direction): number => {
  if (direction.x === 1) return 0;
  if (direction.x === -1) return 180;
  if (direction.y === 1) return 90;
  return 270; // direction.y === -1
};

// Helper function to generate additional food positions
const generateFoodPositions = (mainFood: Position): Position[] => {
  const positions: Position[] = [mainFood];
  const offsets = [
    { x: 2, y: 2 }, { x: -2, y: 2 }, { x: 2, y: -2 }, { x: -2, y: -2 },
    { x: 3, y: 0 }, { x: -3, y: 0 }, { x: 0, y: 3 }, { x: 0, y: -3 },
    { x: 1, y: 3 }, { x: -1, y: -3 }
  ];

  offsets.forEach(offset => {
    const newPos = {
      x: (mainFood.x + offset.x + GRID_SIZE) % GRID_SIZE,
      y: (mainFood.y + offset.y + GRID_SIZE) % GRID_SIZE
    };
    positions.push(newPos);
  });

  return positions;
};

const FruitSvgs = [
  // apple
  <svg key="apple" width="100%" height="100%" viewBox="0 0 30 35" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="15" cy="20" r="15" fill="#FF5252"/>
    <path d="M 15 5 Q 10 0, 12 -5" stroke="#4CAF50" strokeWidth="2"/>
    <path d="M 15 5 L 18 0" stroke="#4CAF50" strokeWidth="2"/>
    <path d="M 7 12 Q 10 8, 13 12" fill="none" stroke="white" strokeWidth="1" opacity="0.5"/>
  </svg>,
  // orange
  <svg key="orange" width="100%" height="100%" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="18" fill="#FF9800"/>
    <path d="M 20 2 Q 15 -3, 20 -5" stroke="#4CAF50" strokeWidth="2"/>
    <path d="M 20 2 L 23 -3" stroke="#4CAF50" strokeWidth="2"/>
    <path d="M 20 5 L 35 20 L 20 35 L 5 20 Z" stroke="#E65100" strokeWidth="1" fill="none"/>
    <path d="M 5 20 L 35 20 M 20 5 L 20 35" stroke="#E65100" strokeWidth="1"/>
  </svg>,
  // lemon
  <svg key="lemon" width="100%" height="100%" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="20" cy="20" rx="15" ry="12" fill="#FFD600" transform="rotate(45 20 20)"/>
    <path d="M 27 13 Q 22 8, 27 5" stroke="#4CAF50" strokeWidth="2"/>
    <path d="M 10 10 L 30 30 M 10 30 L 30 10" stroke="#FBC02D" strokeWidth="1"/>
  </svg>,
  // banana
  <svg key="banana" width="100%" height="100%" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 20 5 Q 35 5, 35 20 Q 35 35, 20 35 Q 10 35, 10 25 L 15 20 Q 15 30, 20 30 Q 30 30, 30 20 Q 30 10, 20 10 Z" 
          fill="#FFE082"/>
    <path d="M 20 5 L 23 2" stroke="#4CAF50" strokeWidth="2"/>
    <path d="M 15 20 L 30 20" stroke="#FDD835" strokeWidth="1"/>
  </svg>,
  // cherries
  <svg key="cherries" width="100%" height="100%" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="15" cy="25" r="10" fill="#D32F2F"/>
    <circle cx="28" cy="28" r="8" fill="#D32F2F"/>
    <path d="M 15 25 Q 20 15, 25 5 L 28 28" stroke="#4CAF50" strokeWidth="2"/>
    <circle cx="13" cy="23" r="3" fill="#ffffff" fillOpacity="0.3"/>
    <circle cx="26" cy="26" r="2" fill="#ffffff" fillOpacity="0.3"/>
  </svg>,
  // strawberry
  <svg key="strawberry" width="100%" height="100%" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 20 5 L 35 15 Q 40 25, 20 35 Q 0 25, 5 15 Z" fill="#E53935"/>
    <path d="M 20 5 Q 15 0, 20 -2" stroke="#4CAF50" strokeWidth="2"/>
    <path d="M 10 15 L 15 20 M 25 15 L 30 20 M 17 20 L 23 25" 
          stroke="#FFF59D" strokeWidth="1"/>
    <circle cx="15" cy="18" r="1" fill="#FFF59D"/>
    <circle cx="25" cy="22" r="1" fill="#FFF59D"/>
    <circle cx="20" cy="28" r="1" fill="#FFF59D"/>
  </svg>,
  // grapes
  <svg key="grapes" width="100%" height="100%" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="15" cy="20" r="6" fill="#7B1FA2"/>
    <circle cx="25" cy="20" r="6" fill="#7B1FA2"/>
    <circle cx="20" cy="28" r="6" fill="#7B1FA2"/>
    <circle cx="20" cy="15" r="6" fill="#7B1FA2"/>
    <path d="M 20 15 Q 15 5, 20 0" stroke="#4CAF50" strokeWidth="2"/>
    <circle cx="13" cy="18" r="2" fill="#ffffff" fillOpacity="0.3"/>
    <circle cx="23" cy="18" r="2" fill="#ffffff" fillOpacity="0.3"/>
    <circle cx="18" cy="26" r="2" fill="#ffffff" fillOpacity="0.3"/>
  </svg>,
  // watermelon
  <svg key="watermelon" width="100%" height="100%" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 5 20 A 15 15 0 0 1 35 20" fill="#4CAF50"/>
    <path d="M 7 20 A 13 13 0 0 1 33 20" fill="#FF5252"/>
    <circle cx="15" cy="15" r="1" fill="#1B5E20"/>
    <circle cx="20" cy="18" r="1" fill="#1B5E20"/>
    <circle cx="25" cy="15" r="1" fill="#1B5E20"/>
  </svg>,
  // pear
  <svg key="pear" width="100%" height="100%" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 20 15 Q 30 15, 30 25 Q 30 35, 20 35 Q 10 35, 10 25 Q 10 15, 20 15" fill="#C0CA33"/>
    <path d="M 20 15 Q 20 5, 20 0" stroke="#4CAF50" strokeWidth="2"/>
    <path d="M 15 20 Q 20 25, 25 20" stroke="#9E9D24" strokeWidth="1"/>
  </svg>,
  // plum
  <svg key="plum" width="100%" height="100%" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="22" r="15" fill="#4A148C"/>
    <path d="M 20 7 Q 15 2, 20 0" stroke="#4CAF50" strokeWidth="2"/>
    <path d="M 15 15 Q 20 20, 25 15" stroke="#7B1FA2" strokeWidth="1"/>
    <ellipse cx="15" cy="18" rx="5" ry="3" fill="#ffffff" fillOpacity="0.2"/>
  </svg>
];

const fruitColors = [
  '#FF5252',  // apple - red
  '#FF9800',  // orange
  '#FFD600',  // lemon - yellow
  '#FFE082',  // banana - light yellow
  '#D32F2F',  // cherries - dark red
  '#E53935',  // strawberry - red
  '#7B1FA2',  // grapes - purple
  '#4CAF50',  // watermelon - green
  '#C0CA33',  // pear - yellow-green
  '#4A148C',  // plum - dark purple
];

const SnakeSvg = {
  defs: (
    <defs>
      <pattern id="scales" width="10" height="10" patternUnits="userSpaceOnUse">
        <path d="M 0 5 Q 5 0, 10 5 Q 5 10, 0 5" 
              fill="none" 
              stroke="currentColor" 
              strokeOpacity="0.3"
              strokeWidth="1"/>
      </pattern>
      <filter id="texture">
        <feTurbulence type="turbulence" baseFrequency="0.7" numOctaves="2" result="noise"/>
        <feComposite in="SourceGraphic" in2="noise" operator="arithmetic" k1="0" k2="0.1" k3="0.1" k4="0"/>
      </filter>
    </defs>
  ),
  body: (segment: Position, index: number) => {
    const defaultColors = ['#66BB6A', '#81C784', '#A5D6A7', '#C8E6C9'];
    let baseColor = segment.fruitType !== undefined ? fruitColors[segment.fruitType] : defaultColors[0];
    
    // Convert hex to RGB for easier manipulation
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };

    // Adjust color based on position in snake
    const rgb = hexToRgb(baseColor);
    if (rgb) {
      // Create more pronounced variations based on segment index
      const variation = Math.sin(index * 0.6) * 60; // Increased amplitude and slower frequency
      const darken = Math.max(0, Math.min(255, variation));
      
      // Add brightness variation
      const brightness = Math.cos(index * 0.3) * 30; // Additional brightness variation
      
      const r = Math.max(0, Math.min(255, rgb.r - darken + brightness));
      const g = Math.max(0, Math.min(255, rgb.g - darken + brightness));
      const b = Math.max(0, Math.min(255, rgb.b - darken + brightness));
      
      baseColor = `rgb(${r}, ${g}, ${b})`;
    }
    
    return (
      <svg width="100%" height="100%" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#texture)">
          <rect width="40" height="40" fill={baseColor}/>
          <rect width="40" height="40" fill="url(#scales)" style={{ color: baseColor }}/>
          <rect width="40" height="40" fill="white" fillOpacity={Math.abs(Math.sin(index * 0.6)) * 0.15}/>
        </g>
      </svg>
    );
  },
  head: (direction: Direction, segment: Position) => {
    const defaultColor = '#4CAF50';
    const color = segment.fruitType !== undefined ? fruitColors[segment.fruitType] : defaultColor;
    
    return (
    <svg width="100%" height="100%" viewBox="0 0 45 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g transform={`rotate(${getRotationAngle(direction)} 22.5 20)`}>
        <g filter="url(#texture)">
          {/* Base head shape */}
          <path d="M 0 0 
                   L 40 0 
                   Q 45 0, 45 5
                   L 45 35
                   Q 45 40, 40 40
                   L 0 40
                   Q -5 40, -5 35
                   L -5 5
                   Q -5 0, 0 0" 
                fill={color}/>
          
          {/* Scales on head */}
          <rect x="0" y="0" width="40" height="40" fill="url(#scales)" style={{ color }}/>
          <rect x="0" y="0" width="40" height="40" fill="white" fillOpacity="0.1"/>
        </g>
        
        {/* Eyes */}
        <ellipse cx="30" cy="12" rx="6" ry="8" fill="white"/>
        <ellipse cx="30" cy="12" rx="4" ry="6" fill="black"/>
        <circle cx="28" cy="10" r="2" fill="white"/>
        
        <ellipse cx="30" cy="28" rx="6" ry="8" fill="white"/>
        <ellipse cx="30" cy="28" rx="4" ry="6" fill="black"/>
        <circle cx="28" cy="26" r="2" fill="white"/>
        
        {/* Nostrils */}
        <circle cx="42" cy="12" r="1.5" fill={color === defaultColor ? '#2E7D32' : color}/>
        <circle cx="42" cy="28" r="1.5" fill={color === defaultColor ? '#2E7D32' : color}/>
        
        {/* Tongue */}
        <path d="M 45 20 
                 L 55 20
                 L 60 15
                 M 55 20
                 L 60 25" 
              stroke="#FF1744" 
              strokeWidth="1.5" 
              fill="none"/>
      </g>
    </svg>
  )}
};

type SnakeRendererProps = {
  gameState: GameState;
  onReset: () => void;
};

export const SnakeRenderer = ({ gameState, onReset }: SnakeRendererProps) => {
  const { snake, foods, gameOver, score, direction, isPaused } = gameState;
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
      {/* Add the pattern definitions to the document */}
      {SnakeSvg.defs}
      
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
        {snake.map((segment, index) => {
          const isHead = index === 0;
          return (
            <div
              key={index}
              data-testid="snake-segment"
              className="absolute"
              style={{
                width: CELL_SIZE - 2,
                height: CELL_SIZE - 2,
                left: segment.x * CELL_SIZE,
                top: segment.y * CELL_SIZE,
              }}
            >
              {isHead ? SnakeSvg.head(direction, segment) : SnakeSvg.body(segment, index)}
            </div>
          );
        })}
        {foods.map((food, index) => (
          <div
            key={`food-${index}`}
            data-testid="food"
            className="absolute"
            style={{
              width: CELL_SIZE - 2,
              height: CELL_SIZE - 2,
              left: food.position.x * CELL_SIZE,
              top: food.position.y * CELL_SIZE,
            }}
          >
            {FruitSvgs[food.type]}
          </div>
        ))}
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