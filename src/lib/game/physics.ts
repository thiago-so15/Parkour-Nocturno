import { DOUBLE_JUMP_V, GRAVITY, JUMP_V } from "./constants";
import type { Cable } from "./types";

export function jumpAirFrames(v: number): number {
  return (2 * v) / GRAVITY;
}

export function maxJumpReach(speed: number): number {
  return speed * jumpAirFrames(JUMP_V) * 0.68;
}

export function maxDoubleReach(speed: number): number {
  return (
    speed *
    (jumpAirFrames(JUMP_V) + jumpAirFrames(DOUBLE_JUMP_V) * 0.55) *
    0.65
  );
}

export function getCableYWorld(cable: Cable, worldX: number): number | null {
  if (worldX < cable.x1 || worldX > cable.x2) return null;
  const t = (worldX - cable.x1) / (cable.x2 - cable.x1);
  const my = Math.max(cable.y1, cable.y2) + cable.sag;
  const omt = 1 - t;
  return omt * omt * cable.y1 + 2 * omt * t * my + t * t * cable.y2;
}
