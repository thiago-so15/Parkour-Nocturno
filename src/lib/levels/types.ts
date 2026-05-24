/** Tipos de tramo que cada archivo de nivel puede declarar */
export type SegmentKind = "flat" | "up" | "down" | "gap" | "cable";

export interface LevelConfig {
  id: number;
  name: string;
  speed: number;
  obstacles: number;
  /** Distancia objetivo en unidades de mundo */
  distance: number;
}

/** Script de nivel: config + secuencia de tramos pasables */
export interface LevelScript extends LevelConfig {
  /** Tramos del nivel (se repiten si hace falta hasta cubrir distance) */
  segments: SegmentKind[];
  /** Ancho plataforma inicial */
  startWidth?: number;
  /** Descripción corta para UI */
  description?: string;
}
