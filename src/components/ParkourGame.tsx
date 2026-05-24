"use client";

import { useEffect, useMemo, useState } from "react";
import { CAMPAIGN_LEVELS, getLevelById } from "@/lib/levels";
import type { EndlessVariant, SpecialMode } from "@/lib/game/types";
import { useParkourGame, type MenuSection, type LevelSubTab } from "@/hooks/useParkourGame";
import {
  BADGES,
  BADGE_NAMES,
  FAKE_LEADERBOARD,
  SHOP_ITEMS,
  SKIN_COLORS,
} from "@/data/shop";
import { W, H } from "@/lib/game/constants";

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}m ${s}s`;
}

export default function ParkourGame() {
  const g = useParkourGame();
  const { save, persist, gameState } = g;
  const [dailyLeft, setDailyLeft] = useState("--:--:--");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const end = new Date(now);
      end.setHours(24, 0, 0, 0);
      const diff = end.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setDailyLeft(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`,
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const leaderboard = useMemo(() => {
    const youScore = Math.max(save.best, save.bestEndless);
    return [...FAKE_LEADERBOARD]
      .map((r) => ({ ...r, score: r.isYou ? youScore : r.score }))
      .sort((a, b) => b.score - a.score);
  }, [save.best, save.bestEndless]);

  const rt = g.getRuntime();
  const showMenu = gameState === "menu";

  const openLevel = (id: number) => {
    g.setSelectedLevelId(id);
    g.setShowLevelModal(true);
  };

  const nav: { id: MenuSection; label: string }[] = [
    { id: "inicio", label: "Inicio" },
    { id: "niveles", label: "Niveles" },
    { id: "puntajes", label: "Puntajes" },
    { id: "perfil", label: "Perfil" },
    { id: "tienda", label: "Tienda" },
  ];

  const subs: { id: LevelSubTab; label: string }[] = [
    { id: "campana", label: "Campaña" },
    { id: "endless", label: "Endless" },
    { id: "diario", label: "Desafíos Diarios" },
    { id: "especiales", label: "Especiales" },
  ];

  const titles = [
    "Novato Nocturno",
    "Corredor Urbano",
    "Maestro del Techo",
    "Leyenda Nocturna",
  ];
  const profileTitle = titles[Math.min(3, Math.floor((save.level - 1) / 3))];
  const xpNeed = save.level * 200;
  const xpPct = Math.min(100, ((save.xp % xpNeed) / xpNeed) * 100);
  const surv = save.gamesPlayed
    ? Math.round((save.survived / save.gamesPlayed) * 100)
    : 0;

  return (
    <main className="page">
      <div className="game-box">
        <canvas
          ref={g.gameCanvasRef}
          className="game-canvas"
          width={W}
          height={H}
          style={{
            pointerEvents: showMenu ? "none" : "auto",
            cursor: showMenu ? "default" : "pointer",
          }}
          onClick={g.onGameClick}
        />

        {showMenu && (
          <div className="menu-overlay">
            <div className="menu-bg">
              <canvas ref={g.menuCanvasRef} width={W} height={H} />
            </div>
            <div className="menu-ui">
              <nav className="navbar">
                <div className="nav-tabs">
                  {nav.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className={`nav-tab ${g.menuSection === t.id ? "active" : ""}`}
                      onClick={() => {
                        g.setMenuSection(t.id);
                        if (t.id === "niveles") g.setLevelSubTab("campana");
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                <div className="coins">
                  <span>🪙</span>
                  <span>{save.coins}</span>
                </div>
              </nav>

              <div className="menu-title">
                <h1>PARKOUR NOCTURNO</h1>
              </div>

              <div className="menu-content">
                {g.menuSection === "inicio" && (
                  <section className="section active">
                    <div className="cards-grid">
                      {[
                        {
                          icon: "🗺",
                          label: "Por Niveles",
                          action: () => {
                            g.setMenuSection("niveles");
                            g.setLevelSubTab("campana");
                          },
                        },
                        {
                          icon: "♾",
                          label: "Endless",
                          action: () => {
                            g.setMenuSection("niveles");
                            g.setLevelSubTab("endless");
                          },
                        },
                        {
                          icon: "🏆",
                          label: "Ranking",
                          action: () => g.setMenuSection("puntajes"),
                        },
                        {
                          icon: "👤",
                          label: "Mi Perfil",
                          action: () => g.setMenuSection("perfil"),
                        },
                        {
                          icon: "🛒",
                          label: "Tienda",
                          action: () => g.setMenuSection("tienda"),
                        },
                        {
                          icon: "📅",
                          label: "Desafío Diario",
                          action: () => {
                            g.setMenuSection("niveles");
                            g.setLevelSubTab("diario");
                          },
                        },
                      ].map((c) => (
                        <div
                          key={c.label}
                          className="card"
                          onClick={c.action}
                          onKeyDown={() => {}}
                          role="button"
                          tabIndex={0}
                        >
                          <div className="icon">{c.icon}</div>
                          {c.label}
                        </div>
                      ))}
                    </div>
                    <div className="stats-row">
                      <div className="stat-box">
                        Última partida
                        <b>{save.lastScore}</b>
                      </div>
                      <div className="stat-box">
                        Mejor puntaje
                        <b>{Math.max(save.best, save.bestEndless)}</b>
                      </div>
                      <div className="stat-box">
                        Tiempo jugado
                        <b>{formatTime(save.playTime)}</b>
                      </div>
                      <div className="stat-box">
                        Racha días
                        <b>
                          {save.streak}🔥
                        </b>
                      </div>
                    </div>
                    <div className="daily-timer">
                      ⏱ Desafío diario: <span>{dailyLeft}</span>
                    </div>
                    <div className="news-bar">
                      <span>
                        🌙 Nueva skin nocturna en la tienda · Torneo semanal este
                        fin de semana · Modo Tormenta en Endless
                      </span>
                    </div>
                  </section>
                )}

                {g.menuSection === "niveles" && (
                  <section className="section active">
                    <div className="sub-tabs">
                      {subs.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          className={`sub-tab ${g.levelSubTab === t.id ? "active" : ""}`}
                          onClick={() => g.setLevelSubTab(t.id)}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>

                    {g.levelSubTab === "campana" && (
                      <div>
                        <div className="levels-grid">
                          {CAMPAIGN_LEVELS.map((lvl) => {
                            const unlocked =
                              lvl.id === 1 || lvl.id <= save.campaignProgress;
                            const stars = save.levelStars[lvl.id] ?? 0;
                            return (
                              <button
                                key={lvl.id}
                                type="button"
                                className={`lvl-btn ${unlocked ? "" : "locked"}`}
                                disabled={!unlocked}
                                onClick={() => unlocked && openLevel(lvl.id)}
                                onDoubleClick={() =>
                                  unlocked && g.startGame("levels", lvl.id)
                                }
                              >
                                <span>{lvl.id}</span>
                                <small>{lvl.name.slice(0, 9)}</small>
                                <span className="stars">
                                  {"★".repeat(stars)}
                                  {"☆".repeat(3 - stars)}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {g.levelSubTab === "endless" && (
                      <div className="mode-cards">
                        {(
                          [
                            {
                              id: "classic" as EndlessVariant,
                              name: "Clásico",
                              desc: "Parkour estándar",
                            },
                            {
                              id: "nocturno" as EndlessVariant,
                              name: "Nocturno",
                              desc: "Más oscuro, +monedas",
                            },
                            {
                              id: "tormenta" as EndlessVariant,
                              name: "Tormenta",
                              desc: "Viento y velocidad",
                            },
                            {
                              id: "extremo" as EndlessVariant,
                              name: "Extremo",
                              desc: "Solo veteranos",
                              locked: save.campaignProgress < 5,
                            },
                          ] as const
                        ).map((m) => (
                          <div
                            key={m.id}
                            className={`mode-card ${"locked" in m && m.locked ? "locked" : ""}`}
                            onClick={() =>
                              !("locked" in m && m.locked) &&
                              g.startGame("endless", m.id)
                            }
                            onKeyDown={() => {}}
                            role="button"
                            tabIndex={0}
                          >
                            <b>{m.name}</b>
                            <p>{m.desc}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {g.levelSubTab === "diario" && (
                      <div>
                        <p style={{ fontSize: 12, marginBottom: 8 }}>
                          Hoy: Recorre 1500m sin caer · Recompensa:{" "}
                          {50 + save.streak * 10} monedas + 100 XP
                        </p>
                        <div className="streak-week">
                          {["L", "M", "X", "J", "V", "S", "D"].map((d, i) => (
                            <div
                              key={d}
                              className={`streak-day ${save.streakDays[i] ? "done" : ""}`}
                            >
                              {d}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {g.levelSubTab === "especiales" && (
                      <div className="mode-cards">
                        {(
                          [
                            { id: "mirror", name: "Espejo", desc: "Vista invertida" },
                            { id: "speed2", name: "Velocidad x2", desc: "El doble de rápido" },
                            {
                              id: "noslide",
                              name: "Sin salto doble",
                              desc: "Un solo salto",
                            },
                            { id: "dark", name: "Modo oscuro", desc: "Menos visibilidad" },
                          ] as const
                        ).map((s) => (
                          <div
                            key={s.id}
                            className="mode-card"
                            onClick={() =>
                              g.startGame(
                                "endless",
                                "classic",
                                s.id as SpecialMode,
                              )
                            }
                            onKeyDown={() => {}}
                            role="button"
                            tabIndex={0}
                          >
                            <b>{s.name}</b>
                            <p>{s.desc}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                )}

                {g.menuSection === "puntajes" && (
                  <section className="section active">
                    <table className="leaderboard">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Jugador</th>
                          <th>Puntos</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaderboard.map((r, i) => (
                          <tr
                            key={r.name}
                            className={`${i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : ""} ${r.isYou ? "you" : ""}`}
                          >
                            <td>#{i + 1}</td>
                            <td>{r.isYou ? "Tú" : r.name}</td>
                            <td>{r.score.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="stat-cards">
                      <div className="stat-card">
                        Mejor puntaje
                        <b>{Math.max(save.best, save.bestEndless)}</b>
                      </div>
                      <div className="stat-card">
                        Posición global
                        <b>
                          #
                          {leaderboard.findIndex((r) => r.isYou) + 1 || 6}
                        </b>
                      </div>
                      <div className="stat-card">
                        Partidas
                        <b>{save.gamesPlayed}</b>
                      </div>
                      <div className="stat-card">
                        Distancia total
                        <b>{save.totalDist}m</b>
                      </div>
                      <div className="stat-card">
                        Saltos
                        <b>{save.totalJumps}</b>
                      </div>
                      <div className="stat-card">
                        Supervivencia
                        <b>{surv}%</b>
                      </div>
                    </div>
                  </section>
                )}

                {g.menuSection === "perfil" && (
                  <section className="section active">
                    <div className="profile-header">
                      <div className="avatar">🏃</div>
                      <div>
                        <div style={{ fontWeight: 700, color: "var(--gold)" }}>
                          Corredor
                        </div>
                        <div style={{ fontSize: 11, color: "var(--muted)" }}>
                          {profileTitle}
                        </div>
                        <div style={{ fontSize: 11 }}>Nivel {save.level}</div>
                        <div className="xp-bar">
                          <div
                            className="xp-fill"
                            style={{ width: `${xpPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="badges">
                      {BADGES.map((b, i) => {
                        const unlocked =
                          save.badges.includes(i) ||
                          (i === 0 && save.gamesPlayed > 0) ||
                          (i === 1 && save.streak >= 3);
                        return (
                          <div
                            key={b}
                            className={`badge ${unlocked ? "unlocked" : ""}`}
                            title={BADGE_NAMES[i]}
                          >
                            {b}
                          </div>
                        );
                      })}
                    </div>
                    <p style={{ fontSize: 11, margin: "6px 0" }}>Skins</p>
                    <div className="skins">
                      {SKIN_COLORS.map((c, i) => (
                        <div
                          key={c}
                          className={`skin-opt ${save.skin === i ? "selected" : ""}`}
                          style={{ background: c }}
                          onClick={() => persist({ ...save, skin: i })}
                          onKeyDown={() => {}}
                          role="button"
                          tabIndex={0}
                        />
                      ))}
                    </div>
                    <div className="toggles">
                      {(
                        [
                          ["sound", "Sonido"],
                          ["music", "Música"],
                          ["vibrate", "Vibración"],
                          ["notify", "Notificaciones"],
                          ["colorblind", "Modo daltónico"],
                        ] as const
                      ).map(([k, label]) => (
                        <label key={k}>
                          {label}
                          <input
                            type="checkbox"
                            checked={save.settings[k]}
                            onChange={(e) =>
                              persist({
                                ...save,
                                settings: {
                                  ...save.settings,
                                  [k]: e.target.checked,
                                },
                              })
                            }
                          />
                        </label>
                      ))}
                    </div>
                  </section>
                )}

                {g.menuSection === "tienda" && (
                  <section className="section active">
                    <div className="shop-grid">
                      {SHOP_ITEMS.map((item) => {
                        const owned = save.owned.includes(item.id);
                        return (
                          <div
                            key={item.id}
                            className={`shop-item ${owned ? "owned" : ""}`}
                          >
                            <div style={{ fontSize: 24 }}>{item.icon}</div>
                            <b>{item.name}</b>
                            <p>🪙 {item.price}</p>
                            <button
                              type="button"
                              disabled={owned}
                              onClick={() => {
                                if (
                                  !g.buyItem(item.id, item.price) &&
                                  !owned
                                ) {
                                  alert("Monedas insuficientes");
                                }
                              }}
                            >
                              {owned ? "Equipado" : "Comprar"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}
              </div>
            </div>
          </div>
        )}

        {g.showLevelModal && g.selectedLevelId && (
          <div
            className="level-modal"
            onClick={(e) => {
              if (e.target === e.currentTarget) g.setShowLevelModal(false);
            }}
          >
            <div className="level-modal-box">
              {(() => {
                const lvl = getLevelById(g.selectedLevelId!);
                if (!lvl) return null;
                const best = save.levelBest[lvl.id] ?? 0;
                return (
                  <>
                    <h3>
                      Nivel {lvl.id}: {lvl.name}
                    </h3>
                    <p>
                      Velocidad {lvl.speed} · Obstáculos {lvl.obstacles} ·{" "}
                      {lvl.distance}m
                      <br />
                      Mejor: <b style={{ color: "var(--cyan)" }}>{best}</b>
                      <br />
                      <span style={{ color: "#9ae6b4" }}>
                        Espacio ×2 = doble salto
                      </span>
                    </p>
                    <div className="level-modal-btns">
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => g.setShowLevelModal(false)}
                      >
                        Cerrar
                      </button>
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={() => g.startGame("levels", lvl.id)}
                      >
                        Jugar
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}

        <div className={`overlay-screen ${gameState === "dead" ? "show" : ""}`}>
          <h2>Game Over</h2>
          <p>
            Puntaje: <b>{Math.floor(rt.score)}</b>
          </p>
          <p>
            Récord: <b>{Math.max(save.best, save.bestEndless)}</b>
          </p>
          <div className="overlay-btns">
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                if (rt.mode === "endless") {
                  g.startGame("endless", rt.endlessVariant, rt.specialMode);
                } else {
                  g.startGame("levels", rt.curLevel, rt.specialMode);
                }
              }}
            >
              Reintentar
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={g.returnToMenu}
            >
              Menú
            </button>
          </div>
        </div>

        <div
          className={`overlay-screen ${gameState === "levelend" ? "show" : ""}`}
        >
          <h2>¡Nivel completado!</h2>
          <p>
            {getLevelById(rt.curLevel)?.name} —{" "}
            {save.levelStars[rt.curLevel] ?? 1}★
          </p>
          <div className="overlay-btns">
            {rt.curLevel < 10 && (
              <button
                type="button"
                className="btn-primary"
                onClick={() => g.startGame("levels", rt.curLevel + 1)}
              >
                Siguiente
              </button>
            )}
            <button
              type="button"
              className="btn-secondary"
              onClick={g.returnToMenu}
            >
              Menú
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
