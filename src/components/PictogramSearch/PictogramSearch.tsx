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
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { useAppSelector } from "../../app/hooks";
import useAraSaac from "../../hooks/useAraSaac";
import StyledToggleButtonGroup from "../../style/StyledToogleButtonGroup";

interface PropsPictogramSearch {
  action: (upDatePictNumber: number, word: string) => void;
}

const PictogramSearch = ({ action }: PropsPictogramSearch): JSX.Element => {
  const { skin } = useAppSelector((state) => state.ui.setting);

  const intl = useIntl();
  const { getSearchPictogram } = useAraSaac();

  const initialWord = "";
  const [word, setWord] = useState(initialWord);

  const initialFindPict: number[] = [];
  const [findPict, setFindPict] = useState(initialFindPict);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWord(event.target.value);
  };

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();
    const getPromise = await getSearchPictogram(word);

    getPromise === "Error 404, not found"
      ? setFindPict([-1])
      : setFindPict(getPromise);
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
          label={intl.formatMessage({
            id: "components.pictogramSearch.label",
            defaultMessage: "Search",
            description: "search pictograms",
          })}
          id={"search"}
          variant="outlined"
          helperText={intl.formatMessage({
            id: "components.pictogramSearch.helperText",
            defaultMessage: "Pictogram search engine",
            description: "helper text",
          })}
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
        {findPict[0] !== -1 &&
          findPict.map((pictogram, index) => (
            <ToggleButton
              value={pictogram}
              aria-label={`pictogram`}
              key={pictogram + index}
              onClick={() => action(pictogram, word)}
            >
              <img
                src={`https://api.arasaac.org/api/pictograms/${pictogram}?${
                  skin !== "default" &&
                  `skin=${skin === "asian" ? "assian" : skin}` // asia n corrected api arasaac
                }`}
                alt={`pictogram`}
                width={40}
                height={40}
              />
            </ToggleButton>
          ))}
      </StyledToggleButtonGroup>
      {findPict[0] === -1 && (
        <Alert severity="info" sx={{ maxWidth: 280 }}>
          No pictogram found with this word - Try another word!
        </Alert>
      )}
    </Stack>
  );
};

export default PictogramSearch;
