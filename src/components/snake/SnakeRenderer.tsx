import { Direction, Position } from './events';

const CELL_SIZE = 40;

// Helper function to calculate rotation angle based on direction
const getRotationAngle = (direction: Direction): number => {
  if (direction.x === 1) return 0;
  if (direction.x === -1) return 180;
  if (direction.y === 1) return 90;
  return 270; // direction.y === -1
};

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
  )},

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
  }
};

type SnakeRendererProps = {
  snake: Position[];
  direction: Direction;
};

export const SnakeRenderer = ({ snake, direction }: SnakeRendererProps) => {
  if (!snake || !direction) {
    return null;
  }

  return (
    <>
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
    </>
  );
}; 