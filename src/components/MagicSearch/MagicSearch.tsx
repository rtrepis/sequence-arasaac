import { ButtonBase, InputAdornment, TextField } from "@mui/material";
import { SyntheticEvent, useState } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import { useIntl } from "react-intl";
import useAraSaac from "../../hooks/useAraSaac";
import messages from "./MagicSearch.lang";
import React from "react";

interface MagicSearchProps {
  variant?: "navBar";
}

const MagicSearch = ({ variant }: MagicSearchProps): React.ReactElement => {
  const intl = useIntl();
  const { getSearchPictogram } = useAraSaac();

  const initialPhrase = "";
  const [phrase, setPhrase] = useState(initialPhrase);

  const SubmitMagicEngine = (event: SyntheticEvent) => {
    event.preventDefault();

    const words = stringToWords(phrase);

    delayWords(words);
  };

  const stringToWords = (string: string) => {
    let words = string.split(",", 60);
    words.forEach((word, index, words) => words.splice(index, 1, word.trim()));
    words = words.filter((word) => word !== " ");
    words = words.filter((word) => word !== "");
    return words;
  };

  const delayWords = (words: string[]) => {
    let index = 0;

    const print = () => {
      getSearchPictogram(words[index], index, false);

      index++;

      if (index === words.length || words.length === 0) {
        clearInterval(intervalWord);
        setPhrase("");
      }
    };
    const intervalWord = setInterval(print, 10);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setPhrase(value);
  };

  return (
    <form onSubmit={SubmitMagicEngine}>
      <TextField
        label={intl.formatMessage({ ...messages.field })}
        id={"search"}
        variant="outlined"
        helperText={
          variant !== "navBar" && intl.formatMessage({ ...messages.helperText })
        }
        autoComplete={"off"}
        size="small"
        value={phrase}
        onChange={handleChange}
        InputProps={{
          endAdornment: (
            <InputAdornment
              position="end"
              component={ButtonBase}
              onClick={SubmitMagicEngine}
              aria-label={intl.formatMessage({ ...messages.button })}
            >
              <AiOutlineSearch fontSize={"large"} />
            </InputAdornment>
          ),
        }}
        sx={{ minWidth: 300 }}
      />
    </form>
  );
};

export default MagicSearch;
