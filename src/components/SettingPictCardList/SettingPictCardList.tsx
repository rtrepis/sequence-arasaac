import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import { AiOutlineSetting } from "react-icons/ai";
import { useAppDispatch } from "../../app/hooks";
import { upDateSettingItemActionCreator } from "../../app/slice/sequenceSlice";
import Settings from "../../model/Settings";
import { UpdateSettingItemI } from "../../types/sequence";
import SettingCard from "../SettingCard/SettingCard";

interface SettingsPictogramProps {
  indexPict: number;
}

const SettingsPictCardList = ({
  indexPict,
}: SettingsPictogramProps): JSX.Element => {
  const dispatch = useAppDispatch();

  const handleUpDateSettingItem = (toUpdate: UpdateSettingItemI) => {
    dispatch(upDateSettingItemActionCreator(toUpdate));
  };

  return (
    <Accordion sx={{ marginBlock: 2 }}>
      <AccordionSummary
        aria-label="Settings"
        sx={{
          ".MuiAccordionSummary-content": {
            fontSize: "2rem",
            margin: 0,
            justifyContent: "center",
          },
        }}
      >
        <AiOutlineSetting />
      </AccordionSummary>
      <AccordionDetails>
        <SettingCard
          item={Settings.skins}
          action={handleUpDateSettingItem}
          indexPict={indexPict}
        />
      </AccordionDetails>
    </Accordion>
  );
};
export default SettingsPictCardList;
