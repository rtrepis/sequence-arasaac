// La barra de baix de l'edició al mòbil (pla dels estils, pas 8; D20, D22,
// D27): el «+» i la cerca de pictogrames, que és també la cerca màgica, a
// l'abast del polze. El «+» és un menú curt que s'obre cap amunt: «Afegeix un
// pictograma» (una targeta buida, com el «+» del comptador d'abans) i «Afegeix
// una seqüència». No és un panell de baix: aquest és només dels ajustos.
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
import {
  Box,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
} from "@mui/material";
import { MdAdd, MdOutlineAddBox, MdOutlinePostAdd } from "react-icons/md";
import { useIntl } from "react-intl";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { useFeedback } from "@/context/FeedbackContext";
import { APP_CORNER_RADIUS, APP_TOUCH_TARGET_MIN } from "@/style/appShape";
import useNewPictogram from "@features/pictogram/hooks/useNewPictogram";
import {
  addPictogramActionCreator,
  changeActiveSAACActionCreator,
} from "@features/sequence/store/documentSlice";
import { addNewSequenceThunk } from "@features/free-layout/store/freeLayoutThunks";
import tabsMessages from "@components/TabsSequences/TabsSequences.lang";
import headerMessages from "@features/sequence/components/SequenceHeader/SequenceHeader.lang";
import messages from "./EditBottomBar.lang";
import MagicSearch from "@features/pictogram/components/MagicSearch";
import {
  setFloatingBase,
  setFloatingFloor,
  setFloatingInset,
} from "@components/FloatingLayer";
import { useVisibleViewport } from "@components/AppBottomSheet/useVisibleViewport";

/** Com a molt, els pictogrames d'una seqüència (el límit del comptador d'abans) */
const MAX_PICTOGRAMS = 60;

const EditBottomBar = (): React.ReactElement => {
  const layerId = `edit-bottom-bar-${useId()}`;
  const barRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const viewport = useVisibleViewport();
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { showSnackbar } = useFeedback();
  const menuId = useId();
  const plusId = useId();
  const plusRef = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { getPictogramEmptyWithDefaultSettings: pictogramEmpty } =
    useNewPictogram();
  const amount = useAppSelector(
    (state) => Object.keys(state.document.content).length,
  );
  const pictogramCount = useAppSelector(
    (state) => state.document.content[state.document.activeSAAC]?.length ?? 0,
  );

  const addPictogram = () => {
    setMenuOpen(false);
    if (pictogramCount >= MAX_PICTOGRAMS) {
      showSnackbar({
        message: intl.formatMessage(messages.full, { max: MAX_PICTOGRAMS }),
        severity: "warning",
      });
      return;
    }
    dispatch(addPictogramActionCreator(pictogramEmpty(pictogramCount)));
    showSnackbar({
      message: intl.formatMessage(messages.pictogramAdded),
      severity: "success",
    });
  };

  const addSequence = () => {
    setMenuOpen(false);
    // Va a l'última pàgina, segons la seva disposició
    dispatch(addNewSequenceThunk(amount));
    dispatch(changeActiveSAACActionCreator(amount));
    showSnackbar({
      message: intl.formatMessage(headerMessages.added),
      severity: "success",
    });
  };

  const addLabel = intl.formatMessage(messages.add);

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
      {/* A l'escriptori (pas 10), centrada i amb l'amplada d'un mòbil
          apaïsat: una cerca de punta a punta d'una pantalla gran no es llegeix */}
      <Stack
        direction="row"
        alignItems="center"
        gap={1}
        sx={{ maxWidth: (theme) => theme.breakpoints.values.md, mx: "auto" }}
      >
        <Tooltip title={addLabel}>
          <IconButton
            ref={plusRef}
            id={plusId}
            aria-label={addLabel}
            aria-haspopup="menu"
            aria-controls={menuOpen ? menuId : undefined}
            aria-expanded={menuOpen ? "true" : undefined}
            onClick={() => setMenuOpen(true)}
            sx={{
              flexShrink: 0,
              width: 48,
              height: 48,
              minWidth: APP_TOUCH_TARGET_MIN,
              borderRadius: `${APP_CORNER_RADIUS}px`,
              bgcolor: "primary.main",
              color: "primary.contrastText",
              "&:hover": { bgcolor: "primary.dark" },
            }}
          >
            <MdAdd aria-hidden size={28} />
          </IconButton>
        </Tooltip>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <MagicSearch showHelperText={false} bottomBar />
        </Box>
      </Stack>

      {/* S'obre cap amunt: a sota no hi ha res */}
      <Menu
        id={menuId}
        anchorEl={plusRef.current}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        slotProps={{ list: { "aria-labelledby": plusId } }}
        anchorOrigin={{ vertical: "top", horizontal: "left" }}
        transformOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <MenuItem
          sx={{ minHeight: APP_TOUCH_TARGET_MIN }}
          onClick={addPictogram}
        >
          <ListItemIcon>
            <MdOutlineAddBox aria-hidden />
          </ListItemIcon>
          <ListItemText>
            {intl.formatMessage(messages.addPictogram)}
          </ListItemText>
        </MenuItem>
        <MenuItem
          sx={{ minHeight: APP_TOUCH_TARGET_MIN }}
          onClick={addSequence}
        >
          <ListItemIcon>
            <MdOutlinePostAdd aria-hidden />
          </ListItemIcon>
          <ListItemText>
            {intl.formatMessage(tabsMessages.addSequence)}
          </ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default EditBottomBar;
