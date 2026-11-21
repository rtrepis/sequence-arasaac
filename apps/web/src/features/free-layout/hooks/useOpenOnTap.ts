// Quan un toc al full obre els ajustos (D1 de `docs/plans/fets/PLA-vista-mobil.md`): a la
// disposició lliure, tocar un bloc sovint vol dir moure'l, i el panell pujant
// hi faria nosa. Allà, un toc només selecciona i el doble toc obre els ajustos;
// a la resta, un toc ja els obre.
import { useCallback, useRef } from "react";

/** Temps màxim entre dos tocs perquè siguin un doble toc, en ms. */
export const DOUBLE_TAP_MS = 350;

/**
 * Retorna una funció que diu si aquest toc ha d'obrir els ajustos. `key` diu
 * què s'ha tocat: un doble toc ho és només si els dos tocs són a la mateixa
 * cosa.
 */
export const useOpenOnTap = (): ((
  key: string,
  needsDoubleTap: boolean,
) => boolean) => {
  const last = useRef<{ key: string; time: number } | null>(null);

  return useCallback((key: string, needsDoubleTap: boolean): boolean => {
    const now = performance.now();
    const previous = last.current;
    const double =
      previous !== null &&
      previous.key === key &&
      now - previous.time < DOUBLE_TAP_MS;
    // Després d'un doble toc, el tercer en torna a començar un
    last.current = double ? null : { key, time: now };
    return !needsDoubleTap || double;
  }, []);
};
