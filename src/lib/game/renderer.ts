import {
  COLORS,
  GROUND_Y,
  SKIN_TORSO,
  W,
  H,
} from "./constants";
import type { GameRuntime } from "./types";
import { maxJumpsAllowed } from "./engine";
import { getLevelById } from "@/lib/levels";

export function drawMenuBackground(
  ctx: CanvasRenderingContext2D,
  t: number,
): void {
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#f5e6a8";
  ctx.beginPath();
  ctx.arc(W - 50, 45, 22, 0, Math.PI * 2);
  ctx.fill();
  [[-4, -6], [6, 4], [-2, 8]].forEach(([dx, dy]) => {
    ctx.beginPath();
    ctx.fillStyle = "rgba(200,180,100,.15)";
    ctx.arc(W - 50 + dx, 45 + dy, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  for (let i = 0; i < 55; i++) {
    const a = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * 0.003 + i));
    ctx.fillStyle = `rgba(255,255,255,${a})`;
    ctx.fillRect((i * 47) % W, (i * 13) % (H * 0.65), 1.5, 1.5);
  }

  let bx = 0;
  while (bx < W + 80) {
    const bw = 45 + (bx % 70);
    const bh = 70 + (bx % 90);
    const by = H - 50 - bh;
    ctx.fillStyle = COLORS.b2;
    ctx.fillRect(bx, by, bw, bh);
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 3; c++) {
        if ((r + c + bx) % 3 !== 0) {
          ctx.fillStyle = "#f0c850";
          ctx.fillRect(bx + 6 + c * 12, by + 8 + r * 16, 6, 8);
        }
      }
    }
    bx += bw - 4;
  }

  ctx.strokeStyle = COLORS.cable;
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    const x1 = 80 + i * 200;
    const x2 = x1 + 120;
    const y1 = H - 120 - i * 30;
    const y2 = H - 100 - i * 25;
    const mx = (x1 + x2) / 2;
    const my = Math.max(y1, y2) + 25;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(mx, my, x2, y2);
    ctx.stroke();
  }
}

