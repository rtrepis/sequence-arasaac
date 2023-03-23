import {
  Alert,
  ButtonBase,
  InputAdornment,
  Stack,
  TextField,
  ToggleButton,
} from "@mui/material";
import { SyntheticEvent, useState } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import { FormattedMessage, useIntl } from "react-intl";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { upDatePictNumberActionCreator } from "../../app/slice/sequenceSlice";
import useAraSaac from "../../hooks/useAraSaac";
import StyledToggleButtonGroup from "../../style/StyledToogleButtonGroup";
import { ProtoPictogramI } from "../../types/sequence";
import messages from "./PictogramSearch.lang";
interface PropsPictogramSearch {
  indexPict: number;
}

const PictogramSearch = ({ indexPict }: PropsPictogramSearch): JSX.Element => {
  const {
    skin,
    word: { keyWord, pictograms },
  } = useAppSelector((state) => state.sequence[indexPict]);
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const { getSearchPictogram, toUrlPath: toUrlPathApiAraSaac } = useAraSaac();

  const initialWord =
    keyWord === `${intl.formatMessage({ ...messages.empty })}` ? "" : keyWord;
  const [word, setWord] = useState(initialWord);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWord(event.target.value);
  };

  const handleUpDatePictNumber = (upDateNumber: number) => {
    const upDatePictNum: ProtoPictogramI = {
      index: indexPict,
      number: upDateNumber,
    };
    dispatch(upDatePictNumberActionCreator(upDatePictNum));
  };

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();
    await getSearchPictogram(word, indexPict);
  };

  return (
    <Stack
      sx={{
        maxWidth: 300,
        paddingInlineStart: 2,
        paddingBlockStart: 2,
      }}
    >
      <form onSubmit={handleSubmit}>
        <TextField
          label={intl.formatMessage({ ...messages.search })}
          id={"search"}
          variant="outlined"
          helperText={intl.formatMessage({ ...messages.helperText })}
          InputProps={{
            endAdornment: (
              <InputAdornment
                position="end"
                component={ButtonBase}
                onClick={handleSubmit}
                aria-label={"toSearch"}
              >
                <AiOutlineSearch fontSize={"large"} />
              </InputAdornment>
            ),
          }}
          autoComplete={"off"}
          value={word}
          onChange={handleChange}
          sx={{ width: 290 }}
        />
      </form>
      <StyledToggleButtonGroup>
        {pictograms[0] !== -1 &&
          pictograms.map((pictogram, index) => (
            <ToggleButton
              value={pictogram}
              aria-label={`${intl.formatMessage({
                ...messages.pictogram,
              })}`}
              key={pictogram + index}
              onClick={() => handleUpDatePictNumber(pictogram)}
            >
              <img
                src={toUrlPathApiAraSaac(pictogram, skin)}
                alt={`${intl.formatMessage({ ...messages.pictogram })} ${word}`}
                width={40}
                height={40}
              />
            </ToggleButton>
          ))}
      </StyledToggleButtonGroup>
      {pictograms[0] === -1 && (
        <Alert severity="info" sx={{ maxWidth: 280 }}>
          <FormattedMessage {...messages.alert} />
        </Alert>
      )}
    </Stack>
  );
};

export default PictogramSearch;
