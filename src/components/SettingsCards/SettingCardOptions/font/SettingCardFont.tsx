import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
} from "@mui/material";
import { FormattedMessage } from "react-intl";
import { card, cardAction } from "../SettingCardOptions.styled";
import { settingCardOptions } from "./SettingCardFont.lang";
import { fontList } from "../../../../data/fontlist";
import ApplyAll from "../../ApplyAll/ApplyAll";
import { FontFamily } from "../../../../types/FontFamily";
import { pictSequenceApplyAllActionCreator } from "../../../../app/slice/sequenceSlice";
import { useDispatch } from "react-redux";

interface SettingCardProps {
  setting: "fontFamily";
  state: string;
  setState: any;
}

const SettingCardFont = ({
  setting,
  state,
  setState,
}: SettingCardProps): JSX.Element => {
  const dispatch = useDispatch();
  const settingCard = {
    messages: settingCardOptions.messages[setting],
  };

  const handleChange = (event: SelectChangeEvent) => {
    setState(event.target.value as string);
  };

  const handleApplyAll = (toUpdate: string) => {
    dispatch(
      pictSequenceApplyAllActionCreator({
        fontFamily: toUpdate as FontFamily,
      })
    );
  };

  return (
    <Stack
      display={"flex"}
      direction={"row"}
      flexWrap={"wrap"}
      columnGap={2}
      sx={card}
    >
      <FormControl fullWidth>
        <InputLabel id="fontFamily">
          <FormattedMessage {...settingCard.messages} />
        </InputLabel>
        <Select
          labelId="fontFamily"
          id="language-selected"
          value={state}
          label="fontFamily"
          onChange={handleChange}
          sx={{ width: 200 }}
        >
          {fontList.map((font) => (
            <MenuItem value={font} key={font}>
              <Typography fontFamily={font}>{font}</Typography>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {state && (
        <ApplyAll sx={cardAction} onClick={() => handleApplyAll(state)} />
      )}
    </Stack>
  );
};

export default SettingCardFont;
