import type { LevelScript } from "./types";

/** Nivel 5 — La Cima (5.8 vel, 7 obstáculos) */
export const level05: LevelScript = {
  id: 5,
  name: "La Cima",
  speed: 5.8,
  obstacles: 7,
  distance: 4500,
  description: "El ascenso final hacia la cima de la ciudad.",
  segments: [
    "flat",
    "up",
    "up",
    "flat",
    "cable",
    "flat",
    "gap",
    "flat",
    "down",
    "flat",
    "cable",
    "flat",
    "gap",
    "up",
    "flat",
    "flat",
    "cable",
    "flat",
  ],
};
