import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  IconButton,
} from "@mui/material";
import { AiOutlineSetting } from "react-icons/ai";
import { useIntl } from "react-intl";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { upDateSettingActionCreator } from "../../app/slice/sequenceSlice";
import { UpdateSettingI } from "../../types/sequence";
import SettingCard from "../SettingCard/SettingCard";
import { Settings } from "../SettingCard/SettingCard.lang";
import messages from "./PictSettingCardList.lang";
import {
  cardList,
  cardListContent,
  cardListTitle,
  cardListTitleContent,
} from "./PictSettingCardList.styled";

interface SettingsPictogramProps {
  indexPict: number;
}

const SettingsPictCardList = ({
  indexPict,
}: SettingsPictogramProps): JSX.Element => {
  const pictSetting = useAppSelector((state) => state.sequence[indexPict]);
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const handleUpDateSetting = (toUpdate: UpdateSettingI) => {
    dispatch(upDateSettingActionCreator({ index: indexPict, ...toUpdate }));
  };

  return (
    <Accordion variant="outlined" sx={cardList}>
      <AccordionSummary
        aria-label={`${intl.formatMessage({ ...messages.settings })}`}
        sx={cardListTitle}
      >
        <IconButton sx={cardListTitleContent}>
          <AiOutlineSetting />
        </IconButton>
      </AccordionSummary>
      <AccordionDetails sx={cardListContent}>
        <SettingCard
          setting={Settings.skins}
          action={handleUpDateSetting}
          selected={pictSetting.skin}
        />
      </AccordionDetails>
    </Accordion>
  );
};
export default SettingsPictCardList;
