import { Box } from "@mui/material";
import { ResponsiveStyleValue } from "@mui/system";
import React, { useCallback, useLayoutEffect, useRef, useState } from "react";

interface ScaleToFitProps {
  children: React.ReactNode;
  /**
   * Alçada màxima que pot ocupar, en qualsevol unitat CSS i amb punts de
   * trencament si cal. Es llegeix del CSS calculat: així respecta les mateixes
   * `vh` i els mateixos punts de trencament que el layout que l'envolta.
   */
  maxHeight?: ResponsiveStyleValue<string | number>;
  /**
   * Anima el canvi d'escala (la previsualització fixa del formulari d'edició,
   * que s'encongeix en desplaçar). Mai amb `prefers-reduced-motion`.
   */
  animate?: boolean;
}

/**
 * Més que el gruix d'una barra de desplaçament (uns 15 px als navegadors
 * d'escriptori): el que canvia l'amplada quan la barra apareix o desapareix.
 */
const SCROLLBAR_ALLOWANCE = 24;

interface Fit {
  scale: number;
  width: number;
  height: number;
}

/**
 * Encabeix el contingut dins de l'espai que té, **escalant-lo uniformement**:
 * mai no el retalla ni el deforma, i mai no l'amplia (escala ≤ 1).
 *
 * Existeix per a les previsualitzacions dels panells de configuració: el
 * pictograma de mostra creix amb l'estil (vores, mida de la lletra, una paraula
 * llarga que no es parteix) i, dins d'un requadre de mida fixa i `overflow:
 * hidden`, en quedava una part fora de la vista.
 *
 * Mesura la mida natural del contingut —`scrollWidth`/`scrollHeight`, que
 * inclouen el que sobresurt de la targeta, com una paraula més ampla que ella—
 * i la compara amb l'amplada disponible i l'alçada màxima. `transform` no
 * canvia la mida de maquetació del contingut; l'alçada del contenidor, sí, i
 * això podia entrar en bucle amb la barra de desplaçament (vegeu `measure`).
 */
const ScaleToFit = ({
  children,
  maxHeight,
  animate = false,
}: ScaleToFitProps): React.ReactElement => {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState<Fit>({ scale: 1, width: 0, height: 0 });

  // L'escala que hi ha ara, i amb quina amplada disponible es va calcular. En
  // una ref i no només a l'estat: així es pot saber si ha canviat sense cridar
  // `setFit`, que programa un render encara que torni el mateix valor
  const fitRef = useRef<Fit>(fit);
  const measuredWidth = useRef(0);
  const transition = animate
    ? {
        transition: "transform 150ms ease-out, height 150ms ease-out",
        "@media (prefers-reduced-motion: reduce)": { transition: "none" },
      }
    : {};

  const measure = useCallback(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const width = inner.scrollWidth;
    const height = inner.scrollHeight;
    if (width === 0 || height === 0) return;

    const limit = parseFloat(getComputedStyle(outer).maxHeight);
    const availableHeight = Number.isFinite(limit) ? limit : Infinity;
    const availableWidth = outer.clientWidth;
    const scale = Math.min(1, availableWidth / width, availableHeight / height);

    const previous = fitRef.current;
    if (
      previous.scale === scale &&
      previous.width === width &&
      previous.height === height
    )
      return;

    // Contra el bucle: escalar canvia l'alçada, l'alçada fa aparèixer o
    // desaparèixer la barra de desplaçament del diàleg, i la barra canvia
    // l'amplada disponible, que torna a canviar l'escala. Amb el mateix
    // contingut, l'escala només torna a créixer si l'espai s'ha eixamplat més
    // que el gruix d'una barra de desplaçament
    const sameContent = previous.width === width && previous.height === height;
    if (
      sameContent &&
      scale > previous.scale &&
      availableWidth - measuredWidth.current <= SCROLLBAR_ALLOWANCE
    )
      return;

    measuredWidth.current = availableWidth;
    fitRef.current = { scale, width, height };
    setFit(fitRef.current);
  }, []);

  // A cada render: el contingut canvia de mida amb cada ajust del formulari
  useLayoutEffect(() => measure());

  // I quan canvia l'espai o arriben les fonts, que no passen per un render
  useLayoutEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;
    const observer = new ResizeObserver(measure);
    observer.observe(outer);
    observer.observe(inner);
    void document.fonts?.ready.then(measure);
    return () => observer.disconnect();
  }, [measure]);

  return (
    <Box
      ref={outerRef}
      sx={{
        position: "relative",
        width: "100%",
        maxHeight,
        height: fit.height * fit.scale,
        overflow: "hidden",
        ...transition,
      }}
    >
      <Box
        ref={innerRef}
        sx={{
          position: "absolute",
          top: 0,
          left: "50%",
          width: "max-content",
          transform: `translateX(-50%) scale(${fit.scale})`,
          transformOrigin: "top center",
          ...transition,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default ScaleToFit;
