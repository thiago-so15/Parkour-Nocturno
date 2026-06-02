# Parkour Nocturno

Juego 2D de parkour urbano nocturno: un personaje corre solo por los techos de una ciudad, salta entre edificios y se desliza por cables eléctricos. Desarrollado con **Next.js 15**, **React 19**, **TypeScript** y **Canvas API** (sin motor de juego externo).

![Node](https://img.shields.io/badge/node-%3E%3D18-339933) ![Next.js](https://img.shields.io/badge/Next.js-15-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6)

## Requisitos

- Node.js 18 o superior
- npm

## Instalación y ejecución

```bash
# Clonar o entrar al proyecto
cd Parkour-Nocturno

# Instalar dependencias
npm install

# Modo desarrollo (http://localhost:3000)
npm run dev

# Compilar para producción
npm run build
npm start
```

## Controles

| Acción | Tecla / mouse |
|--------|----------------|
| Saltar | **Espacio** o **clic** en el canvas |
| Doble salto | Segundo **Espacio** / clic en el aire (excepto modo «Sin salto doble») |

El personaje corre automáticamente hacia la derecha. Debes saltar en el momento correcto para no caer al vacío ni chocar con obstáculos rojos (`!`).

## Modos de juego

### Campaña (10 niveles)

Niveles progresivos con meta fija (bandera **META**). Cada nivel está definido en un archivo propio bajo `src/lib/levels/`.

| # | Nombre | Velocidad | Obstáculos |
|---|--------|-----------|------------|
| 1 | Callejón | 3.2 | 0 |
| 2 | Barrio Industrial | 3.8 | 0 |
| 3 | Zona Peligrosa | 4.4 | 3 |
| 4 | Techo Alto | 5.0 | 5 |
| 5 | La Cima | 5.8 | 7 |
| 6–10 | Torres Gemelas … Leyenda Urbana | 6.2–8.0 | 8–12 |

Los niveles se desbloquean en orden. Al completar uno ganas estrellas (1–3), monedas y XP.

### Endless

- **Clásico**, **Nocturno**, **Tormenta** — mundo procedural infinito
- **Extremo** — desbloqueable al completar el nivel 5 de campaña
- La velocidad sube cada 500 frames; el puntaje depende de la distancia

### Modos especiales (Endless)

Espejo, velocidad ×2, sin salto doble, modo oscuro.

## Menú principal

- **Inicio** — accesos rápidos, estadísticas, desafío diario, noticias
- **Niveles** — campaña, endless, desafíos diarios, especiales
- **Puntajes** — ranking global y estadísticas personales
- **Perfil** — avatar, XP, logros, skins, ajustes
- **Tienda** — 9 ítems comprables con monedas del juego

El progreso (monedas, récords, niveles desbloqueados, estrellas, ajustes) se guarda en **localStorage** con la clave `parkourNocturno`.

## Estructura del proyecto

```
src/
├── app/
│   ├── layout.tsx          # Layout raíz
│   ├── page.tsx            # Página principal
│   └── globals.css         # Estilos del menú
├── components/
│   └── ParkourGame.tsx     # Menú + canvas + overlays
├── hooks/
│   └── useParkourGame.ts   # Estado del juego y persistencia
├── data/
│   └── shop.ts             # Ítems de tienda y datos estáticos
└── lib/
    ├── game/
    │   ├── constants.ts    # Colores, dimensiones, física
    │   ├── types.ts        # Tipos del motor
    │   ├── save.ts         # localStorage
    │   ├── physics.ts      # Salto, cables (Bezier)
    │   ├── engine.ts       # update, colisiones, doble salto
    │   ├── renderer.ts     # Dibujado en canvas
    │   └── world/
    │       └── endless.ts  # Generación procedural endless
    └── levels/
        ├── types.ts
        ├── builder.ts      # Construye mundos pasables
        ├── index.ts        # CAMPAIGN_LEVELS
        ├── level-01-callejon.ts
        ├── level-02-barrio-industrial.ts
        ├── …
        └── level-10-leyenda-urbana.ts
```

## Cómo añadir o editar un nivel

1. Crea o edita un archivo `src/lib/levels/level-XX-nombre.ts`.
2. Exporta un objeto `LevelScript`:

```typescript
import type { LevelScript } from "./types";

export const level11: LevelScript = {
  id: 11,
  name: "Mi Nivel",
  speed: 4.0,
  obstacles: 2,
  distance: 3000,
  startWidth: 220,
  segments: [
    "flat",
    "flat",
    "cable",
    "gap",
    "up",
    "flat",
  ],
};
```

3. Regístralo en `src/lib/levels/index.ts` dentro de `CAMPAIGN_LEVELS`.

### Tipos de tramo (`segments`)

| Tramo | Descripción |
|-------|-------------|
| `flat` | Techo ancho, altura similar |
| `up` | Subida suave |
| `down` | Bajada suave |
| `gap` | Hueco corto (alcanzable con salto / doble salto) |
| `cable` | Dos plataformas unidas por cable |

El `builder.ts` repite y combina los tramos hasta cubrir `distance`, añade plataforma de inicio y meta final, y coloca obstáculos lejos de los bordes.

## Mecánicas técnicas

- Canvas **680×360 px**, centrado y responsive
- Scroll: `player.x - 100`
- Gravedad, coyote time, doble salto, cables con curva cuadrática (catenaria)
- En campaña **no se eliminan** edificios por delante del jugador (solo limpieza detrás del scroll)
- Loop: `requestAnimationFrame` → `updateGame()` → `drawGame()`

## Paleta visual

| Uso | Color |
|-----|-------|
| Fondo | `#08090f` |
| Edificios | `#141830`, `#1a2048`, `#101328`, `#1e2240` |
| Neones | `#ff6b9d`, `#7af0ff`, `#f0ff7a`, `#c97aff`, `#7affc9` |
| UI dorado / cian | `#e0c97f`, `#7af0ff` |
| Obstáculos | `#ff4444` |

## Scripts npm

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm start` | Servir build |
| `npm run lint` | Linter (si está configurado) |

## Licencia

Proyecto privado / uso educativo. Ajusta la licencia según tu repositorio.
