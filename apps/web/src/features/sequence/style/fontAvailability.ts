// Quines fonts d'una seqüència no es poden pintar en aquest dispositiu.
//
// El `.saac` només desa el nom de la família, mai la font: les sis pròpies
// viuen dins de l'app (`style/fonts/`) i la resta arriben de Google Fonts. Una
// família pot faltar si el fitxer ve d'una versió de l'app que en té alguna que
// aquesta no coneix, o si el dispositiu no arriba a Google Fonts (sense
// connexió, o una xarxa d'escola que el bloqueja). En tots dos casos el text es
// pinta amb la font de reserva (`fontStack`), i l'avís en obrir la seqüència ho
// diu.
import { fontList } from "@/data/fontlist";

// Si Google Fonts triga més que això, no es diu que la font falta: val més no
// avisar que avisar d'una cosa que d'aquí a un moment ja no serà certa
const LOAD_TIMEOUT_MS = 4000;

const TIMED_OUT = Symbol("timed-out");

const loadWithTimeout = (
  family: string,
): Promise<FontFace[] | typeof TIMED_OUT> =>
  Promise.race([
    document.fonts.load(`16px "${family}"`),
    new Promise<typeof TIMED_OUT>((resolve) =>
      setTimeout(() => resolve(TIMED_OUT), LOAD_TIMEOUT_MS),
    ),
  ]);

export const findUnavailableFonts = async (
  families: string[],
): Promise<string[]> => {
  const known = new Set<string>(fontList);
  const unknown = families.filter((family) => !known.has(family));
  const candidates = families.filter((family) => known.has(family));

  // Sense l'API de fonts (navegadors molt vells) només se sap el que l'app no coneix
  if (typeof document === "undefined" || !document.fonts?.load) return unknown;

  const results = await Promise.all(
    candidates.map(async (family) => {
      try {
        const faces = await loadWithTimeout(family);
        return faces !== TIMED_OUT && faces.length === 0 ? family : null;
      } catch {
        return family;
      }
    }),
  );

  return [
    ...unknown,
    ...results.filter((family): family is string => family !== null),
  ].sort();
};
