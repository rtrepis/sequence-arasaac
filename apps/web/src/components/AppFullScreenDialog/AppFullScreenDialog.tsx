import React, { forwardRef, ReactElement, ReactNode } from "react";
import {
  AppBar,
  Box,
  Dialog,
  IconButton,
  Slide,
  Tabs,
  Toolbar,
  Typography,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { AiOutlineClose } from "react-icons/ai";
import { AppTab, tabsStyled } from "@components/AppTabs";
import {
  appFullScreenAppBar,
  appFullScreenAppBarSpacer,
  appFullScreenTitle,
  appFullScreenToolbar,
} from "./appFullScreenDialog.styled";

/** Un tab de la barra: el valor que identifica el panell, la icona i el text. */
export interface AppFullScreenDialogTab<TValue extends string> {
  value: TValue;
  icon: ReactElement;
  label: string;
}

interface AppFullScreenDialogProps<TValue extends string> {
  open: boolean;
  /** Tancar: la creu de la barra, l'ESC i el clic a fora. */
  onClose: () => void;
  /** Diu on ets. És el nom accessible del diàleg i el títol de la barra. */
  title: string;
  /** Nom accessible del botó de tancar, en l'idioma de qui mira. */
  closeLabel: string;
  /** Els tabs de la barra. Sense tabs, la barra només porta títol i creu. */
  tabs?: AppFullScreenDialogTab<TValue>[];
  activeTab?: TValue;
  onTabChange?: (value: TValue) => void;
  children: ReactNode;
}

const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="right" ref={ref} {...props} />;
});

/**
 * Diàleg a pantalla completa: la superfície de treball de l'app, amb barra
 * superior i, si cal, tabs.
 *
 * És el segon diàleg canònic, al costat d'`AppDialog`, i no una excepció seva:
 * un diàleg centrat amb el títol al mig i les accions al peu i una superfície
 * de treball a pantalla completa amb tabs i creu a la barra són dues formes
 * diferents, i encabir-les en un sol component volia dir un component amb dues
 * personalitats i el doble de props. Fora d'aquests dos, cap `Dialog` de MUI
 * —vegeu `docs/estandards/capes-flotants.md`.
 */
const AppFullScreenDialog = <TValue extends string>({
  open,
  onClose,
  title,
  closeLabel,
  tabs,
  activeTab,
  onTabChange,
  children,
}: AppFullScreenDialogProps<TValue>): ReactElement => (
  <Dialog
    fullScreen
    open={open}
    onClose={onClose}
    slots={{ transition: Transition }}
    // El nom va al `Paper`, que és qui porta `role="dialog"`: a l'arrel del
    // Dialog, el diàleg quedava sense nom per al lector de pantalla
    slotProps={{ paper: { "aria-label": title } }}
  >
    <AppBar sx={appFullScreenAppBar} elevation={1}>
      <Toolbar sx={appFullScreenToolbar}>
        <Typography
          sx={appFullScreenTitle}
          variant="h6"
          component="div"
          fontWeight={800}
        >
          {title}
        </Typography>

        {tabs && (
          // Scrollable perquè en mòbil el tab seleccionat amb text no desbordi
          <Tabs
            value={activeTab}
            onChange={(_, value: TValue) => onTabChange?.(value)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ ...tabsStyled, flex: 1 }}
          >
            {tabs.map(({ value, icon, label }) => (
              <AppTab key={value} value={value} icon={icon} label={label} />
            ))}
          </Tabs>
        )}

        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          aria-label={closeLabel}
        >
          <AiOutlineClose />
        </IconButton>
      </Toolbar>
    </AppBar>

    <Box sx={appFullScreenAppBarSpacer} />

    {children}
  </Dialog>
);

export default AppFullScreenDialog;
