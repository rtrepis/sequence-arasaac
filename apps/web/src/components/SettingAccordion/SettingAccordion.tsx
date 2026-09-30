import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
} from "@mui/material";
import { AiOutlineSetting } from "react-icons/ai";
import {
  settingsContent,
  settingsList,
  settingsListAttached,
  settingsListTitle,
  settingsListTitleContent,
} from "./SettingAccordion.styled";
import React from "react";

interface SettingAccordionProps {
  children: React.ReactElement | React.ReactElement[] | undefined;
  title: string;
  expanded: boolean;
  onChange: (expanded: boolean) => void;
  /** Text que descriu l'estat de la capçalera (la franja «Personalitzat») */
  describedBy?: string;
  /** La capçalera: on va el focus quan la franja de sobre desapareix */
  summaryRef?: React.Ref<HTMLDivElement>;
  /** Hi ha una franja enganxada a sobre: sense marge ni cantonades de dalt */
  attachedAbove?: boolean;
}

const SettingAccordion = ({
  children,
  title,
  expanded,
  onChange,
  describedBy,
  summaryRef,
  attachedAbove = false,
}: SettingAccordionProps): React.ReactElement => {
  return (
    <Accordion
      variant="outlined"
      expanded={expanded}
      onChange={(_, isExpanded) => onChange(isExpanded)}
      sx={attachedAbove ? settingsListAttached : settingsList}
    >
      <AccordionSummary
        ref={summaryRef}
        aria-label={title}
        aria-describedby={describedBy}
        sx={settingsListTitle}
      >
        {/* Decorativa: abans era un `IconButton`, un botó dins d'un altre */}
        <Box component="span" aria-hidden sx={settingsListTitleContent}>
          <AiOutlineSetting />
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={settingsContent}>{children}</AccordionDetails>
    </Accordion>
  );
};

export default SettingAccordion;
