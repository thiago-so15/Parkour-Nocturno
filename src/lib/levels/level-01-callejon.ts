import type { LevelScript } from "./types";

/** Nivel 1 — Callejón (3.2 vel, sin obstáculos) */
export const level01: LevelScript = {
  id: 1,
  name: "Callejón",
  speed: 3.2,
  obstacles: 0,
  distance: 2800,
  startWidth: 240,
  description: "Primer recorrido por los techos bajos del callejón.",
  segments: [
    "flat",
    "flat",
    "flat",
    "flat",
    "cable",
    "flat",
    "flat",
    "gap",
    "flat",
    "flat",
    "flat",
    "flat",
  ],
};
