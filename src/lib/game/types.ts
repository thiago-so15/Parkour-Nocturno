export type GameMode = "endless" | "levels" | null;
export type GameState = "menu" | "playing" | "levelend" | "dead";
export type SpecialMode = "mirror" | "speed2" | "noslide" | "dark" | null;
export type EndlessVariant = "classic" | "nocturno" | "tormenta" | "extremo";

export interface NeonSign {
  ox: number;
  oy: number;
  color: string;
  w: number;
  h: number;
}

export interface WindowCell {
  ox: number;
  oy: number;
  on: boolean;
}

export interface Building {
  x: number;
  y: number;
  w: number;
  h: number;
  col: string;
  neons: NeonSign[];
  windows: WindowCell[];
}

export interface Cable {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  sag: number;
}

export interface Obstacle {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export interface Player {
  x: number;
  y: number;
  w: number;
  h: number;
  vy: number;
  grounded: boolean;
  onCable: boolean;
  jumpCount: number;
  coyote: number;
  ignoreCable: number;
}

export interface GameWorld {
  buildings: Building[];
  cables: Cable[];
  obstacles: Obstacle[];
  particles: Particle[];
  worldEndX: number;
  flagX: number;
  levelDist: number;
}

export interface GameRuntime {
  mode: GameMode;
  gameState: GameState;
  specialMode: SpecialMode;
  endlessVariant: EndlessVariant;
  frame: number;
  scroll: number;
  score: number;
  curLevel: number;
  speed: number;
  baseSpeed: number;
  player: Player;
  world: GameWorld;
}
