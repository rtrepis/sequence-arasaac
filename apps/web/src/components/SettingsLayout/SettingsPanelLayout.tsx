import { Box } from "@mui/material";
import React from "react";
import {
  SETTINGS_ROW_GAP,
  SETTINGS_ZONE_GAP,
  SETTINGS_MAX_WIDTH,
  SETTINGS_WIDE_MAX_WIDTH,
  SETTINGS_ASIDE_WIDTH,
  SETTINGS_CONTROLS_WIDTH,
  SETTINGS_APPBAR_OFFSET,
  SETTINGS_PREVIEW_STICKY_TOP,
  SETTINGS_PREVIEW_MOBILE_MAX_HEIGHT,
  SETTINGS_TWO_COLUMN_BREAKPOINT as MD,
  SETTINGS_THREE_COLUMN_BREAKPOINT as LG,
} from "./settingsLayout.styled";

interface SettingsPanelLayoutProps {
  /** Contingut de la previsualització (ja embolcallat amb SettingsPreviewFrame). Opcional. */
  preview?: React.ReactNode;
  /**
   * Contingut que acompanya la mostra a la columna esquerra però que no és
   * mostra (llistes llargues, com el vocabulari desat). En mòbil queda en flux
   * normal: no s'enganxa ni comparteix el límit d'alçada de la mostra.
   */
  previewAside?: React.ReactNode;
  /**
   * Guia del tab (`SettingsPanelHint`): què s'ajusta aquí i sobre què tindrà
   * efecte. És **el layout** qui decideix on va —tercera columna en escriptori,
   * damunt dels ajustos en tauleta i en mòbil—, i per això arriba per prop i no
   * com a primer fill de la columna de controls.
   */
  hint?: React.ReactNode;
  /** Columna de controls (files d'ajustos). */
  children: React.ReactNode;
  /** Separació vertical entre files de la columna de controls. Per defecte SETTINGS_ROW_GAP. */
  controlsGap?: number;
}

/**
 * Layout canònic d'un tab de configuracions, amb **tres** zones:
 * mostra a l'esquerra, ajustos al mig i ajuda a la dreta.
 *
 * - **Escriptori** (a partir de `lg`): les tres columnes en línia.
 * - **Tauleta** (`md`–`lg`): la mostra es queda a l'esquerra i la dreta apila
 *   l'ajuda damunt dels ajustos.
 * - **Mòbil** (per sota de `md`): tot en una columna i a tota l'amplada, en
 *   l'ordre mostra → ajuda → ajustos.
 *
 * Les columnes laterals **es reserven sempre**, també quan el tab no té mostra o
 * no té ajuda: així la columna d'ajustos cau al mateix lloc i amb la mateixa
 * amplada a tots els tabs, i canviar de pestanya no mou res de lloc.
 */
