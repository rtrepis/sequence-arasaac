import { List } from "@mui/material";
import { useIntl } from "react-intl";
import { PictApiAraSettings, PictSequenceSettings } from "../../types/sequence";
import SettingAccordion from "../SettingAccordion/SettingAccordion";
import SettingCard from "../SettingCard/SettingCard";
import SettingCardBorder from "../SettingCardBorder/SettingCardBorder";
import messages from "./PictEditSettings.lang";

interface PictEditSettingsProps {
  indexPict: number;
  pictSequenceSettings: PictSequenceSettings;
  pictApiAraSettings: PictApiAraSettings;
}

const PictEditSettings = ({
  indexPict,
  pictSequenceSettings,
  pictApiAraSettings,
}: PictEditSettingsProps): JSX.Element => {
  const intl = useIntl();

  return (
    <SettingAccordion title={`${intl.formatMessage({ ...messages.title })}`}>
      <List>
        {pictSequenceSettings.textPosition && (
          <li>
            <SettingCard
              indexPict={indexPict}
              setting="textPosition"
              selected={pictSequenceSettings.textPosition}
            />
          </li>
        )}
        {pictSequenceSettings.borderOut && (
          <li>
            <SettingCardBorder
              border="borderOut"
              indexPict={indexPict}
              selected={pictSequenceSettings.borderOut!}
            />
          </li>
        )}
        {pictSequenceSettings.borderIn && (
          <li>
            <SettingCardBorder
              border="borderIn"
              indexPict={indexPict}
              selected={pictSequenceSettings.borderIn!}
            />
          </li>
        )}
        {pictApiAraSettings.skin && (
          <li>
            <SettingCard
              setting="skin"
              indexPict={indexPict}
              selected={pictApiAraSettings.skin}
            />
          </li>
        )}
      </List>
    </SettingAccordion>
  );
};
export default PictEditSettings;
