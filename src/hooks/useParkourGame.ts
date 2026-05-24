"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  createPlayer,
  placePlayerOnRoof,
  updateGame,
  jump,
} from "@/lib/game/engine";
import { drawGame, drawMenuBackground } from "@/lib/game/renderer";
import type {
  EndlessVariant,
  GameRuntime,
  GameState,
  SpecialMode,
} from "@/lib/game/types";
import { defaultSave, loadSave, persistSave, type GameSave } from "@/lib/game/save";
import { buildLevelFromScript, getLevelById } from "@/lib/levels";
import { initEndlessWorld, createEmptyWorld } from "@/lib/game/world/endless";

export type MenuSection =
  | "inicio"
  | "niveles"
  | "puntajes"
  | "perfil"
  | "tienda";

export type LevelSubTab = "campana" | "endless" | "diario" | "especiales";

function createRuntime(): GameRuntime {
  return {
    mode: null,
    gameState: "menu",
    specialMode: null,
    endlessVariant: "classic",
    frame: 0,
    scroll: 0,
    score: 0,
    curLevel: 1,
    speed: 3.5,
    baseSpeed: 3.5,
    player: createPlayer(),
    world: createEmptyWorld(),
  };
}

export function useParkourGame() {
  const [save, setSave] = useState<GameSave>(defaultClientSave);
  const [menuSection, setMenuSection] = useState<MenuSection>("inicio");
  const [levelSubTab, setLevelSubTab] = useState<LevelSubTab>("campana");
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [gameState, setGameState] = useState<GameState>("menu");

  const rtRef = useRef<GameRuntime>(createRuntime());
  const saveRef = useRef(save);
  const gameCanvasRef = useRef<HTMLCanvasElement>(null);
  const menuCanvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  saveRef.current = save;

  useEffect(() => {
    setSave(loadSave());
  }, []);

  const persist = useCallback((s: GameSave) => {
    setSave(s);
    persistSave(s);
  }, []);

  const startGame = useCallback(
    (
      mode: "levels" | "endless",
      param?: number | EndlessVariant,
      special?: SpecialMode,
    ) => {
      const rt = rtRef.current;
      rt.mode = mode;
      rt.specialMode = special ?? null;
      rt.gameState = "playing";
      rt.frame = 0;
      rt.scroll = 0;
      rt.score = 0;
      rt.player = createPlayer();
      rt.world = createEmptyWorld();

      if (mode === "endless") {
        const variant = (param as EndlessVariant) || "classic";
        rt.endlessVariant = variant;
        rt.curLevel = 0;
        rt.baseSpeed =
          variant === "tormenta" ? 4 : variant === "nocturno" ? 3.8 : 3.5;
        if (special === "speed2") rt.baseSpeed *= 2;
        rt.speed = rt.baseSpeed;
        rt.world = initEndlessWorld(rt.speed);
      } else {
        const id = typeof param === "number" ? param : 1;
        const script = getLevelById(id);
        if (!script) return;
        rt.curLevel = id;
        rt.baseSpeed = script.speed;
        if (special === "speed2") rt.baseSpeed *= 2;
        rt.speed = rt.baseSpeed;
        rt.world = buildLevelFromScript(script);
      }

      placePlayerOnRoof(rt.player, rt.world);

      const s = { ...saveRef.current, gamesPlayed: saveRef.current.gamesPlayed + 1 };
      const today = new Date().toISOString().slice(0, 10);
      if (s.lastPlayDate !== today) {
        const y = new Date();
        y.setDate(y.getDate() - 1);
        s.streak =
          s.lastPlayDate === y.toISOString().slice(0, 10) ? s.streak + 1 : 1;
        s.lastPlayDate = today;
      }
      persist(s);
      setShowLevelModal(false);
      setGameState("playing");
    },
    [persist],
  );

  const returnToMenu = useCallback(() => {
    const rt = rtRef.current;
    rt.gameState = "menu";
    rt.mode = null;
    setGameState("menu");
  }, []);

  const handleGameOver = useCallback(() => {
    const rt = rtRef.current;
    const s = { ...saveRef.current };
    s.deaths++;
    s.lastScore = Math.floor(rt.score);
    if (rt.mode === "endless") {
      if (rt.score > s.bestEndless) s.bestEndless = Math.floor(rt.score);
    } else {
      const best = s.levelBest[rt.curLevel] ?? 0;
      if (rt.score > best) s.levelBest[rt.curLevel] = Math.floor(rt.score);
    }
    if (rt.score > s.best) s.best = Math.floor(rt.score);
    s.totalDist += Math.floor(rt.player.x / 10);
    persist(s);
    rt.gameState = "dead";
    setGameState("dead");
  }, [persist]);

  const handleLevelComplete = useCallback(() => {
    const rt = rtRef.current;
    const s = { ...saveRef.current };
    s.survived++;
    const stars =
      rt.player.x > rt.world.flagX - 100
        ? 3
        : rt.score > rt.world.levelDist * 0.5
          ? 2
          : 1;
    const prev = s.levelStars[rt.curLevel] ?? 0;
    if (stars > prev) s.levelStars[rt.curLevel] = stars;
    if (rt.curLevel >= s.campaignProgress) {
      s.campaignProgress = Math.min(10, rt.curLevel + 1);
    }
    s.coins += 20 + stars * 15;
    s.xp += 50 + stars * 25;
    while (s.xp >= s.level * 200) {
      s.xp -= s.level * 200;
      s.level++;
    }
    persist(s);
    rt.gameState = "levelend";
    setGameState("levelend");
  }, [persist]);

  const buyItem = useCallback(
    (id: string, price: number) => {
      const s = { ...saveRef.current };
      if (s.coins < price || s.owned.includes(id)) return false;
      s.coins -= price;
      s.owned.push(id);
      persist(s);
      return true;
    },
    [persist],
  );

  useEffect(() => {
    const loop = (t: number) => {
      const rt = rtRef.current;
      const gameCanvas = gameCanvasRef.current;
      const menuCanvas = menuCanvasRef.current;

      if (rt.gameState === "playing" && gameCanvas) {
        const ctx = gameCanvas.getContext("2d");
        if (ctx) {
          saveRef.current.playTime += 1 / 60;
          const result = updateGame(rt);
          if (result === "dead") handleGameOver();
          else if (result === "levelend") handleLevelComplete();
          drawGame(ctx, rt, saveRef.current.skin);
        }
      } else if (rt.gameState === "menu" && menuCanvas) {
        const ctx = menuCanvas.getContext("2d");
        if (ctx) drawMenuBackground(ctx, t);
      }

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [handleGameOver, handleLevelComplete]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" && rtRef.current.gameState === "playing") {
        e.preventDefault();
        if (jump(rtRef.current)) {
          const s = {
            ...saveRef.current,
            totalJumps: saveRef.current.totalJumps + 1,
          };
          saveRef.current = s;
          setSave(s);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onGameClick = useCallback(() => {
    if (rtRef.current.gameState === "playing" && jump(rtRef.current)) {
      const s = {
        ...saveRef.current,
        totalJumps: saveRef.current.totalJumps + 1,
      };
      saveRef.current = s;
      setSave(s);
    }
  }, []);

  return {
    save,
    persist,
    menuSection,
    setMenuSection,
    levelSubTab,
    setLevelSubTab,
    selectedLevelId,
    setSelectedLevelId,
    showLevelModal,
    setShowLevelModal,
    rtRef,
    gameCanvasRef,
    menuCanvasRef,
    startGame,
    returnToMenu,
    onGameClick,
    buyItem,
    gameState,
    getRuntime: () => rtRef.current,
  };
}

function defaultClientSave(): GameSave {
  return typeof window === "undefined" ? defaultSave() : loadSave();
}
