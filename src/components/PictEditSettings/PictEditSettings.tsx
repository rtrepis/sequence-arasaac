import { List } from "@mui/material";
import { useIntl } from "react-intl";
import { PictApiAraSettings, PictSequenceSettings } from "../../types/sequence";
import SettingAccordion from "../SettingAccordion/SettingAccordion";
import SettingCard from "../SettingCard/SettingCard";
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
              setting="textPosition"
              indexPict={indexPict}
              selected={pictSequenceSettings.textPosition}
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
