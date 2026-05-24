# Parkour Nocturno

Juego 2D de parkour urbano nocturno en **Next.js** (Canvas API).

## Desarrollo

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Estructura

- `src/components/ParkourGame.tsx` — UI del menú y canvas
- `src/lib/game/` — motor, física, render, endless
- `src/lib/levels/` — **un archivo por nivel de campaña**
  - `level-01-callejon.ts` … `level-10-leyenda-urbana.ts`
  - `builder.ts` — construye mundos pasables desde cada script
  - `index.ts` — exporta `CAMPAIGN_LEVELS`

## Controles

- **Clic** o **Espacio** — saltar (doble salto en campaña y endless normal)
- Llega a la bandera **META** para completar un nivel
