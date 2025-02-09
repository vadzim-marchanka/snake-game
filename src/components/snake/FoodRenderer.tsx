import { FoodItem } from './events';
import { FruitSvgs } from './FruitSprites';

const CELL_SIZE = 40;

type FoodRendererProps = {
  foods: FoodItem[];
};

export const FoodRenderer = ({ foods }: FoodRendererProps) => {
  if (!foods) {
    return null;
  }

  return (
    <>
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
    </>
  );
}; 