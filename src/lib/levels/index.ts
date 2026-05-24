import { level01 } from "./level-01-callejon";
import { level02 } from "./level-02-barrio-industrial";
import { level03 } from "./level-03-zona-peligrosa";
import { level04 } from "./level-04-techo-alto";
import { level05 } from "./level-05-la-cima";
import { level06 } from "./level-06-torres-gemelas";
import { level07 } from "./level-07-puente-roto";
import { level08 } from "./level-08-distrito-neon";
import { level09 } from "./level-09-azotea-final";
import { level10 } from "./level-10-leyenda-urbana";
import type { LevelScript } from "./types";

export type { LevelScript, SegmentKind } from "./types";
export { buildLevelFromScript } from "./builder";

/** Todos los niveles de campaña — cada uno definido en su propio archivo */
export const CAMPAIGN_LEVELS: LevelScript[] = [
  level01,
  level02,
  level03,
  level04,
  level05,
  level06,
  level07,
  level08,
  level09,
  level10,
];

export function getLevelById(id: number): LevelScript | undefined {
  return CAMPAIGN_LEVELS.find((l) => l.id === id);
}
