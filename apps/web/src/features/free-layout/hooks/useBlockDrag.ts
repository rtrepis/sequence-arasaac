// Moure i canviar la mida d'un bloc arrossegant-lo (fase 4): amb el ratolí, el
// dit o el teclat, sempre enganxat a la quadrícula de punts (`grid.ts`).
import React, { useRef, useState } from "react";
import { useAppDispatch } from "@/app/hooks";
import type { Box, SheetArea } from "../model/placement";
import {
  Edges,
  MOVE,
  cellSize,
  dragGridBox,
  gridToBox,
  snapToGrid,
} from "../model/grid";
import { setPlacementBoxThunk } from "../store/freeLayoutThunks";
import { mmToPixelsExact } from "@features/print/utils/pageUnits";
import { CSS_PRINT_DPI } from "@features/print/utils/pageFormat";

/** Quant s'ha de moure el punter, en px de pantalla, perquè sigui arrossegar i no clicar. */
const DRAG_THRESHOLD_PX = 4;

interface Drag {
  pointerId: number;
  edges: Edges;
  x: number;
  y: number;
  moved: boolean;
}

interface BlockDrag {
  /** La caixa mentre s'arrossega; `null` si no s'arrossega */
  live: Box | null;
  /** Comença a arrossegar: el cos del bloc (moure) o una nansa (mida) */
  start: (event: React.PointerEvent<HTMLElement>, edges: Edges) => void;
  onPointerMove: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerUp: (event: React.PointerEvent<HTMLElement>) => void;
  /** Si el clic que ve és el final d'un arrossegament (i no ha de seleccionar) */
  consumeClick: () => boolean;
  /** Fletxes: mou una cel·la; amb Maj, en canvia la mida. Torna si l'ha feta servir */
  onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => boolean;
}

export const useBlockDrag = (
  placementId: string,
  box: Box,
  area: SheetArea | undefined,
  scale: number,
): BlockDrag => {
  const dispatch = useAppDispatch();
  const drag = useRef<Drag | null>(null);
  const clickAfterDrag = useRef(false);
  const [live, setLive] = useState<Box | null>(null);
  // Els mm de pantalla: el full és a mida real i escalat
  const mmPerScreenPx = 1 / (mmToPixelsExact(1, CSS_PRINT_DPI) * scale);

  const target = (event: React.PointerEvent<HTMLElement>): Box | null => {
    const current = drag.current;
    if (!current || !area) return null;
    const dx = (event.clientX - current.x) * mmPerScreenPx;
    const dy = (event.clientY - current.y) * mmPerScreenPx;
    return gridToBox(
      dragGridBox(snapToGrid(box, area), current.edges, dx, dy, area),
      area,
    );
  };

  const commit = (next: Box) => {
    const same =
      Math.abs(next.x - box.x) < 0.01 &&
      Math.abs(next.y - box.y) < 0.01 &&
      Math.abs(next.w - box.w) < 0.01 &&
      Math.abs(next.h - box.h) < 0.01;
    if (!same) dispatch(setPlacementBoxThunk(placementId, next));
  };

  return {
    live,
    start: (event, edges) => {
      if (!area || event.button !== 0) return;
      event.stopPropagation();
      event.currentTarget.setPointerCapture?.(event.pointerId);
      drag.current = {
        pointerId: event.pointerId,
        edges,
        x: event.clientX,
        y: event.clientY,
        moved: false,
      };
    },
    onPointerMove: (event) => {
      const current = drag.current;
      if (!current || current.pointerId !== event.pointerId) return;
      if (
        !current.moved &&
        Math.hypot(event.clientX - current.x, event.clientY - current.y) <
          DRAG_THRESHOLD_PX
      )
        return;
      current.moved = true;
      setLive(target(event));
    },
    onPointerUp: (event) => {
      const current = drag.current;
      if (!current || current.pointerId !== event.pointerId) return;
      // La caixa final, abans de tancar l'arrossegament: `target` el llegeix
      const next = current.moved ? target(event) : null;
      drag.current = null;
      if (current.moved) clickAfterDrag.current = true;
      if (next) commit(next);
      setLive(null);
    },
    consumeClick: () => {
      const was = clickAfterDrag.current;
      clickAfterDrag.current = false;
      return was;
    },
    onKeyDown: (event) => {
      if (!area) return false;
      const steps: Record<string, [number, number]> = {
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
      };
      const step = steps[event.key];
      if (!step) return false;
      event.preventDefault();
      const cell = cellSize(area);
      // Amb Maj, la vora de la dreta i la de baix: la mida
      const edges: Edges = event.shiftKey
        ? { left: false, right: true, top: false, bottom: true }
        : MOVE;
      commit(
        gridToBox(
          dragGridBox(
            snapToGrid(box, area),
            edges,
            step[0] * cell.w,
            step[1] * cell.h,
            area,
          ),
          area,
        ),
      );
      return true;
    },
  };
};
