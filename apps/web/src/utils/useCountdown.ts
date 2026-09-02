// Compte enrere fins a un instant donat.
//
// Retorna els components ja separats (hores, minuts, segons) i no una cadena
// formatada: el text el compon qui el pinta, amb els seus propis missatges
// traduïts. Un compte enrere escrit "05:12:44" no es llegeix igual en veu alta
// que "queden 5 hores i 12 minuts", i qui el fa servir ha de poder triar.
import { useEffect, useState } from "react";

export interface Countdown {
  /** Mil·lisegons que falten. Zero quan ja ha passat. */
  remainingMs: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** Cert des del moment en què l'instant objectiu ja ha passat. */
  isOver: boolean;
}

const SECOND_MS = 1000;

const toCountdown = (targetMs: number): Countdown => {
  const remainingMs = Math.max(targetMs - Date.now(), 0);
  const totalSeconds = Math.floor(remainingMs / SECOND_MS);

  return {
    remainingMs,
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    isOver: remainingMs === 0,
  };
};

/**
 * @param targetIso instant objectiu en ISO, o null si encara no se sap (mentre
 * el servidor no ha respost). Amb null no hi ha cap interval en marxa.
 * @param onOver es crida **un sol cop**, quan el compte arriba a zero. És on
 * qui el fa servir torna a demanar l'estat: el que el compte enrere anuncia és
 * justament que la xifra que hi ha a pantalla ha deixat de ser bona.
 */
const useCountdown = (
  targetIso: string | null,
  onOver?: () => void,
): Countdown | null => {
  const [countdown, setCountdown] = useState<Countdown | null>(null);

  useEffect(() => {
    if (!targetIso) {
      setCountdown(null);
      return;
    }

    const targetMs = new Date(targetIso).getTime();

    // Una data que el servidor enviï malament no ha de deixar la pàgina amb un
    // "NaN:NaN:NaN" enganxat: val més no ensenyar cap compte enrere
    if (Number.isNaN(targetMs)) {
      setCountdown(null);
      return;
    }

    setCountdown(toCountdown(targetMs));

    // Un cop arribat a zero l'interval s'atura tot sol: mantenir-lo viu només
    // repintaria "00:00:00" un cop per segon fins que algú tanqui la pestanya
    const interval = window.setInterval(() => {
      const next = toCountdown(targetMs);
      setCountdown(next);

      if (next.isOver) {
        window.clearInterval(interval);
        onOver?.();
      }
    }, SECOND_MS);

    return () => window.clearInterval(interval);
    // onOver no hi entra a propòsit: una funció nova a cada render reiniciaria
    // el compte enrere cada segon. Qui el passa l'ha d'estabilitzar (useCallback).
  }, [targetIso]); // eslint-disable-line react-hooks/exhaustive-deps

  return countdown;
};

export default useCountdown;
