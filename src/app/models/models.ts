export type Theme = 'retro' | 'modern';

export interface GameApp {
  id: string;
  nameKey: string;     
  descKey: string;
  emoji: string;
  route: string;
  bgRetro: string;
  bgModern: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface MemoryCard {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

export interface SnakePoint {
  x: number;
  y: number;
}

export type SnakeDir = 'u' | 'd' | 'l' | 'r';
