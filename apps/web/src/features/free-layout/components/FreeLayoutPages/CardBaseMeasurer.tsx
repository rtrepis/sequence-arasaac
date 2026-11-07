import React, { useLayoutEffect, useRef } from "react";
import { Box } from "@mui/material";
import PictogramCard from "@components/PictogramCard/PictogramCard";
import type { PictogramCardDefaults, Sequence } from "@/types/sequence";
import type { CardPx } from "@features/free-layout/model/blockGrid";

/** La targeta més gran d'una seqüència a mida 1, en píxels d'impressió. */
export type CardBaseSize = CardPx;

interface CardBaseMeasurerProps {
  sequences: { key: number; pictograms: Sequence }[];
  defaults: PictogramCardDefaults;
  onMeasure: (sizes: Record<number, CardBaseSize>) => void;
}

/**
 * Mesura les targetes de cada seqüència a mida 1, fora de la vista.
 *
 * La graella d'una caixa (`computeGrid`) només necessita saber què fa la
 * targeta a mida 1: com que tot el que la dibuixa és proporcional a la mida,
 * la resta és una regla de tres. Es mesura al DOM i no es calcula perquè
 * l'alçada depèn de quantes línies fa el text, i això només ho sap la lletra.
 * Torna a mesurar quan canvia la mida de qualsevol targeta (per exemple, quan
 * arriba una font que no hi era).
 *
 * No surt mai al paper ni al PDF: és fora del full.
 */
const CardBaseMeasurer = ({
  sequences,
  defaults,
  onMeasure,
}: CardBaseMeasurerProps): React.ReactElement => {
  const containerRef = useRef<HTMLDivElement>(null);
  const onMeasureRef = useRef(onMeasure);
  onMeasureRef.current = onMeasure;

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const measure = () => {
      const sizes: Record<number, CardBaseSize> = {};
      container
        .querySelectorAll<HTMLElement>("[data-measure-key]")
        .forEach((group) => {
          const cards = Array.from(group.children) as HTMLElement[];
          sizes[Number(group.dataset.measureKey)] = {
            w: Math.max(0, ...cards.map((card) => card.offsetWidth)),
            h: Math.max(0, ...cards.map((card) => card.offsetHeight)),
          };
        });
      onMeasureRef.current(sizes);
    };

    measure();
    // Sense `ResizeObserver` (proves), la primera mesura és la que hi ha
    if (typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(measure);
    container
      .querySelectorAll<HTMLElement>("[data-measure-key] > *")
      .forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [sequences, defaults]);

  return (
    <Box
      ref={containerRef}
      aria-hidden
      data-html2canvas-ignore
      sx={{
        position: "absolute",
        left: -100000,
        top: 0,
        visibility: "hidden",
        pointerEvents: "none",
        "@media print": { display: "none" },
      }}
    >
      {sequences.map(({ key, pictograms }) => (
        <Box
          key={key}
          data-measure-key={key}
          sx={{ display: "flex", alignItems: "flex-start" }}
        >
          {pictograms.map((pictogram) => (
            <PictogramCard
              key={`${pictogram.indexSequence}_${pictogram.img.selectedId}`}
              pictogram={pictogram}
              view="complete"
              defaults={defaults}
              variant="plane"
              size={{ pictSize: 1, scale: 1 }}
            />
          ))}
        </Box>
      ))}
    </Box>
  );
};

export default CardBaseMeasurer;
