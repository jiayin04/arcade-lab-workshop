export type GamePhase = 'intro' | 'room' | 'narrative' | 'game' | 'win';
export type RoomId = 0 | 1 | 2;
export type GameType = 'snake' | 'memory' | 'debug' | 'codedrop';

export interface TerminalDef {
  id: number;
  loc: string;
  lines: string[];
  game: GameType;
  tag: string;
}

export interface NarrChoice {
  label: string;
  action: () => void;
}

export interface RoomHotspot {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  action: () => void;
}

export interface SnakePoint { x: number; y: number; }
export type SnakeDir = 'u' | 'd' | 'l' | 'r';

export interface DebugToken {
  x: number;
  y: number;
  text: string;
  valid: boolean;
  speed: number;
  collected: boolean;
}

export interface CodePiece {
  x: number;
  y: number;
  w: number;
  h: number;
  svc: string;
  fast: boolean;
  settled: boolean;
}

export interface CodeSlot {
  x: number;
  w: number;
  comp: string;
  service: string;
  wired: boolean;
}