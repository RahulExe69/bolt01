export type Difficulty = 'easy' | 'normal' | 'hard';

export interface Pipe {
  x: number;
  topHeight: number;
  bottomHeight: number;
  width: number;
  passed: boolean;
}

export interface Bird {
  y: number;
  velocity: number;
  rotation: number;
}

export interface GameState {
  bird: Bird;
  pipes: Pipe[];
  score: number;
  highScore: number;
  isGameOver: boolean;
  isPaused: boolean;
  difficulty: Difficulty;
  speed: number;
  backgroundX: number;
}

export const INITIAL_SPEED = 3;
export const SPEED_INCREMENT = 0.1;
export const MAX_SPEED = 8;

export const DIFFICULTY_SETTINGS = {
  easy: {
    pipeGap: 180,
    pipesCount: 3,
    spawnInterval: 1800,
  },
  normal: {
    pipeGap: 160,
    pipesCount: 4,
    spawnInterval: 1600,
  },
  hard: {
    pipeGap: 140,
    pipesCount: 5,
    spawnInterval: 1400,
  },
};