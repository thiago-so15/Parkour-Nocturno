import type { LevelScript } from "./types";

/** Nivel 3 — Zona Peligrosa (4.4 vel, 3 obstáculos) */
export const level03: LevelScript = {
  id: 3,
  name: "Zona Peligrosa",
  speed: 4.4,
  obstacles: 3,
  distance: 3600,
  description: "Techos estrechos con obstáculos rojos.",
  segments: [
    "flat",
    "up",
    "flat",
    "gap",
    "flat",
    "cable",
    "flat",
    "down",
    "flat",
    "flat",
    "gap",
    "flat",
    "flat",
    "cable",
    "flat",
  ],
};
