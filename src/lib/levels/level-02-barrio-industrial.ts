import type { LevelScript } from "./types";

/** Nivel 2 — Barrio Industrial (3.8 vel) */
export const level02: LevelScript = {
  id: 2,
  name: "Barrio Industrial",
  speed: 3.8,
  obstacles: 0,
  distance: 3200,
  description: "Fábricas y chimeneas en la zona industrial.",
  segments: [
    "flat",
    "flat",
    "up",
    "flat",
    "cable",
    "flat",
    "down",
    "flat",
    "gap",
    "flat",
    "flat",
    "cable",
    "flat",
  ],
};
