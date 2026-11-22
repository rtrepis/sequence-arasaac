import {
  Tab,
  Tabs,
  Tooltip,
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import React, { SyntheticEvent, useRef } from "react";
import TabPanelSequence from "../TabPanelSecuence/TabPanelSecuence";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { changeActiveSAACActionCreator } from "@features/sequence/store/documentSlice";
import { addNewSequenceThunk } from "@features/free-layout/store/freeLayoutThunks";
import { BsFileEarmarkPlus } from "react-icons/bs";
import StyledIconButton from "@/style/StyledIconButton";
import { useIntl } from "react-intl";
import messages from "./TabsSequences.lang";
import SequenceHeader from "@features/sequence/components/SequenceHeader/SequenceHeader";

/** Quant ha de lliscar el dit, en horitzontal, per passar de seqüència. */
const SWIPE_PX = 60;

interface TabsSequencesProps {
  /**
   * La pantalla d'edició nova (pas 8 del pla dels estils): una seqüència per
   * pantalla, amb la capçalera. Al mòbil sempre; a l'escriptori, si l'usuari
   * la tria (pas 10, `useEditLayout`)
   */
  newLayout?: boolean;
}

const TabsSequences = ({
  newLayout = false,
}: TabsSequencesProps): React.ReactElement => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const value = useAppSelector((state) => state.document.activeSAAC);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  // Nombre de tabs derivat de les claus de content (estat persistat en Redux)
  const amount = useAppSelector(
    (state) => Object.keys(state.document.content).length,
  );

  const handleChange = (event: SyntheticEvent, newValue: number) => {
    dispatch(changeActiveSAACActionCreator(newValue));
  };

  const handleAddSequence = () => {
    // Va a l'última pàgina, segons la seva disposició
    dispatch(addNewSequenceThunk(amount));
    dispatch(changeActiveSAACActionCreator(amount));
  };

  /**
   * El número de la seqüència activa el diu la tinta del tema, no el verd: com a
   * color de text, el verd de la casa es queda a 2,1:1 sobre el full. El verd es
   * queda a la barra de l'indicador, que és decoració i no l'única senyal.
   */
  const sequenceTabsSx = {
    "& .MuiTab-root": { color: "text.secondary" },
    "& .MuiTab-root.Mui-selected": { color: "text.primary" },
  };

  const tabs = [...Array(amount)].map((_, index) => (
    <Tab
      key={`tab-${index}`}
      label={`${index + 1}`}
      id={`vertical-tab-${index}`}
      aria-controls={`vertical-tabpanel-${index}`}
      sx={isMobile ? { minHeight: 36, minWidth: 40 } : undefined}
    />
  ));

  const addButton = (
    <Tooltip title={intl.formatMessage(messages.addSequence)}>
      <span>
        <StyledIconButton
          color="inherit"
          onClick={handleAddSequence}
          size="small"
          aria-label={intl.formatMessage(messages.addSequence)}
        >
          <BsFileEarmarkPlus size={isMobile ? 20 : 24} />
        </StyledIconButton>
      </span>
    </Tooltip>
  );

  // La pantalla nova (pas 8 del pla dels estils): una seqüència per pantalla.
  // Sense pestanyes: es passa de seqüència lliscant sobre la graella, amb les
  // fletxes ‹ › o amb la llista «2 de 5» de la capçalera (D19)
  if (newLayout) {
    const swipe = {
      onTouchStart: (event: React.TouchEvent) => {
        const touch = event.touches[0];
        touchStart.current = touch
          ? { x: touch.clientX, y: touch.clientY }
          : null;
      },
      onTouchEnd: (event: React.TouchEvent) => {
        const start = touchStart.current;
        touchStart.current = null;
        const touch = event.changedTouches[0];
        if (!start || !touch) return;
        const dx = touch.clientX - start.x;
        const dy = touch.clientY - start.y;
        // Un lliscament horitzontal clar; el vertical és desplaçar-se. Moure
        // una targeta demana mantenir el dit (250 ms) i no hi arriba
        if (Math.abs(dx) < SWIPE_PX || Math.abs(dx) < Math.abs(dy) * 1.5)
          return;
        const next = value + (dx < 0 ? 1 : -1);
        if (next < 0 || next >= amount) return;
        dispatch(changeActiveSAACActionCreator(next));
      },
    };
    return (
      <Box sx={{ width: "100%" }}>
        <SequenceHeader sequenceKey={value} compact />
        <Box
          data-testid="sequence-swipe"
          sx={{ touchAction: "pan-y", minHeight: "50vh" }}
          {...swipe}
        >
          <TabPanelSequence index={value} />
        </Box>
      </Box>
    );
  }

  // Desktop: tabs verticals a l'esquerra + panel a la dreta
  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={value}
          onChange={handleChange}
          aria-label={intl.formatMessage(messages.sequenceNumber)}
          sx={{
            borderRight: 1,
            borderColor: "divider",
            width: 100,
            ...sequenceTabsSx,
          }}
        >
          {tabs}
        </Tabs>
        {addButton}
      </div>
      {/* També a l'escriptori, amb les pestanyes de sempre (D23) */}
      <div style={{ flexGrow: 1, minWidth: 0 }}>
        <SequenceHeader sequenceKey={value} />
        <TabPanelSequence index={value} />
      </div>
    </div>
  );
};

export default TabsSequences;
