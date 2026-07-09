import {
  Autocomplete,
  Box,
  ButtonBase,
  InputAdornment,
  TextField,
} from "@mui/material";
import React, { SyntheticEvent, useRef } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import { useIntl } from "react-intl";
import { useAppSelector } from "@/app/hooks";
import { LANGUAGE_NAMES } from "@shared/constants/languageNames";
import usePersonalKeywords from "@features/word-profile/hooks/usePersonalKeywords";
import { filterByCurrentWord } from "./magicSearchUtils";
import useWordSuggestions from "./useWordSuggestions";
import useSequentialSearch from "./useSequentialSearch";
import TabHint from "./TabHint";
import messages from "./MagicSearch.lang";
import { MagicSearchProps } from "./MagicSearch.types";

const MagicSearch = ({
  showHelperText,
}: MagicSearchProps): React.ReactElement => {
  const intl = useIntl();
  const { app: appLang, search: searchLang } = useAppSelector(
    (state) => state.ui.lang,
  );
  const keywords = usePersonalKeywords();

  const {
    phrase,
    isOpen,
    handleTabKey,
    handleInputChange,
    handleOptionSelect,
    setHighlightedOption,
    closeSuggestions,
    clearPhrase,
  } = useWordSuggestions(keywords);

  const { searchPhrase } = useSequentialSearch(clearPhrase);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = (event: SyntheticEvent) => {
    event.preventDefault();
    searchPhrase(phrase);
  };

  const languagesSearchTitle =
    appLang !== searchLang ? ` (${LANGUAGE_NAMES[searchLang]})` : "";

  return (
    <form onSubmit={handleSubmit} style={{ flexGrow: 1, width: "100%" }}>
      <Box ref={containerRef} sx={{ position: "relative", width: "100%" }}>
        <Autocomplete
          id="search"
          freeSolo
          autoHighlight
          open={isOpen}
          onClose={closeSuggestions}
          onHighlightChange={(_, option) => setHighlightedOption(option)}
          inputValue={phrase}
          onInputChange={handleInputChange}
          onChange={(_, value, reason) =>
            handleOptionSelect(value as string | null, reason)
          }
          options={keywords}
          filterOptions={filterByCurrentWord}
          sx={{ width: "100%" }}
          renderInput={(params) => (
            <TextField
              {...params}
              inputRef={inputRef}
              onKeyDown={handleTabKey}
              label={`${intl.formatMessage({ ...messages.field })}${languagesSearchTitle}`}
              variant="outlined"
              helperText={
                showHelperText
                  ? intl.formatMessage({ ...messages.helperText })
                  : intl.formatMessage({ ...messages.sample })
              }
              size="small"
              slotProps={{
                input: {
                  ...params.InputProps,
                  endAdornment: (
                    <InputAdornment
                      position="end"
                      component={ButtonBase}
                      onClick={handleSubmit}
                      aria-label={intl.formatMessage({ ...messages.button })}
                    >
                      <AiOutlineSearch fontSize={"large"} />
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}
        />
        <TabHint
          phrase={phrase}
          visible={isOpen}
          inputRef={inputRef}
          containerRef={containerRef}
        />
      </Box>
    </form>
  );
};

export default MagicSearch;
