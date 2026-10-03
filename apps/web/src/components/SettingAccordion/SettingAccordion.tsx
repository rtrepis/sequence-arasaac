import {
  Accordion,
  AccordionDetails,
  Box,
  ButtonBase,
  Typography,
} from "@mui/material";
import { MdExpandMore } from "react-icons/md";
import React, { useId } from "react";
import {
  settingsContent,
  settingsHeaderAction,
  settingsHeaderButton,
  settingsHeaderChevron,
  settingsHeaderIcon,
  settingsHeaderRow,
  settingsList,
} from "./SettingAccordion.styled";

interface SettingAccordionProps {
  children: React.ReactElement | React.ReactElement[] | undefined;
  /** Diu què s'obre: va visible a la capçalera i fa de nom del botó */
  title: string;
  /** Segona línia del títol, més petita */
  subtitle?: string;
  /** Icona entre la fletxa i el títol */
  icon?: React.ReactNode;
  /**
   * Acció pròpia de la capçalera (el «Restableix» del pictograma). Va al
   * costat del botó que desplega i **mai** a dins: un botó dins d'un altre no
   * es pot clicar ni llegir.
   */
  action?: React.ReactNode;
  expanded: boolean;
  onChange: (expanded: boolean) => void;
  /** El botó que desplega: on va el focus quan l'acció desapareix */
  summaryRef?: React.Ref<HTMLButtonElement>;
}

const SettingAccordion = ({
  children,
  title,
  subtitle,
  icon,
  action,
  expanded,
  onChange,
  summaryRef,
}: SettingAccordionProps): React.ReactElement => {
  const headerId = useId();
  const panelId = useId();
  const titleId = useId();
  const subtitleId = useId();

  return (
    // La capçalera no és l'`AccordionSummary` de MUI, que és un botó sencer i
    // no podria portar l'acció a dins. El `heading` passa a `div` perquè el
    // nom de l'encapçalament no s'endugui també el de l'acció
    <Accordion
      variant="outlined"
      expanded={expanded}
      sx={settingsList}
      slots={{ heading: "div" }}
    >
      {/* MUI pren el primer fill com a capçalera i en llegeix `id` i
          `aria-controls` per lligar-hi la zona que es desplega */}
      <Box
        id={headerId}
        aria-controls={panelId}
        data-testid="setting-accordion-header"
        sx={settingsHeaderRow}
      >
        {/* El nom del botó és el títol i prou: amb el subtítol a dins, el
            lector llegiria les dues línies seguides, sense pausa ni espai */}
        <ButtonBase
          ref={summaryRef}
          aria-expanded={expanded}
          aria-controls={panelId}
          aria-labelledby={titleId}
          aria-describedby={subtitle ? subtitleId : undefined}
          onClick={() => onChange(!expanded)}
          sx={settingsHeaderButton}
        >
          <Box
            component="span"
            aria-hidden
            sx={settingsHeaderChevron(expanded)}
          >
            <MdExpandMore />
          </Box>
          {icon && (
            <Box component="span" aria-hidden sx={settingsHeaderIcon}>
              {icon}
            </Box>
          )}
          <Box component="span" sx={{ minWidth: 0 }}>
            <Typography
              id={titleId}
              component="span"
              display="block"
              variant="body2"
              fontWeight="bold"
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography
                id={subtitleId}
                component="span"
                display="block"
                variant="caption"
                color="text.secondary"
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </ButtonBase>
        <Box sx={settingsHeaderAction}>{action}</Box>
      </Box>
      <AccordionDetails sx={settingsContent}>{children}</AccordionDetails>
    </Accordion>
  );
};

export default SettingAccordion;
