import { ButtonBase, InputAdornment, TextField } from "@mui/material";
import { SyntheticEvent, useState } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import { useIntl } from "react-intl";
import useSearchPictogram from "../../features/pictogram/hooks/useSearchPictogram";
import { Ai } from "../../types/sequence";
import messages from "./MagicSearch.lang";
import React from "react";
import { useAppSelector } from "@/app/hooks";
import { settingCardOptions } from "../SettingsCards/SettingCardOptions/lang/SettingCardLang.lang";
import { trackEvent } from "@shared/hooks/usePageTracking";
import { useFeedback } from "@/context/FeedbackContext";
import feedbackMessages from "@/context/FeedbackContext/FeedbackContext.lang";

interface MagicSearchProps {
  variant?: "navBar";
  info: { value: boolean; setInfoValue?: (value: boolean) => void };
}

const MagicSearch = ({ info }: MagicSearchProps): React.ReactElement => {
  const intl = useIntl();
  const { app: appLang, search: searchLang } = useAppSelector(
    (state) => state.ui.lang,
  );
  const { getSearchPictogram } = useSearchPictogram();
  const { showProgress, updateProgress, hideProgress, showSnackbar } =
    useFeedback();

  const initialPhrase = "";
  const [phrase, setPhrase] = useState(initialPhrase);

  const SubmitMagicEngine = (event: SyntheticEvent) => {
    event.preventDefault();

    let words: (Ai | string)[] = [""];
    try {
      const iaParse = JSON.parse(phrase);
      if (iaParse !== null && "ia" in iaParse) {
        words = iaParse.ia;

        trackEvent({
          event: "ia-magic-search",
          event_category: "Search API",
          event_label: "IA Search API",
        });
      }
    } catch {
      words = stringToWords(phrase);

      trackEvent({
        event: "magic-search",
        event_category: "Search API",
        event_label: "Search API",
      });
    }

    delayWords(words);
  };

  const stringToWords = (string: string) => {
    let words = string.split(",", 60);
    words.forEach((word, index, words) => words.splice(index, 1, word.trim()));
    words = words.filter((word) => word !== " ");
    words = words.filter((word) => word !== "");
    return words;
  };

  const delayWords = (words: (Ai | string)[]) => {
    // Si no hi ha paraules, no fem res
    if (words.length === 0 || (words.length === 1 && words[0] === "")) {
      return;
    }

    let index = 0;
    const total = words.length;

    // Mostrem la barra de progrés
    showProgress({
      current: 0,
      total,
      message: intl.formatMessage(feedbackMessages.searchLoading),
    });

    const print = () => {
      getSearchPictogram(words[index], index, false);

      index++;
      updateProgress(index);

      if (index === total) {
        clearInterval(intervalWord);
        setPhrase("");

        // Amaguem el progrés i mostrem el snackbar de confirmació
        setTimeout(() => {
          hideProgress();
          showSnackbar({
            message: intl.formatMessage(feedbackMessages.searchComplete, {
              count: total,
            }),
            severity: "success",
          });
        }, 300);
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
      ? ` (${settingCardOptions.languages[searchLang]})`
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
