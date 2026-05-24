import {
  COLORS,
  DOUBLE_JUMP_V,
  GROUND_Y,
  JUMP_V,
  GRAVITY,
} from "./constants";
import { getCableYWorld } from "./physics";
import type {
  GameRuntime,
  GameWorld,
  Player,
  SpecialMode,
} from "./types";
import {
  cullWorldBehind,
  extendEndlessWorld,
} from "./world/endless";

export function createPlayer(): Player {
  return {
    x: 80,
    y: 200,
    w: 18,
    h: 28,
    vy: 0,
    grounded: false,
    onCable: false,
    jumpCount: 0,
    coyote: 0,
    ignoreCable: 0,
  };
}

export function maxJumpsAllowed(special: SpecialMode): number {
  return special === "noslide" ? 1 : 2;
}

export function placePlayerOnRoof(player: Player, world: GameWorld): void {
  const cx = player.x + player.w / 2;
  for (const b of world.buildings) {
    if (cx >= b.x && cx <= b.x + b.w) {
      player.y = b.y - player.h;
      player.vy = 0;
      player.grounded = true;
      return;
    }
  }
  const first = world.buildings[0];
  if (first) {
    player.x = first.x + 24;
    player.y = first.y - player.h;
    player.grounded = true;
  }
}

export function jump(rt: GameRuntime): boolean {
  const maxJ = maxJumpsAllowed(rt.specialMode);
  const p = rt.player;
  if (p.jumpCount >= maxJ) return false;
  if (p.jumpCount === 0 && p.coyote <= 0) return false;

  p.vy = p.jumpCount === 0 ? -JUMP_V : -DOUBLE_JUMP_V;
  p.grounded = false;
  p.onCable = false;
  if (p.jumpCount === 0) p.coyote = 0;
  p.ignoreCable = 14;
  p.jumpCount++;

  for (let i = 0; i < 5; i++) {
    rt.world.particles.push({
      x: p.x + p.w / 2,
      y: p.y + p.h,
      vx: (Math.random() - 0.5) * 3,
      vy: -2 - Math.random() * 2,
      life: 1,
      color: COLORS.neons[Math.floor(Math.random() * COLORS.neons.length)],
    });
  }
  return true;
}

export function updateGame(rt: GameRuntime): "playing" | "dead" | "levelend" {
  if (rt.gameState !== "playing") return "playing";

  rt.frame++;
  const p = rt.player;
  const w = rt.world;

  if (rt.mode === "endless" && rt.frame % 500 === 0) rt.speed += 0.15;
  if (rt.endlessVariant === "tormenta" && rt.frame % 120 === 0) {
    rt.speed += 0.05;
  }

  p.x += rt.speed;
  rt.scroll = p.x - 100;

  p.onCable = false;
  p.grounded = false;
  let onRoof = false;
  if (p.ignoreCable > 0) p.ignoreCable--;

  p.vy += GRAVITY;
  p.y += p.vy;

  const foot = p.y + p.h;
  const cx = p.x + p.w / 2;

  for (const b of w.buildings) {
    if (p.x + p.w <= b.x + 2 || p.x >= b.x + b.w - 2) continue;
    const onSurface = foot >= b.y - 6 && foot <= b.y + 42;
    const passing = foot > b.y && foot < b.y + 50 && p.vy >= 0;
    if ((onSurface || passing) && p.vy >= -2) {
      p.y = b.y - p.h;
      p.vy = 0;
      p.grounded = true;
      onRoof = true;
      p.jumpCount = 0;
      p.ignoreCable = 0;
      break;
    }
  }

  if (!onRoof && p.ignoreCable <= 0) {
    for (const c of w.cables) {
      const cy = getCableYWorld(c, cx);
      if (cy === null) continue;
      if (foot >= cy - 6 && foot <= cy + 14 && p.vy >= 0) {
        p.y = cy - p.h;
        p.vy = 0;
        p.onCable = true;
        p.grounded = true;
        p.jumpCount = 0;
        break;
      }
    }
  }

  if (p.grounded || p.onCable) p.coyote = 14;
  else if (p.coyote > 0) p.coyote--;

  if (foot > GROUND_Y + 5) return "dead";

  for (const o of w.obstacles) {
    if (
      p.x + p.w > o.x &&
      p.x < o.x + o.w &&
      p.y + p.h > o.y &&
      p.y < o.y + o.h
    ) {
      return "dead";
    }
  }

  if (rt.mode === "levels" && p.x >= w.flagX) return "levelend";

  rt.score = p.x / 10;

  w.particles.forEach((part) => {
    part.x += part.vx;
    part.y += part.vy;
    part.vy += 0.2;
    part.life -= 0.03;
  });
  w.particles = w.particles.filter((part) => part.life > 0);

  if (rt.mode === "endless") {
    extendEndlessWorld(w, rt.speed, p.x);
    cullWorldBehind(w, rt.scroll);
  } else {
    cullWorldBehind(w, rt.scroll);
  }

  return "playing";
}
