import React from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Stack,
  Typography,
} from "@mui/material";
import { MdExpandMore } from "react-icons/md";
import {
  SETTINGS_ROW_GAP,
  settingsAccordion,
} from "@/components/SettingsLayout";

interface SettingsLevelProps {
  id: string;
  /** «Document», «Pàgina 2 de 3», el nom del bloc */
  title: React.ReactNode;
  /** A què s'aplica: «A totes les pàgines», «Només a la pàgina 2» */
  scope: React.ReactNode;
  /** El resum que es veu amb el nivell plegat, en lloc de l'abast */
  summary?: React.ReactNode;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  children: React.ReactNode;
}

/**
 * Un nivell de la columna de la vista (R8: Document, Pàgina, Bloc), del més
 * ample al més concret. És un acordió pla (`settingsAccordion`): el títol en
 * negreta, a sota la línia que diu a què s'aplica (o, plegat, el resum) i,
 * a dins, les seccions de sempre (`SectionTitle`). Com a la resta de
 * configuracions, només la fletxa el distingeix: cap caixa.
 *
 * De moment és una peça de la columna de la vista; si funciona, passarà a
 * l'estàndard (`docs/estandards/configuracions.md`).
 */
const SettingsLevel = ({
  id,
  title,
  scope,
  summary,
  expanded,
  onExpandedChange,
  children,
}: SettingsLevelProps): React.ReactElement => (
  <Accordion
    id={id}
    expanded={expanded}
    onChange={(_, isExpanded) => onExpandedChange(isExpanded)}
    disableGutters
    elevation={0}
    sx={{ ...settingsAccordion, scrollMarginTop: (theme) => theme.spacing(6) }}
    slotProps={{ heading: { component: "h2" } }}
  >
    <AccordionSummary
      expandIcon={<MdExpandMore />}
      aria-controls={`${id}-content`}
      id={`${id}-header`}
      sx={{ px: 0 }}
    >
      <Stack sx={{ minWidth: 0 }}>
        <Typography
          component="span"
          variant="h6"
          fontWeight="bold"
          sx={{ overflowWrap: "anywhere" }}
        >
          {title}
        </Typography>
        <Typography component="span" variant="caption" color="text.secondary">
          {expanded || !summary ? scope : summary}
        </Typography>
      </Stack>
    </AccordionSummary>
    <AccordionDetails id={`${id}-content`} sx={{ px: 0, pt: 0 }}>
      <Stack spacing={SETTINGS_ROW_GAP}>{children}</Stack>
    </AccordionDetails>
  </Accordion>
);

export default SettingsLevel;
