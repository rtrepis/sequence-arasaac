import { List } from "@mui/material";
import { useIntl } from "react-intl";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  applyAllSettingPictApiAraActionCreator,
  applyAllSettingPictSequenceActionCreator,
  upDateSettingsPictApiAraActionCreator,
  upDateSettingsPictSequenceActionCreator,
} from "../../app/slice/sequenceSlice";
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
  const defaultSettings = useAppSelector((state) => state.ui.defaultSettings);
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const handleUpDateSettingPictApiAra = (toUpdate: PictApiAraSettings) => {
    const toUpdatePict = {
      indexSequence: indexPict,
      settings: { ...pictApiAraSettings, ...toUpdate },
    };

    dispatch(upDateSettingsPictApiAraActionCreator(toUpdatePict));
  };

  const handleApplyAllPictAraApi = (toUpdate: PictApiAraSettings) => {
    const toUpdatePict = {
      settings: {
        ...pictApiAraSettings,
        ...toUpdate,
      },
    };

    dispatch(applyAllSettingPictApiAraActionCreator(toUpdatePict));
  };

  const handleUpDateSettingPictSequence = (toUpdate: PictSequenceSettings) => {
    const toUpdatePict = {
      indexSequence: indexPict,
      settings: { ...pictSequenceSettings, ...toUpdate },
    };

    dispatch(upDateSettingsPictSequenceActionCreator(toUpdatePict));
  };

  const handleApplyAllPictSequence = (toUpdate: PictSequenceSettings) => {
    const toUpdatePict = {
      settings: { ...pictApiAraSettings, ...toUpdate },
    };

    dispatch(applyAllSettingPictSequenceActionCreator(toUpdatePict));
  };

  return (
    <SettingAccordion title={`${intl.formatMessage({ ...messages.title })}`}>
      <List>
        {pictSequenceSettings.textPosition && (
          <li>
            <SettingCard
              setting="textPosition"
              actionSelected={handleUpDateSettingPictSequence}
              selected={pictSequenceSettings.textPosition}
              defaultSetting={defaultSettings.pictSequence?.textPosition}
              applyAll={handleApplyAllPictSequence}
            />
          </li>
        )}
        {pictApiAraSettings.skin && (
          <li>
            <SettingCard
              setting="skin"
              actionSelected={handleUpDateSettingPictApiAra}
              selected={pictApiAraSettings.skin}
              defaultSetting={defaultSettings.pictApiAra.skin}
              applyAll={handleApplyAllPictAraApi}
            />
          </li>
        )}
      </List>
    </SettingAccordion>
  );
};
export default PictEditSettings;
