import { ButtonBase, InputAdornment, TextField } from "@mui/material";
import { SyntheticEvent, useState } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import { useIntl } from "react-intl";
import useAraSaac from "../../hooks/useAraSaac";
import messages from "./MagicSearch.lang";
import React from "react";
import { useAppSelector } from "/src/app/hooks";
import { settingCardOptions } from "../SettingsCards/SettingCardOptions/lang/SettingCardLang.lang";

interface MagicSearchProps {
  variant?: "navBar";
  info: { value: boolean; setInfoValue?: (value: boolean) => void };
}

const MagicSearch = ({ info }: MagicSearchProps): React.ReactElement => {
  const intl = useIntl();
  const { app: appLang, search: searchLang } = useAppSelector(
    (state) => state.ui.lang,
  );
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

  const languagesSearchTitle =
    appLang !== searchLang
      ? ` (${intl.formatMessage(settingCardOptions.languages[searchLang].message)})`
      : "";

  return (
    <form onSubmit={SubmitMagicEngine} style={{ flexGrow: 1, width: "100%" }}>
      <TextField
        label={`${intl.formatMessage({ ...messages.field })}${languagesSearchTitle}`}
        id={"search"}
        variant="outlined"
        helperText={
          info.value
            ? intl.formatMessage({ ...messages.helperText })
            : intl.formatMessage({ ...messages.sample })
        }
        autoComplete={"off"}
        size="small"
        value={phrase}
        onChange={handleChange}
        slotProps={{
          input: {
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
          },
        }}
        sx={{ width: "100%" }}
      />
    </form>
  );
};

export default MagicSearch;
