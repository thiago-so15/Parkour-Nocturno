export interface GameSave {
  coins: number;
  best: number;
  bestEndless: number;
  lastScore: number;
  playTime: number;
  gamesPlayed: number;
  totalDist: number;
  totalJumps: number;
  deaths: number;
  survived: number;
  streak: number;
  lastPlayDate: string;
  xp: number;
  level: number;
  levelStars: Record<number, number>;
  levelBest: Record<number, number>;
  owned: string[];
  skin: number;
  badges: number[];
  campaignProgress: number;
  settings: {
    sound: boolean;
    music: boolean;
    vibrate: boolean;
    notify: boolean;
    colorblind: boolean;
  };
  streakDays: boolean[];
}

const KEY = "parkourNocturno";

export function defaultSave(): GameSave {
  const today = new Date().toISOString().slice(0, 10);
  return {
    coins: 150,
    best: 0,
    bestEndless: 0,
    lastScore: 0,
    playTime: 0,
    gamesPlayed: 0,
    totalDist: 0,
    totalJumps: 0,
    deaths: 0,
    survived: 0,
    streak: 1,
    lastPlayDate: today,
    xp: 0,
    level: 1,
    levelStars: {},
    levelBest: {},
    owned: [],
    skin: 0,
    badges: [],
    campaignProgress: 1,
    settings: {
      sound: true,
      music: true,
      vibrate: true,
      notify: true,
      colorblind: false,
    },
    streakDays: [true, false, false, false, false, false, false],
  };
}

export function loadSave(): GameSave {
  if (typeof window === "undefined") return defaultSave();
  try {
    const raw = localStorage.getItem(KEY);
    const merged = { ...defaultSave(), ...(raw ? JSON.parse(raw) : {}) };
    merged.campaignProgress = Math.max(1, merged.campaignProgress || 1);
    return merged;
  } catch {
    return defaultSave();
  }
}

export function persistSave(save: GameSave): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(save));
}
