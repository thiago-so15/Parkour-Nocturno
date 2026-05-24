import {
  COLORS,
  GROUND_Y,
  ROOF_HIGH,
  ROOF_LOW,
} from "@/lib/game/constants";
import { maxDoubleReach, maxJumpReach } from "@/lib/game/physics";
import type { Building, Cable, GameWorld, Obstacle } from "@/lib/game/types";
import type { LevelScript, SegmentKind } from "./types";

function clampRoof(y: number): number {
  return Math.max(ROOF_HIGH, Math.min(ROOF_LOW, y));
}

export function createBuilding(x: number, roofY: number, w: number): Building {
  const h = GROUND_Y - roofY;
  const cols = [COLORS.b1, COLORS.b2, COLORS.b3, COLORS.b4];
  const col = cols[Math.floor(Math.random() * cols.length)];
  const neons =
    Math.random() > 0.35
      ? [
          {
            ox: 8 + Math.random() * Math.max(10, w - 30),
            oy: 12 + Math.random() * (h * 0.35),
            color: COLORS.neons[Math.floor(Math.random() * COLORS.neons.length)],
            w: 18 + Math.random() * 22,
            h: 7 + Math.random() * 5,
          },
        ]
      : [];
  const windows: Building["windows"] = [];
  const colsN = Math.max(2, Math.floor(w / 14));
  const rows = Math.max(2, Math.floor(h / 18));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < colsN; c++) {
      windows.push({
        ox: 6 + c * 14,
        oy: 10 + r * 18,
        on: Math.random() > 0.4,
      });
    }
  }
  return { x, y: roofY, w, h, col, neons, windows };
}

function addCableBetween(b1: Building, b2: Building, cables: Cable[]): void {
  cables.push({
    x1: b1.x + b1.w * 0.62,
    y1: b1.y + 4,
    x2: b2.x + b2.w * 0.38,
    y2: b2.y + 4,
    sag: Math.min(32, 14 + (b2.x - b1.x) * 0.07),
  });
}

function expandSegments(script: LevelScript): SegmentKind[] {
  const base = script.segments;
  const out: SegmentKind[] = [];
  const targetLen = Math.max(12, Math.ceil(script.distance / 200));
  let i = 0;
  while (out.length < targetLen) {
    out.push(base[i % base.length]);
    i++;
  }
  return out;
}

/** Construye el mundo completo y pasable para un nivel desde su script */
export function buildLevelFromScript(script: LevelScript): GameWorld {
  const buildings: Building[] = [];
  const cables: Cable[] = [];
  const obstacles: Obstacle[] = [];

  const spd = script.speed;
  const platW = Math.max(150, 130 + spd * 14);
  const safeGap = Math.min(32, maxJumpReach(spd) * 0.22);
  const cableGap = Math.min(50, safeGap + 18);
  const maxUp = 18;
  const maxDown = 22;

  let x = 0;
  let roofY = GROUND_Y - 100;

  const start = createBuilding(0, roofY, script.startWidth ?? 220);
  buildings.push(start);
  x = start.x + start.w;

  const segments = expandSegments(script);

  segments.forEach((kind, i) => {
    const seed = i * 17 + script.id * 29;

    if (kind === "flat") {
      roofY = clampRoof(roofY + ((seed % 5) - 2));
      const b = createBuilding(x, roofY, platW + (seed % 35));
      buildings.push(b);
      x = b.x + b.w;
    } else if (kind === "up") {
      roofY = clampRoof(roofY - (6 + (seed % 10)));
      if (roofY < GROUND_Y - 100 - maxUp) roofY = GROUND_Y - 100 - maxUp;
      const b = createBuilding(x, roofY, platW);
      buildings.push(b);
      x = b.x + b.w;
    } else if (kind === "down") {
      roofY = clampRoof(roofY + (6 + (seed % 10)));
      if (roofY > GROUND_Y - 100 + maxDown) roofY = GROUND_Y - 100 + maxDown;
      const b = createBuilding(x, roofY, platW);
      buildings.push(b);
      x = b.x + b.w;
    } else if (kind === "gap") {
      roofY = clampRoof(roofY + ((seed % 3) - 1) * 5);
      const b = createBuilding(x + safeGap, roofY, platW - 10);
      buildings.push(b);
      x = b.x + b.w;
    } else if (kind === "cable") {
      const b1 = createBuilding(x, roofY, platW * 0.9);
      buildings.push(b1);
      const roof2 = clampRoof(roofY + ((seed % 3) - 1) * 8);
      const b2 = createBuilding(b1.x + b1.w + cableGap, roof2, platW * 0.9);
      buildings.push(b2);
      addCableBetween(b1, b2, cables);
      x = b2.x + b2.w;
      roofY = roof2;
    }
  });

  const finish = createBuilding(x, roofY, 240);
  buildings.push(finish);
  const worldEndX = finish.x + finish.w;
  const flagX = finish.x + finish.w - 45;

  const safePlats = buildings.filter(
    (p, idx) => idx > 0 && idx < buildings.length - 1 && p.w > 110,
  );
  for (let i = 0; i < script.obstacles && safePlats.length; i++) {
    const p = safePlats[i % safePlats.length];
    obstacles.push({
      x: p.x + p.w * 0.58,
      y: p.y - 14,
      w: 14,
      h: 14,
    });
  }

  return {
    buildings,
    cables,
    obstacles,
    particles: [],
    worldEndX,
    flagX,
    levelDist: flagX - 80,
  };
}
