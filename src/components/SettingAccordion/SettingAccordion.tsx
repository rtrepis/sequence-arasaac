import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  IconButton,
} from "@mui/material";
import { AiOutlineSetting } from "react-icons/ai";
import {
  settingsContent,
  settingsList,
  settingsListTitle,
  settingsListTitleContent,
} from "./SettingAccordion.styled";
import React from "react";

interface SettingAccordionProps {
  children: React.ReactElement | React.ReactElement[] | undefined;
  title: string;
}

const SettingAccordion = ({
  children,
  title,
}: SettingAccordionProps): React.ReactElement => {
  return (
    <Accordion variant="outlined" sx={settingsList}>
      <AccordionSummary aria-label={`${title}`} sx={settingsListTitle}>
        <IconButton sx={settingsListTitleContent}>
          <AiOutlineSetting />
        </IconButton>
      </AccordionSummary>
      <AccordionDetails sx={settingsContent}>{children}</AccordionDetails>
    </Accordion>
  );
};

export default SettingAccordion;
