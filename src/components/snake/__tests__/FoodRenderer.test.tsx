import { render, screen } from '@testing-library/react';
import { FoodRenderer } from '../FoodRenderer';
import { FoodItem } from '../events';

describe('FoodRenderer', () => {
  const createTestFoods = (): FoodItem[] => [
    { position: { x: 5, y: 5 }, type: 0 },
    { position: { x: 15, y: 15 }, type: 1 },
    { position: { x: 10, y: 10 }, type: 2 }
  ];

  it('renders all food items', () => {
    const testFoods = createTestFoods();
    render(<FoodRenderer foods={testFoods} />);
    const foodElements = screen.getAllByTestId('food');
    expect(foodElements).toHaveLength(testFoods.length);
  });

  it('positions food items correctly', () => {
    const testFoods = createTestFoods();
    render(<FoodRenderer foods={testFoods} />);
    const foodElements = screen.getAllByTestId('food');

    testFoods.forEach((food, index) => {
      expect(foodElements[index]).toHaveStyle({
        left: `${food.position.x * 40}px`,
        top: `${food.position.y * 40}px`,
        width: '38px', // CELL_SIZE - 2
        height: '38px'
      });
    });
  });

  it('renders empty when no foods provided', () => {
    render(<FoodRenderer foods={[]} />);
    const foodElements = screen.queryAllByTestId('food');
    expect(foodElements).toHaveLength(0);
  });
}); 