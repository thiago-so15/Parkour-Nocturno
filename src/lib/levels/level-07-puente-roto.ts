import type { LevelScript } from "./types";

export const level07: LevelScript = {
  id: 7,
  name: "Puente Roto",
  speed: 6.6,
  obstacles: 9,
  distance: 5000,
  description: "Cables y huecos sobre el puente derruido.",
  segments: [
    "flat",
    "gap",
    "cable",
    "flat",
    "gap",
    "flat",
    "up",
    "cable",
    "flat",
    "down",
    "gap",
    "flat",
    "cable",
    "flat",
    "flat",
    "gap",
    "flat",
  ],
};
