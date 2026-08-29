import { useCallback, useEffect, useRef } from "react";
import { FLOATING_EDGE_GAP } from "@/style/appShape";
import { setFloatingInset } from "./floatingInset";

/**
 * Reserva al final del contingut l'alçada real de la capa flotant. Retorna la
 * `ref` que s'ha de posar a l'element que sura.
 *
 * Es mesura i no es calcula perquè l'alçada d'un avís depèn del text i de
 * l'amplada: el mateix missatge fa dues línies en escriptori i cinc en un
 * telèfon, i just en el telèfon és on tapa més.
 */
export const useFloatingInset = (
  id: string,
): ((node: HTMLElement | null) => void) => {
  const observer = useRef<ResizeObserver | null>(null);

  // En desmuntar-se, la capa deixa de reservar res
  useEffect(
    () => () => {
      observer.current?.disconnect();
      setFloatingInset(id, null);
    },
    [id],
  );

  return useCallback(
    (node: HTMLElement | null): void => {
      observer.current?.disconnect();
      observer.current = null;

      if (!node || typeof ResizeObserver === "undefined") {
        setFloatingInset(id, null);
        return;
      }

      const resizeObserver = new ResizeObserver(() => {
        setFloatingInset(
          id,
          node.getBoundingClientRect().height + FLOATING_EDGE_GAP,
        );
      });

      resizeObserver.observe(node);
      observer.current = resizeObserver;
    },
    [id],
  );
};
