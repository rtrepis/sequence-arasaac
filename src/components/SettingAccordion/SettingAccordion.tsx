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

interface SettingAccordionProps {
  children: JSX.Element | JSX.Element[];
  title: string;
}

const SettingAccordion = ({
  children,
  title,
}: SettingAccordionProps): JSX.Element => {
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
