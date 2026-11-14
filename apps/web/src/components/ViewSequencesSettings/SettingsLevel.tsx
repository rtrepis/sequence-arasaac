import React from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Stack,
  Typography,
} from "@mui/material";
import { MdExpandMore } from "react-icons/md";
import { SETTINGS_ROW_GAP } from "@/components/SettingsLayout";

/** Costat de la icona del nivell, en px: la línia de la cascada en passa pel mig. */
export const LEVEL_ICON_PX = 30;

/** Marge de dins de la targeta d'un nivell, en unitats del tema. */
// Al mòbil, el marge de les targetes és petit: s'hi guanya amplada
const LEVEL_PADDING = { xs: 1, md: 1.5 };

interface SettingsLevelProps {
  id: string;
  icon: React.ReactNode;
  /** Quin nivell és: «Document», «Pàgina», «Bloc» */
  kind: React.ReactNode;
  /** El nom: el títol del document, «Pàgina 2 de 3», el nom del bloc */
  title: React.ReactNode;
  /** A què s'aplica: «A totes les pàgines», «Només a aquesta pàgina» */
  scope: React.ReactNode;
  /** El resum que es veu amb el nivell plegat, en lloc de l'abast */
  summary?: React.ReactNode;
  /** Sense `children`, el nivell no es plega: és només la capçalera */
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  children?: React.ReactNode;
}

/** La capçalera d'un nivell: la icona, el tipus, el nom i l'abast. */
const LevelHead = ({
  icon,
  kind,
  title,
  line,
}: {
  icon: React.ReactNode;
  kind: React.ReactNode;
  title: React.ReactNode;
  line: React.ReactNode;
}): React.ReactElement => (
  <Stack direction="row" gap={1} alignItems="flex-start" sx={{ minWidth: 0 }}>
    <Box
      aria-hidden
      sx={{
        width: LEVEL_ICON_PX,
        height: LEVEL_ICON_PX,
        flexShrink: 0,
        display: "grid",
        placeItems: "center",
        borderRadius: 1,
        fontSize: 18,
        color: "text.secondary",
        backgroundColor: "background.paper",
      }}
    >
      {icon}
    </Box>
    <Stack sx={{ minWidth: 0 }}>
      <Typography
        component="span"
        variant="overline"
        color="text.secondary"
        sx={{ lineHeight: 1.4 }}
      >
        {kind}
      </Typography>
      <Typography
        component="span"
        variant="subtitle1"
        fontWeight="bold"
        sx={{ lineHeight: 1.3, overflowWrap: "anywhere" }}
      >
        {title}
      </Typography>
      <Typography component="span" variant="caption" color="text.secondary">
        {line}
      </Typography>
    </Stack>
  </Stack>
);

/**
 * Un nivell de la columna de la vista (R8: Document, Pàgina, Bloc), del més
 * ample al més concret, com a l'esbós (`docs/esbos-columna-vista.html`): una
 * targeta amb la icona, el tipus de nivell, el nom i la línia que diu a què
 * s'aplica (o, plegat, el resum). A dins, les seccions de sempre
 * (`SectionTitle`) i les files (`SettingRow`).
 *
 * És l'única excepció a «una zona no es marca amb una caixa» de l'estàndard de
 * configuracions: els tres nivells han de llegir-se com tres coses diferents,
 * lligades per la línia de la cascada (`SettingsLevels`). A prova: si
 * funciona, passarà a l'estàndard.
 */
const SettingsLevel = ({
  id,
  icon,
  kind,
  title,
  scope,
  summary,
  expanded = true,
  onExpandedChange,
  children,
}: SettingsLevelProps): React.ReactElement => {
  const cardSx = {
    position: "relative",
    backgroundColor: "background.default",
    border: 1,
    borderColor: "divider",
    borderRadius: 2,
    scrollMarginTop: (theme: { spacing: (n: number) => string }) =>
      theme.spacing(6),
  } as const;

  // Sense ajustos (el bloc quan no n'hi ha cap de seleccionat): només la capçalera
  if (!children)
    return (
      <Box id={id} sx={{ ...cardSx, padding: LEVEL_PADDING }}>
        <LevelHead icon={icon} kind={kind} title={title} line={scope} />
      </Box>
    );

  return (
    <Accordion
      id={id}
      expanded={expanded}
      onChange={(_, isExpanded) => onExpandedChange?.(isExpanded)}
      disableGutters
      elevation={0}
      sx={{ ...cardSx, "&:before": { display: "none" } }}
      slotProps={{ heading: { component: "h2" } }}
    >
      <AccordionSummary
        expandIcon={<MdExpandMore />}
        aria-controls={`${id}-content`}
        id={`${id}-header`}
        sx={{
          paddingInline: LEVEL_PADDING,
          alignItems: "flex-start",
          "& .MuiAccordionSummary-content": { minWidth: 0 },
        }}
      >
        <LevelHead
          icon={icon}
          kind={kind}
          title={title}
          line={expanded || !summary ? scope : summary}
        />
      </AccordionSummary>
      <AccordionDetails
        id={`${id}-content`}
        sx={{ paddingInline: LEVEL_PADDING, paddingTop: 0 }}
      >
        <Stack spacing={SETTINGS_ROW_GAP}>{children}</Stack>
      </AccordionDetails>
    </Accordion>
  );
};

/**
 * Els nivells, un sota l'altre, amb la línia de la cascada a l'esquerra, que
 * passa per les icones i els lliga del més ample al més concret.
 */
export const SettingsLevels = ({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement => (
  <Stack
    gap={1.5}
    sx={{
      position: "relative",
      // Pel mig de les icones: el marge de la targeta, la vora i mitja icona
      "&::before": (theme) => ({
        content: '""',
        position: "absolute",
        left: `calc(${theme.spacing(LEVEL_PADDING.xs)} + 1px + ${LEVEL_ICON_PX / 2 - 1}px)`,
        [theme.breakpoints.up("md")]: {
          left: `calc(${theme.spacing(LEVEL_PADDING.md)} + 1px + ${LEVEL_ICON_PX / 2 - 1}px)`,
        },
        top: 24,
        bottom: 24,
        width: 2,
        backgroundColor: theme.palette.divider,
      }),
    }}
  >
    {children}
  </Stack>
);

export default SettingsLevel;
