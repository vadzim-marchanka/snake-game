import { useEffect, useRef, useState } from 'react';
import { SnakeActor } from './SnakeActor';
import { SnakeRenderer } from './SnakeRenderer';
import { Direction, GameState, GameEvent } from './events';

const GAME_SPEED = 150;

export const Game = () => {
  const snakeActorRef = useRef(new SnakeActor());
  const [gameState, setGameState] = useState<GameState>(snakeActorRef.current.getState());
  const [eventHistory, setEventHistory] = useState<GameEvent[]>([]);
  const directionChangedSinceMove = useRef(false);

  const processEvent = (event: GameEvent): GameEvent[] => {
    const resultEvents = snakeActorRef.current.handleEvent(event);
    setEventHistory(prev => [...prev, event, ...resultEvents]);
    return resultEvents;
  };

  useEffect(() => {
    const unsubscribe = snakeActorRef.current.subscribe(setGameState);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === ' ') { // Space key
        processEvent({ type: 'TOGGLE_PAUSE' });
        return;
      }

      let newDirection: Direction | null = null;

      switch (e.key) {
        case 'ArrowUp':
          if (gameState.direction.y !== 1) newDirection = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
          if (gameState.direction.y !== -1) newDirection = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
          if (gameState.direction.x !== 1) newDirection = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
          if (gameState.direction.x !== -1) newDirection = { x: 1, y: 0 };
          break;
      }

      if (newDirection) {
        if (directionChangedSinceMove.current) return;

        processEvent({ type: 'DIRECTION_CHANGED', direction: newDirection });
        directionChangedSinceMove.current = true;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState.direction]);

  useEffect(() => {
    const gameInterval = setInterval(() => {
      processEvent({ type: 'MOVE_REQUESTED' });
      directionChangedSinceMove.current = false;
    }, GAME_SPEED);

    return () => clearInterval(gameInterval);
  }, []);

  const handleReset = () => {
    snakeActorRef.current.handleEvent({ type: 'GAME_RESET' });
  };

  return <SnakeRenderer gameState={gameState} onReset={handleReset} />;
}; 