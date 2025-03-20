export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
export type Difficulty = 'easy' | 'normal' | 'hard';

export interface Point {
  x: number;
  y: number;
}

export interface GameState {
  snake: Point[];
  food: Point;
  foodEmoji: string;
  direction: Direction;
  nextDirection: Direction;
  score: number;
  highScore: number;
  isGameOver: boolean;
  isPaused: boolean;
  difficulty: Difficulty;
  gridSize: number;
}

export const SPEEDS = {
  easy: 150,
  normal: 100,
  hard: 70
};

export const FOOD_EMOJIS = ['🍎', '🍐', '🍊', '🍋', '🍇', '🍓', '🥩', '🍗', '🥕', '🍅'];