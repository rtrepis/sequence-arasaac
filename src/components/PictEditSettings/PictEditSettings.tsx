import { List, ListItem } from "@mui/material";
import { useIntl } from "react-intl";
import { useAppDispatch } from "../../app/hooks";
import { upDateSettingActionCreator } from "../../app/slice/sequenceSlice";
import {
  PictApiAraSettings,
  PictSequenceSettings,
  SettingToUpdate,
} from "../../types/sequence";
import SettingAccordion from "../SettingAccordion/SettingAccordion";
import SettingCard from "../SettingCard/SettingCard";
import { settingsPictApiAra } from "../SettingCard/SettingCard.lang";
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
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const handleUpDateSetting = (toUpdate: SettingToUpdate) => {
    dispatch(
      upDateSettingActionCreator({ indexSequence: indexPict, ...toUpdate })
    );
  };

  return (
    <SettingAccordion title={`${intl.formatMessage({ ...messages.title })}`}>
      <List>
        {pictApiAraSettings.skin && (
          <ListItem>
            <SettingCard
              setting={settingsPictApiAra.skin}
              action={handleUpDateSetting}
              selected={pictApiAraSettings.skin}
            />
          </ListItem>
        )}
      </List>
    </SettingAccordion>
  );
};
export default PictEditSettings;
