export enum GameState {
  MENU,
  LEVEL_SELECT,
  PLAYING,
  GAME_OVER,
  VICTORY,
  EDITOR // New State
}

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export enum EntityType {
  BLOCK = 'BLOCK',
  SPIKE = 'SPIKE',
  ORB = 'ORB', 
  PAD = 'PAD'
}

export interface LevelObject {
  id: number;
  type: EntityType;
  x: number;
  y: number; // grid y (0 is floor)
  width?: number;
  height?: number;
}

export interface LevelColorTheme {
  background: string;
  floor: string;
  objPrimary: string;
  objSecondary: string;
  spike: string;
}

export interface Level {
  id: number;
  name: string;
  difficulty: string; // "Easy", "Normal", "Hard"
  bpm: number;
  theme: LevelColorTheme;
  data: LevelObject[];
  length: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
  type: 'SQUARE' | 'CIRCLE';
}

export interface Player {
  x: number;
  y: number;
  dy: number;
  angle: number;
  isGrounded: boolean;
  isDead: boolean;
  jumpCount: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name mapping
  condition: (stats: GameStats) => boolean;
}

export interface GameStats {
  totalJumps: number;
  totalAttempts: number;
  totalDeaths: number;
  levelProgress: Record<number, number>; // Map Level ID -> Best Percentage (0-100)
}