export function drawGame(
  ctx: CanvasRenderingContext2D,
  rt: GameRuntime,
  skinIndex: number,
): void {
  const { scroll, frame, world: w, player: p, mode, specialMode } = rt;

  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, W, H);

  const t = frame * 0.02;
  for (let i = 0; i < 40; i++) {
    const sx = ((i * 47 + scroll * 0.05) % (W + 20)) - 10;
    const sy = (i * 13) % (H * 0.5);
    const a = 0.3 + 0.5 * Math.sin(t + i);
    ctx.fillStyle = `rgba(255,255,255,${a})`;
    ctx.fillRect(sx, sy, 1.5, 1.5);
  }

  ctx.fillStyle = "#f5e6a8";
  ctx.beginPath();
  ctx.arc(W - 45 - scroll * 0.01, 40, 18, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = COLORS.sky;
  const par = scroll * 0.18;
  for (let i = 0; i < 12; i++) {
    const bx = ((i * 80 - par) % (W + 100)) - 20;
    const bh = 40 + (i % 4) * 15;
    ctx.fillRect(bx, GROUND_Y - bh, 50 + i * 3, bh);
  }

  w.buildings.forEach((b) => {
    const sx = b.x - scroll;
    if (sx > W + 50 || sx + b.w < -50) return;
    ctx.fillStyle = b.col;
    ctx.fillRect(sx, b.y, b.w, GROUND_Y - b.y);
    b.windows.forEach((win) => {
      ctx.fillStyle = win.on ? "#e8b840" : "#0a0c18";
      ctx.fillRect(sx + win.ox, b.y + win.oy, 8, 10);
    });
    b.neons.forEach((n) => {
      ctx.shadowColor = n.color;
      ctx.shadowBlur = 8;
      ctx.fillStyle = n.color;
      ctx.fillRect(sx + n.ox, b.y + n.oy, n.w, n.h);
      ctx.shadowBlur = 0;
    });
  });

  ctx.strokeStyle = COLORS.cable;
  ctx.lineWidth = 2;
  w.cables.forEach((c) => {
    const x1 = c.x1 - scroll;
    const x2 = c.x2 - scroll;
    const mx = (x1 + x2) / 2;
    const my = Math.max(c.y1, c.y2) + c.sag;
    ctx.beginPath();
    ctx.moveTo(x1, c.y1);
    ctx.quadraticCurveTo(mx, my, x2, c.y2);
    ctx.stroke();
    ctx.fillStyle = "#3a3a50";
    ctx.fillRect(x1 - 3, c.y1 - 4, 6, 8);
    ctx.fillRect(x2 - 3, c.y2 - 4, 6, 8);
  });

  w.obstacles.forEach((o) => {
    const sx = o.x - scroll;
    ctx.fillStyle = COLORS.obs;
    ctx.fillRect(sx, o.y, o.w, o.h);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("!", sx + o.w / 2, o.y + 11);
  });

  if (mode === "levels") {
    const fx = w.flagX - scroll;
    if (fx >= -50 && fx <= W + 50) {
      ctx.fillStyle = "#666";
      ctx.fillRect(fx, GROUND_Y - 80, 4, 80);
      ctx.fillStyle = COLORS.gold;
      ctx.beginPath();
      ctx.moveTo(fx + 4, GROUND_Y - 80);
      ctx.lineTo(fx + 34, GROUND_Y - 65);
      ctx.lineTo(fx + 4, GROUND_Y - 50);
      ctx.fill();
      ctx.fillStyle = "#1a1408";
      ctx.font = "bold 9px sans-serif";
      ctx.fillText("META", fx + 18, GROUND_Y - 58);
    }
  }

  w.particles.forEach((part) => {
    ctx.globalAlpha = part.life;
    ctx.fillStyle = part.color;
    ctx.fillRect(part.x - scroll, part.y, 4, 4);
    ctx.globalAlpha = 1;
  });

  ctx.save();
  if (specialMode === "mirror") {
    ctx.translate(W, 0);
    ctx.scale(-1, 1);
  }
  drawPlayer(ctx, rt, skinIndex);
  ctx.restore();

  if (specialMode === "dark") {
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(0, 0, W, H);
  }

  drawHud(ctx, rt);
}

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  rt: GameRuntime,
  skinIndex: number,
): void {
  const { scroll, frame, player: p } = rt;
  const sx = p.x - scroll;
  const sy = p.y;
  const run = p.grounded && !p.onCable;
  const legOff = run ? Math.sin(frame * 0.4) * 5 : 0;
  const armOff = run ? Math.sin(frame * 0.4 + Math.PI) * 4 : -6;
  const jumping = !p.grounded;
  const torso = SKIN_TORSO[skinIndex] ?? SKIN_TORSO[0];

  ctx.fillStyle = "#e8c4a0";
  ctx.beginPath();
  ctx.arc(sx + p.w / 2, sy + 6, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = torso;
  ctx.fillRect(sx + 3, sy + 12, p.w - 6, 12);

  ctx.strokeStyle = "#c93030";
  ctx.lineWidth = 3;
  ctx.beginPath();
  const scarfX = sx - 8;
  ctx.moveTo(sx + 2, sy + 16);
  ctx.quadraticCurveTo(
    scarfX,
    sy + 16 + Math.sin(frame * 0.2) * 4,
    scarfX - 12,
    sy + 24,
  );
  ctx.stroke();

  ctx.fillStyle = "#2a2048";
  ctx.fillRect(sx + 4, sy + 22 + legOff, 4, 8);
  ctx.fillRect(sx + p.w - 8, sy + 22 - legOff, 4, 8);

  ctx.strokeStyle = "#e8c4a0";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(sx + p.w - 2, sy + 14);
  if (jumping) {
    ctx.lineTo(sx + p.w + 6, sy + 6);
    ctx.moveTo(sx + 2, sy + 14);
    ctx.lineTo(sx - 6, sy + 6);
  } else {
    ctx.lineTo(sx + p.w + 4, sy + 18 + armOff);
    ctx.moveTo(sx + 2, sy + 14);
    ctx.lineTo(sx - 4, sy + 18 - armOff);
  }
  ctx.stroke();
}

function drawHud(ctx: CanvasRenderingContext2D, rt: GameRuntime): void {
  const hudH = rt.mode === "levels" ? 64 : 52;
  ctx.fillStyle = "rgba(8,9,15,0.75)";
  ctx.fillRect(8, 8, 175, hudH);
  ctx.strokeStyle = COLORS.gold;
  ctx.strokeRect(8, 8, 175, hudH);

  ctx.fillStyle = COLORS.gold;
  ctx.font = "bold 11px sans-serif";
  ctx.textAlign = "left";

  if (rt.mode === "levels") {
    const lvl = getLevelById(rt.curLevel);
    const prog = Math.min(1, rt.player.x / rt.world.flagX);
    ctx.fillText(
      `NIVEL ${rt.curLevel}: ${lvl?.name ?? ""}`,
      16,
      24,
    );
    ctx.fillStyle = COLORS.cyan;
    ctx.fillText(
      `Meta ${Math.floor(prog * 100)}% · Vel ${rt.speed.toFixed(1)}`,
      16,
      40,
    );
    const left = maxJumpsAllowed(rt.specialMode) - rt.player.jumpCount;
    ctx.fillStyle = left > 0 ? "#9ae6b4" : "#888";
    ctx.font = "10px sans-serif";
    ctx.fillText(
      `Espacio: saltar · Saltos ${left}/${maxJumpsAllowed(rt.specialMode)}`,
      16,
      54,
    );

    const bw = 120;
    const bx = W - bw - 12;
    ctx.fillStyle = "rgba(8,9,15,0.75)";
    ctx.fillRect(bx, 10, bw, 10);
    ctx.fillStyle = COLORS.cyan;
    ctx.fillRect(bx, 10, bw * prog, 10);
    ctx.strokeStyle = COLORS.gold;
    ctx.strokeRect(bx, 10, bw, 10);
  } else {
    ctx.fillText("ENDLESS", 16, 24);
    ctx.fillStyle = COLORS.cyan;
    ctx.fillText(`SCORE: ${Math.floor(rt.score)}`, 16, 40);
    ctx.fillStyle = "#aaa";
    ctx.font = "10px sans-serif";
    ctx.fillText(`Vel: ${rt.speed.toFixed(1)} · Salto x2`, 16, 52);
  }
}
