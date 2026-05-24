import { COLORS, GROUND_Y, ROOF_HIGH, ROOF_LOW } from "../constants";
import { maxDoubleReach } from "../physics";
import type { Building, Cable, GameWorld, Obstacle } from "../types";
import { createBuilding } from "@/lib/levels/builder";

function clampRoof(y: number): number {
  return Math.max(ROOF_HIGH, Math.min(ROOF_LOW, y));
}

function addCable(b1: Building, b2: Building, cables: Cable[]): void {
  cables.push({
    x1: b1.x + b1.w * 0.62,
    y1: b1.y + 4,
    x2: b2.x + b2.w * 0.38,
    y2: b2.y + 4,
    sag: Math.min(32, 14 + (b2.x - b1.x) * 0.07),
  });
}

export function createEmptyWorld(): GameWorld {
  return {
    buildings: [],
    cables: [],
    obstacles: [],
    particles: [],
    worldEndX: 0,
    flagX: Infinity,
    levelDist: 0,
  };
}

export function initEndlessWorld(speed: number): GameWorld {
  const world = createEmptyWorld();
  let x = 0;
  let roofY = GROUND_Y - 100;
  for (let i = 0; i < 10; i++) {
    const w = 120 + speed * 10 + Math.random() * 40;
    const b = createBuilding(i === 0 ? 0 : x, roofY, w);
    world.buildings.push(b);
    x = b.x + b.w;
    roofY = clampRoof(roofY + (Math.random() - 0.5) * 12);
  }
  world.worldEndX = x;
  return world;
}

export function spawnEndlessChunk(
  world: GameWorld,
  speed: number,
  atX: number,
): Building {
  const last = world.buildings[world.buildings.length - 1];
  const gap = Math.random() > 0.55 ? 0 : Math.min(28, 10 + Math.random() * 18);
  const x = atX ?? (last ? last.x + last.w + gap : 0);
  const roofY = last
    ? clampRoof(last.y + (Math.random() - 0.5) * 14)
    : GROUND_Y - 100;
  const w = 100 + speed * 9 + Math.random() * 45;
  const b = createBuilding(x, roofY, w);
  world.buildings.push(b);
  world.worldEndX = Math.max(world.worldEndX, b.x + b.w);

  if (world.buildings.length > 1 && Math.random() > 0.5) {
    const prev = world.buildings[world.buildings.length - 2];
    const dist = b.x - (prev.x + prev.w);
    if (dist > 15 && dist < maxDoubleReach(speed) * 0.45) {
      addCable(prev, b, world.cables);
    }
  }

  if (Math.random() < 0.07 && b.w > 100) {
    world.obstacles.push({
      x: b.x + b.w * 0.55,
      y: b.y - 14,
      w: 14,
      h: 14,
    });
  }
  return b;
}

export function extendEndlessWorld(
  world: GameWorld,
  speed: number,
  playerX: number,
): void {
  while (world.worldEndX < playerX + 680 + 350) {
    spawnEndlessChunk(world, speed, world.worldEndX);
  }
}

export function cullWorldBehind(
  world: GameWorld,
  scroll: number,
): void {
  world.buildings = world.buildings.filter((b) => b.x + b.w > scroll - 220);
  world.cables = world.cables.filter((c) => c.x2 > scroll - 220);
  world.obstacles = world.obstacles.filter((o) => o.x + o.w > scroll - 80);
}
