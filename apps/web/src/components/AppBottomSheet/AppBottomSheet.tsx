// El panell de baix: el tercer component canònic de capes flotants, al costat
// dels dos diàlegs (vegeu «Panell de baix» a `docs/estandards/capes-flotants.md`
// i el pla, `docs/PLA-vista-mobil.md`).
//
// Fet a mà i no amb el `SwipeableDrawer` de MUI: aquell és un drawer temporal,
// amb un fons que tapa i bloqueja la pàgina, i la seva variant persistent no
// llisca. El que cal és una capa **no modal** amb una nansa: uns quants
// `pointer events` i una transició de `transform`.
//
// És genèric: no sap res de la vista, ni de la barra de l'app, ni de quin
// contingut porta. L'alçada la controla qui el munta (`snap` i `onSnapChange`),
// perquè la vista l'ha de poder portar a mig quan es selecciona un bloc.
import React, {
  PointerEvent,
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Box, ButtonBase } from "@mui/material";
import { MdExpandLess, MdExpandMore } from "react-icons/md";
import StyledButton from "@/style/StyledButton";
import { APP_CORNER_RADIUS, APP_TOUCH_TARGET_MIN } from "@/style/appShape";
import { bottomSheetStrip } from "@/style/palette";
import {
  setFloatingFloor,
  setFloatingInset,
  setFloatingRaised,
} from "@components/FloatingLayer";
import {
  BOTTOM_SHEET_TOP_GAP,
  BottomSheetSnap,
  bottomSheetHeights,
  pickBottomSheetSnap,
} from "./bottomSheetSnap";
import { useVisibleViewport } from "./useVisibleViewport";

/**
 * Píxels que el dit s'ha de moure abans que tocar la capçalera es converteixi
 * en arrossegar-la. Per sota, és un toc, i el botó o les molles que hi hagi a
 * la capçalera el reben com sempre.
 */
const DRAG_THRESHOLD = 6;

/**
 * Amagat només a la vista: continua a l'arbre d'accessibilitat i a l'ordre de
 * tabulació (el patró «visually hidden»).
 */
const VISUALLY_HIDDEN = {
  border: 0,
  clip: "rect(0 0 0 0)",
  height: "1px",
  width: "1px",
  margin: "-1px",
  padding: 0,
  overflow: "hidden",
  position: "absolute",
  whiteSpace: "nowrap",
} as const;

/** Durada de la transició entre parades, en ms. */
const SNAP_TRANSITION_MS = 250;

/** Aire que es deixa entre el camp enfocat i la vora del que es veu, en px. */
const REVEAL_MARGIN = 16;

/** Els camps on s'escriu: tocar-los obre el teclat virtual. */
const TEXT_ENTRY =
  "textarea, [contenteditable=''], [contenteditable='true'], " +
  "input:not([type=range]):not([type=checkbox]):not([type=radio])" +
  ":not([type=button]):not([type=submit]):not([type=reset])";

/**
 * Si el que rep el focus s'ha de portar a la vista: el que s'hi arriba amb el
 * teclat (`:focus-visible`) i els camps de text, que en tocar-los obren el
 * teclat virtual.
 */
const needsReveal = (element: Element): boolean => {
  if (element.matches(TEXT_ENTRY)) return true;
  try {
    return element.matches(":focus-visible");
  } catch {
    // Navegadors sense `:focus-visible` (i jsdom): només els camps de text
    return false;
  }
};

export interface AppBottomSheetProps {
  /** La parada actual. El panell no la canvia sol: ho demana amb `onSnapChange`. */
  snap: BottomSheetSnap;
  /** El panell demana anar a una altra parada (botó, franja o arrossegament). */
  onSnapChange: (snap: BottomSheetSnap) => void;
  /** Nom de la regió, per al lector de pantalla («Ajustos», M1). */
  label: string;
  /** Text del botó de la capçalera quan el panell és plegat («Mostra…»). */
  showLabel: string;
  /** Text del botó de la capçalera quan el panell és obert («Amaga…»). */
  hideLabel: string;
  /** Text de la franja de dalt a sencer, que torna a mig. */
  returnLabel: string;
  /**
   * El que va a la capçalera, al costat del botó: és el que es veu plegat (a la
   * vista, les molles). Arrossegar-lo mou el panell; tocar-lo, no.
   */
  header?: ReactNode;
  /** El contingut, amb scroll propi. */
  children: ReactNode;
  /**
   * Identificador estable amb què el panell declara la seva alçada a
   * `FloatingLayer`. Només cal canviar-lo si mai n'hi hagués dos alhora.
   */
  layerId?: string;
}

