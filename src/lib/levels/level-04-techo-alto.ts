import type { LevelScript } from "./types";

/** Nivel 4 — Techo Alto (5.0 vel, 5 obstáculos) */
export const level04: LevelScript = {
  id: 4,
  name: "Techo Alto",
  speed: 5.0,
  obstacles: 5,
  distance: 4000,
  description: "Rascacielos altos y saltos largos.",
  segments: [
    "flat",
    "up",
    "flat",
    "cable",
    "flat",
    "gap",
    "flat",
    "up",
    "flat",
    "down",
    "flat",
    "cable",
    "flat",
    "gap",
    "flat",
    "flat",
  ],
};
