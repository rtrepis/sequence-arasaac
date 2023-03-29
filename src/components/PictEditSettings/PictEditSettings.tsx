import { useIntl } from "react-intl";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { upDateSettingActionCreator } from "../../app/slice/sequenceSlice";
import { SettingToUpdate } from "../../types/sequence";
import SettingAccordion from "../SettingAccordion/SettingAccordion";
import SettingCard from "../SettingCard/SettingCard";
import { Settings } from "../SettingCard/SettingCard.lang";
import messages from "./PictEditSettings.lang";

interface PictEditSettingsProps {
  indexPict: number;
}

const PictEditSettings = ({
  indexPict,
}: PictEditSettingsProps): JSX.Element => {
  const pictSetting = useAppSelector(
    (state) => state.sequence[indexPict].img.settings
  );
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const handleUpDateSetting = (toUpdate: SettingToUpdate) => {
    dispatch(
      upDateSettingActionCreator({ indexSequence: indexPict, ...toUpdate })
    );
  };

  return (
    <SettingAccordion title={`${intl.formatMessage({ ...messages.title })}`}>
      <SettingCard
        setting={Settings.skins}
        action={handleUpDateSetting}
        selected={pictSetting.skin}
      />
    </SettingAccordion>
  );
};
export default PictEditSettings;