/** El gest que s'està fent sobre la capçalera. */
interface Gesture {
  pointerId: number;
  startY: number;
  startVisible: number;
  lastY: number;
  lastTime: number;
  /** px/ms, positiva cap amunt. */
  velocity: number;
  dragging: boolean;
}

const AppBottomSheet = ({
  snap,
  onSnapChange,
  label,
  showLabel,
  hideLabel,
  returnLabel,
  header,
  children,
  layerId = "app-bottom-sheet",
}: AppBottomSheetProps): ReactElement => {
  const contentId = useId();
  const viewport = useVisibleViewport();

  // Plegat, es veu la capçalera i prou: la seva alçada es mesura, perquè
  // depèn del que s'hi posi i de l'amplada
  const headerRef = useRef<HTMLDivElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  useLayoutEffect(() => {
    const node = headerRef.current;
    if (!node) return undefined;

    const measure = (): void =>
      setHeaderHeight(Math.round(node.getBoundingClientRect().height));
    measure();

    if (typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const heights = bottomSheetHeights(viewport.height, headerHeight);

  // Mentre s'arrossega, l'alçada la porta el dit, no la parada
  const [dragVisible, setDragVisible] = useState<number | null>(null);
  const isDragging = dragVisible !== null;
  const visible = dragVisible ?? heights[snap];
  const settledVisible = heights[snap];

  // El contingut plegat no es pot tabular ni llegir: no es veu. S'amaga quan
  // la transició ha acabat, no abans, perquè no desaparegui mentre baixa
  const [contentHidden, setContentHidden] = useState(snap === "collapsed");
  useEffect(() => {
    if (snap !== "collapsed" || isDragging) {
      setContentHidden(false);
      return undefined;
    }

    const timer = window.setTimeout(
      () => setContentHidden(true),
      SNAP_TRANSITION_MS,
    );
    return () => window.clearTimeout(timer);
  }, [snap, isDragging]);

  // El botó d'estat i els avisos s'hi posen damunt (el terra), el contingut
  // de sota en reserva l'alçada (la reserva), i qui s'hagi d'apartar quan el
  // panell puja ho sap pel senyal. Amb el panell quiet: mentre s'arrossega,
  // fer saltar el botó d'estat a cada píxel no ajudaria ningú.
  //
  // **El terra no passa de mig.** A sencer, damunt del panell només hi ha la
  // franja que torna a mig, i un avís que s'hi posés damunt la taparia: hi
  // queia a sobre el «Fitxer carregat correctament» en obrir un document. A
  // sencer, doncs, els avisos suren damunt del contingut a l'alçada de mig,
  // que és on és el botó d'estat quan el panell no és plegat
  const floor = Math.min(settledVisible, heights.half);
  useEffect(() => {
    setFloatingFloor(layerId, floor + viewport.bottom);
    setFloatingInset(layerId, settledVisible);
  }, [layerId, floor, settledVisible, viewport.bottom]);

  useEffect(() => {
    setFloatingRaised(layerId, snap !== "collapsed");
  }, [layerId, snap]);

  useEffect(
    () => () => {
      setFloatingFloor(layerId, null);
      setFloatingInset(layerId, null);
      setFloatingRaised(layerId, false);
    },
    [layerId],
  );

  // ---- El camp enfocat, a la vista ----

  // El navegador porta a la vista el que rep el focus, però no sap que el
  // panell baixa amb un `transform`: per a ell, el contingut fa sempre
  // l'alçada de sencer, i un camp de la part de baixa «ja es veu» encara que
  // sigui sota la pantalla. I quan s'obre el teclat virtual, el panell
  // s'encongeix i el camp on s'escriu hi pot quedar a sota. Aquí es mira amb
  // les mides de debò: el que es veu del contingut és el que queda entre la
  // capçalera i la vora de baix del que es veu de la pantalla
  const contentRef = useRef<HTMLDivElement | null>(null);
  const roomRef = useRef(0);
  roomRef.current = settledVisible - headerHeight;

  const reveal = useCallback((element: Element): void => {
    const content = contentRef.current;
    if (!content || !content.contains(element)) return;

    // Les dues mides passen pel mateix `transform`: la diferència no en depèn,
    // i així val també a mitja transició
    const box = content.getBoundingClientRect();
    const target = element.getBoundingClientRect();
    const top = target.top - box.top;
    const bottom = target.bottom - box.top;
    const room = roomRef.current;
    if (room <= 0) return;

    if (top < REVEAL_MARGIN || bottom - top > room - 2 * REVEAL_MARGIN)
      content.scrollTop += top - REVEAL_MARGIN;
    else if (bottom > room - REVEAL_MARGIN)
      content.scrollTop += bottom - room + REVEAL_MARGIN;
  }, []);

  // En rebre el focus: amb el teclat, o en tocar un camp de text (que obre el
  // teclat virtual). Un toc a un lliscador no fa moure res: el contingut
  // saltaria sota el dit que l'arrossega
  const handleFocusIn = (event: React.FocusEvent<HTMLDivElement>): void => {
    const element = event.target;
    if (!needsReveal(element)) return;
    window.requestAnimationFrame(() => reveal(element));
  };

  // I quan el panell canvia d'alçada amb el focus a dins: és el que passa en
  // obrir-se el teclat virtual, que encongeix el que es veu de la pantalla
  useEffect(() => {
    const focused = document.activeElement;
    if (!focused || !contentRef.current?.contains(focused)) return undefined;

    const frame = window.requestAnimationFrame(() => reveal(focused));
    return () => window.cancelAnimationFrame(frame);
  }, [reveal, settledVisible, viewport.height, viewport.top]);

  // ---- Arrossegar la nansa o la capçalera ----

  const gesture = useRef<Gesture | null>(null);
  const visibleRef = useRef(visible);
  visibleRef.current = visible;
  // Després d'arrossegar, el `click` que el navegador dispara en deixar anar
  // el dit no ha de prémer el botó que hi havia a sota
  const suppressClick = useRef(false);

  const clampVisible = useCallback(
    (value: number): number =>
      Math.min(heights.full, Math.max(heights.collapsed, value)),
    [heights.full, heights.collapsed],
  );

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>): void => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    suppressClick.current = false;
    gesture.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startVisible: heights[snap],
      lastY: event.clientY,
      lastTime: event.timeStamp,
      velocity: 0,
      dragging: false,
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>): void => {
    const current = gesture.current;
    if (!current || current.pointerId !== event.pointerId) return;

    const delta = event.clientY - current.startY;
    if (!current.dragging) {
      if (Math.abs(delta) < DRAG_THRESHOLD) return;

      // Ara sí que és arrossegar: el dit és del panell fins que el deixi anar,
      // encara que surti de la capçalera
      current.dragging = true;
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        // Sense captura el gest continua mentre el dit sigui a la capçalera
      }
    }

    const elapsed = Math.max(1, event.timeStamp - current.lastTime);
    current.velocity = (current.lastY - event.clientY) / elapsed;
    current.lastY = event.clientY;
    current.lastTime = event.timeStamp;

    setDragVisible(clampVisible(current.startVisible - delta));
  };

  const handlePointerEnd = (event: PointerEvent<HTMLDivElement>): void => {
    const current = gesture.current;
    if (!current || current.pointerId !== event.pointerId) return;
    gesture.current = null;

    if (!current.dragging) return;

    suppressClick.current = true;
    const target = pickBottomSheetSnap(
      visibleRef.current,
      current.velocity,
      heights,
    );
    setDragVisible(null);
    if (target !== snap) onSnapChange(target);
  };

  const handleClickCapture = (event: React.MouseEvent): void => {
    if (!suppressClick.current) return;

    suppressClick.current = false;
    event.preventDefault();
    event.stopPropagation();
  };

  // ---- Botons ----

  const isExpanded = snap !== "collapsed";
  const strip = bottomSheetStrip;

  return (
    <>
      {/* A sencer, la franja de dalt no és un tros del que hi ha a sota: és
          un botó que torna a mig, i per això no s'hi pot arrossegar res */}
      {snap === "full" && !isDragging && (
        <ButtonBase
          onClick={() => onSnapChange("half")}
          sx={(theme) => ({
            position: "fixed",
            top: viewport.top,
            left: 0,
            right: 0,
            height: BOTTOM_SHEET_TOP_GAP,
            zIndex: theme.zIndex.mobileStepper,
            gap: 1,
            fontWeight: "bold",
            fontSize: theme.typography.body2.fontSize,
            bgcolor: strip[theme.palette.mode].background,
            color: strip[theme.palette.mode].text,
            "@media print": { display: "none" },
          })}
        >
          <MdExpandMore aria-hidden size={20} />
          {returnLabel}
        </ButtonBase>
      )}

      <Box
        component="section"
        role="region"
        aria-label={label}
        data-snap={snap}
        sx={(theme) => ({
          position: "fixed",
          left: 0,
          right: 0,
          // Damunt del teclat virtual quan el navegador no encongeix la
          // finestra (Safari d'iOS)
          bottom: viewport.bottom,
          height: heights.full,
          transform: `translateY(${heights.full - visible}px)`,
          // Sense transició fins que la capçalera s'ha mesurat: si no, el
          // panell entraria lliscant des de baix en muntar-se
          transition:
            isDragging || headerHeight === 0
              ? "none"
              : `transform ${SNAP_TRANSITION_MS}ms ${theme.transitions.easing.easeOut}`,
          zIndex: theme.zIndex.mobileStepper,
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.paper",
          color: "text.primary",
          borderTopLeftRadius: APP_CORNER_RADIUS,
          borderTopRightRadius: APP_CORNER_RADIUS,
          boxShadow: theme.shadows[8],
          // El panell no és mai al paper: la impressió només pinta la còpia
          // dels fulls (`usePrintSheet`), però per si de cas
          "@media print": { display: "none" },
        })}
      >
        {/* La capçalera: la nansa i la fila del botó. És l'única part que
            mou el panell; el contingut fa scroll per dins */}
        <Box
          ref={headerRef}
          data-testid="app-bottom-sheet-header"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          onClickCapture={handleClickCapture}
          sx={{
            flexShrink: 0,
            // El navegador no ha de fer scroll ni «estirar per refrescar»
            // amb el dit que arrossega el panell
            touchAction: "none",
            userSelect: "none",
            cursor: isDragging ? "grabbing" : "grab",
            pb: 1,
          }}
        >
          <Box
            aria-hidden
            sx={{
              width: 36,
              height: 4,
              borderRadius: 2,
              bgcolor: "divider",
              mx: "auto",
              mt: 1,
              mb: 0.5,
            }}
          />
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 2,
              minHeight: APP_TOUCH_TARGET_MIN,
            }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>{header}</Box>
            {/* Plegat ↔ mig, i diu què farà. A sencer no hi porta cap botó:
                sencer no dona res que mig no tingui (M3). **Amagat només a la
                vista**: és a l'arbre d'accessibilitat i a l'ordre de
                tabulació, i es veu quan rep el focus. Amb el dit, el panell
                es mou per la nansa, i el toc al full o a les molles el puja */}
            <StyledButton
              color="inherit"
              size="small"
              aria-expanded={isExpanded}
              aria-controls={contentId}
              onClick={() => onSnapChange(isExpanded ? "collapsed" : "half")}
              endIcon={
                isExpanded ? (
                  <MdExpandMore aria-hidden />
                ) : (
                  <MdExpandLess aria-hidden />
                )
              }
              sx={{
                flexShrink: 0,
                minHeight: APP_TOUCH_TARGET_MIN,
                "&:not(:focus-visible)": VISUALLY_HIDDEN,
              }}
            >
              {isExpanded ? hideLabel : showLabel}
            </StyledButton>
          </Box>
        </Box>

        <Box
          ref={contentRef}
          id={contentId}
          hidden={contentHidden}
          onFocus={handleFocusIn}
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            // L'scroll del contingut no passa mai a la pàgina de sota
            overscrollBehavior: "contain",
            // El panell fa sempre l'alçada de sencer i baixa amb un
            // `transform`: el tros que queda sota la pantalla es reserva al
            // final perquè l'últim ajust s'hi pugui arribar a mig
            pb: `${heights.full - settledVisible}px`,
          }}
        >
          {children}
        </Box>
      </Box>
    </>
  );
};

export default AppBottomSheet;
