import { List } from "@mui/material";
import { useIntl } from "react-intl";
import { useAppSelector } from "../../app/hooks";
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
  const defaultSettings = useAppSelector((state) => state.ui.defaultSettings);
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
              defaultSetting={defaultSettings.pictSequence.textPosition}
            />
          </li>
        )}
        {pictSequenceSettings.borderOut && (
          <li>
            <SettingCardBorder
              border="borderOut"
              indexPict={indexPict}
              selected={pictSequenceSettings.borderOut!}
              defaultSetting={defaultSettings.pictSequence}
            />
          </li>
        )}
        {pictSequenceSettings.borderIn && (
          <li>
            <SettingCardBorder
              border="borderIn"
              indexPict={indexPict}
              selected={pictSequenceSettings.borderIn!}
              defaultSetting={defaultSettings.pictSequence}
            />
          </li>
        )}
        {pictApiAraSettings.skin && (
          <li>
            <SettingCard
              setting="skin"
              indexPict={indexPict}
              selected={pictApiAraSettings.skin}
              defaultSetting={defaultSettings.pictApiAra.skin}
            />
          </li>
        )}
      </List>
    </SettingAccordion>
  );
};
export default PictEditSettings;