const SettingsPanelLayout = ({
  preview,
  previewAside,
  hint,
  children,
  controlsGap = SETTINGS_ROW_GAP,
}: SettingsPanelLayoutProps): React.ReactElement => {
  // El que s'enganxa no es pot menjar la pantalla: com a molt, l'alçada de la
  // finestra menys l'aire de dalt i el de baix
  const stickyMaxHeight = `calc(100vh - ${SETTINGS_PREVIEW_STICKY_TOP * 2}px)`;

  return (
    <Box
      sx={{
        // En mòbil, **flex** i no grid a propòsit: el que s'enganxa dins d'una
        // graella només es pot moure dins de la seva cel·la, i la mostra ha de
        // poder acompanyar tot l'scroll del panell, no només la seva fila. En
        // flex, en canvi, el bloc de referència és el contenidor sencer.
        display: { xs: "flex", [MD]: "grid" },
        flexDirection: "column",
        gridTemplateAreas: {
          [MD]: `"left hint" "left controls"`,
          [LG]: `"left controls hint"`,
        },
        gridTemplateColumns: {
          // `minmax(0, …)` perquè la columna central cedeixi abans de desbordar
          // en una finestra just per sota de l'amplada de les tres columnes
          [MD]: `${SETTINGS_ASIDE_WIDTH}px minmax(0, ${SETTINGS_CONTROLS_WIDTH}px)`,
          [LG]: `${SETTINGS_ASIDE_WIDTH}px minmax(0, ${SETTINGS_CONTROLS_WIDTH}px) ${SETTINGS_ASIDE_WIDTH}px`,
        },
        // A tauleta l'ajuda ocupa el que necessita i els ajustos s'enduen la
        // resta; així la mostra de l'esquerra abasta les dues files
        gridTemplateRows: { [MD]: "auto 1fr", [LG]: "auto" },
        // Centra el conjunt de columnes. Només a partir de `md`: en mòbil el
        // panell és flex en columna i `justifyContent` hi seria l'eix vertical
        justifyContent: { [MD]: "center" },
        columnGap: SETTINGS_ZONE_GAP,
        // Entre l'ajuda i els ajustos, el mateix ritme que entre files d'ajustos;
        // en mòbil, on separa zones diferents, l'aire de zona
        rowGap: { xs: SETTINGS_ZONE_GAP, [MD]: SETTINGS_ROW_GAP },
        maxWidth: {
          xs: SETTINGS_CONTROLS_WIDTH,
          [MD]: SETTINGS_MAX_WIDTH,
          [LG]: SETTINGS_WIDE_MAX_WIDTH,
        },
        mx: "auto",
        width: "100%",
      }}
    >
      {/* Columna de la mostra. En mòbil deixa de ser una caixa (`display:
          contents`) i els seus fills passen a penjar del panell: un `sticky`
          només s'enganxa mentre el seu pare és a la vista, i amb la caixa la
          mostra se n'anava amunt tot just començar a baixar.
          Sense mostra no es dibuixa res, però la columna hi continua sent: la
          declaren les pistes de la graella, no aquesta caixa. */}
      {(preview || previewAside) && (
        <Box
          sx={{
            gridArea: { [MD]: "left" },
            display: { xs: "contents", [MD]: "flex" },
            flexDirection: "column",
            gap: 1,
            // Sense això la columna s'estiraria fins al final de la graella i
            // l'enganxada no tindria on moure's; amb `start` la caixa fa el que
            // fa el seu contingut i es desplaça dins de la cel·la, que sí que és
            // alta
            alignSelf: "start",
            position: { [MD]: "sticky" },
            top: { [MD]: SETTINGS_PREVIEW_STICKY_TOP },
            maxHeight: { [MD]: stickyMaxHeight },
            overflow: { [MD]: "auto" },
          }}
        >
          {preview && (
            <Box
              sx={{
                // En mòbil l'enganxada la fa la mostra tota sola: la llista que
                // l'acompanya ha de poder pujar amb l'scroll de la pàgina
                position: { xs: "sticky", [MD]: "static" },
                // L'AppBar del diàleg és `fixed` per sota de `md` i no fa lloc
                top: SETTINGS_APPBAR_OFFSET,
                zIndex: 10,
                // Opaca: mentre és enganxada, els controls li passen per sota
                bgcolor: "background.paper",
                // L'aire va per dins de la caixa pintada; al `top` deixaria una
                // franja per on s'entreveuria el que hi passa per darrere
                paddingBlock: { xs: 1, [MD]: 0 },
                maxHeight: {
                  xs: SETTINGS_PREVIEW_MOBILE_MAX_HEIGHT,
                  [MD]: "none",
                },
                overflow: { xs: "auto", [MD]: "visible" },
                // A tota l'amplada en mòbil (si no, el fons no taparia el que
                // passa per sota) i amb la mostra centrada a dins
                width: "100%",
                display: "flex",
                justifyContent: { xs: "center", [MD]: "flex-start" },
              }}
            >
              {preview}
            </Box>
          )}

          {previewAside && <Box sx={{ width: "100%" }}>{previewAside}</Box>}
        </Box>
      )}

      {/* Columna de l'ajuda: pròpia en escriptori, damunt dels ajustos avall */}
      {hint && (
        <Box
          sx={{
            gridArea: { [MD]: "hint" },
            alignSelf: "start",
            position: { [LG]: "sticky" },
            top: { [LG]: SETTINGS_PREVIEW_STICKY_TOP },
            maxHeight: { [LG]: stickyMaxHeight },
            overflow: { [LG]: "auto" },
          }}
        >
          {hint}
        </Box>
      )}

      {/* Columna d'ajustos */}
      <Box
        sx={{
          gridArea: { [MD]: "controls" },
          display: "flex",
          flexDirection: "column",
          gap: controlsGap,
          minWidth: 0,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default SettingsPanelLayout;
