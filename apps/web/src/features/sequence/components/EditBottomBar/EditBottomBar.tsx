// La barra de baix de l'edició al mòbil (pla dels estils, pas 8; D22, D27,
// D29): la cerca de pictogrames, que és també la cerca màgica, a l'abast del
// polze. Afegir un pictograma és cercar-lo; afegir una seqüència és a la
// llista «2 de 5» de la capçalera. Per això no hi ha cap «+» (D29).
//
// És fixa a baix de la pantalla i **puja amb el teclat**: amb el teclat virtual
// obert, el Safari d'iOS no encongeix la finestra i una barra fixa hi quedaria
// a sota (`useVisibleViewport`). Declara la seva alçada a `FloatingLayer`, com
// el panell de baix de la vista: el botó d'estat s'hi posa just a sobre (el
// sòcol), els avisos també (el terra), i el contingut en reserva l'alçada
// perquè l'última fila de pictogrames no hi quedi a sota.
//
// No surt mai al paper: la impressió només pinta el full (`usePrintSheet`).
import React, { useEffect, useId, useRef, useState } from "react";
import { Box } from "@mui/material";
import MagicSearch from "@features/pictogram/components/MagicSearch";
import {
  setFloatingBase,
  setFloatingFloor,
  setFloatingInset,
} from "@components/FloatingLayer";
import { useVisibleViewport } from "@components/AppBottomSheet/useVisibleViewport";

const EditBottomBar = (): React.ReactElement => {
  const layerId = `edit-bottom-bar-${useId()}`;
  const barRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const viewport = useVisibleViewport();

  // L'alçada es mesura: el camp pot fer dues línies en un idioma llarg
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return undefined;
    const measure = () => setHeight(bar.getBoundingClientRect().height);
    measure();
    if (typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(bar);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (height === 0) return;
    const occupied = height + viewport.bottom;
    setFloatingBase(layerId, occupied);
    setFloatingFloor(layerId, occupied);
    setFloatingInset(layerId, height);
  }, [layerId, height, viewport.bottom]);

  useEffect(
    () => () => {
      setFloatingBase(layerId, null);
      setFloatingFloor(layerId, null);
      setFloatingInset(layerId, null);
    },
    [layerId],
  );

  return (
    <Box
      ref={barRef}
      data-testid="edit-bottom-bar"
      sx={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: `${viewport.bottom}px`,
        zIndex: (theme) => theme.zIndex.appBar - 1,
        bgcolor: "background.default",
        borderTop: 1,
        borderColor: "divider",
        pt: 1,
        pb: "calc(8px + env(safe-area-inset-bottom, 0px))",
        pl: "max(16px, env(safe-area-inset-left, 0px))",
        pr: "max(16px, env(safe-area-inset-right, 0px))",
        "@media print": { display: "none" },
      }}
    >
      <MagicSearch showHelperText={false} bottomBar />
    </Box>
  );
};

export default EditBottomBar;
