import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  List,
  ListItem,
} from "@mui/material";
import { AiOutlineSetting } from "react-icons/ai";
import { useIntl } from "react-intl";
import { useAppDispatch } from "../../app/hooks";
import { upDateSettingActionCreator } from "../../app/slice/sequenceSlice";
import { UpdateSettingI } from "../../types/sequence";
import SettingCard from "../SettingCard/SettingCard";
import { Settings } from "../SettingCard/SettingCard.lang";
import messages from "./SettingPictCardList.lang";
import { button__setting } from "./SettingPictCardList.styled";

interface SettingsPictogramProps {
  indexPict: number;
}

const SettingsPictCardList = ({
  indexPict,
}: SettingsPictogramProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const handleUpDateSetting = (toUpdate: UpdateSettingI) => {
    dispatch(upDateSettingActionCreator(toUpdate));
  };

  return (
    <Accordion sx={{ marginBlock: 2 }}>
      <AccordionSummary
        aria-label={`${intl.formatMessage({ ...messages.settings })}`}
        sx={button__setting}
      >
        <AiOutlineSetting />
      </AccordionSummary>
      <AccordionDetails>
        <List>
          <ListItem>
            <SettingCard
              setting={Settings.skins}
              action={handleUpDateSetting}
              indexPict={indexPict}
            />
          </ListItem>
        </List>
      </AccordionDetails>
    </Accordion>
  );
};
export default SettingsPictCardList;
