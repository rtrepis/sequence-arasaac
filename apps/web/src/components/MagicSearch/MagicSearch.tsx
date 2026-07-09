import {
  Autocomplete,
  Box,
  ButtonBase,
  Chip,
  InputAdornment,
  TextField,
} from "@mui/material";
import { createFilterOptions } from "@mui/material/Autocomplete";
import {
  SyntheticEvent,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import usePersonalKeywords from "@features/word-profile/hooks/usePersonalKeywords";

const baseFilterOptions = createFilterOptions<string>({
  matchFrom: "start",
  limit: 100,
});

// Extreu la paraula que s'està escrivint ara (la de després de l'última coma)
const currentWord = (phrase: string) => phrase.split(",").at(-1)?.trim() ?? "";

// Filtra les keywords per la paraula actual, ignorant el prefix de la frase
// getOptionLabel és opcional perquè l'Autocomplete el proporciona automàticament,
// però cal indicar-lo quan es crida aquesta funció manualment fora de l'Autocomplete
const filterByCurrentWord = (
  options: string[],
  state: { inputValue: string; getOptionLabel?: (option: string) => string },
): string[] => {
  const word = currentWord(state.inputValue);
  if (word.length < 3) return [];
  return baseFilterOptions(options, {
    ...state,
    inputValue: word,
    getOptionLabel: state.getOptionLabel ?? ((option: string) => option),
  });
};

interface MagicSearchProps {
  variant?: "navBar";
  info: { value: boolean; setInfoValue?: (value: boolean) => void };
}

const MagicSearch = ({ info }: MagicSearchProps): React.ReactElement => {
  const intl = useIntl();
  const { app: appLang, search: searchLang } = useAppSelector(
    (state) => state.ui.lang,
  );
  const keywords = usePersonalKeywords();
  const arasaacKeywords = useAppSelector((state) => state.ui.lang.keywords);
  const { getSearchPictogram, getAllKeyWordsForLanguages } =
    useSearchPictogram();
  const { showProgress, updateProgress, hideProgress, showSnackbar } =
    useFeedback();

  useEffect(() => {
    if (arasaacKeywords.length === 0) getAllKeyWordsForLanguages();
  }, []);

  const [phrase, setPhrase] = useState("");
  const [forceClosed, setForceClosed] = useState(false);
  const [highlightedOption, setHighlightedOption] = useState<string | null>(
    null,
  );

  const isOpen = currentWord(phrase).length >= 3 && !forceClosed;
  // El tag "Tab" ha de veure's exactament igual que el desplegable: no cal mostrar-lo
  // abans de les 3 lletres, ja que el desplegable tampoc s'obre fins llavors
  const showTabHint = isOpen;

  // Primera opció filtrada (el que MUI ressalta automàticament amb autoHighlight, però onHighlightChange
  // no notifica el ressaltat "auto" — cal calcular-lo nosaltres per saber què seleccionarà Tab)
  const topSuggestion = useMemo(() => {
    if (!isOpen) return null;
    return filterByCurrentWord(keywords, { inputValue: phrase })[0] ?? null;
  }, [isOpen, keywords, phrase]);
  // Si l'usuari navega manualment (fletxes/ratolí), preval sobre el primer suggeriment
  const suggestionForTab = highlightedOption ?? topSuggestion;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const mirrorRef = useRef<HTMLSpanElement | null>(null);
  const [tagLeft, setTagLeft] = useState(14);

  // Separació entre el final del text i el tag, perquè no quedin enganxats
  const TAG_GAP = 20;

  // Recalcula la posició del tag perquè segueixi les lletres escrites, sense envair la icona de cerca.
  // Copiem la lletra (mida, gruix, família) de l'input real al mirall: si no coincideixen exactament,
  // l'amplada mesurada queda per sota de l'amplada real i el tag acaba tapant les últimes lletres.
  useLayoutEffect(() => {
    if (!mirrorRef.current || !inputRef.current) return;
    const inputStyle = window.getComputedStyle(inputRef.current);
    mirrorRef.current.style.font = inputStyle.font;
    mirrorRef.current.style.letterSpacing = inputStyle.letterSpacing;
    const paddingLeft = parseFloat(inputStyle.paddingLeft) || 0;
    const textWidth = mirrorRef.current.offsetWidth;
    const containerWidth = containerRef.current?.offsetWidth ?? 0;
    const maxLeft =
      containerWidth > 0
        ? containerWidth - 90
        : paddingLeft + textWidth + TAG_GAP;
    setTagLeft(
      Math.min(
        paddingLeft + textWidth + TAG_GAP,
        Math.max(maxLeft, paddingLeft),
      ),
    );
  }, [phrase]);

  // Selecciona la paraula ressaltada del desplegable i hi afegeix la coma, sense perdre el focus de l'input
  const selectHighlightedWord = (word: string) => {
    const parts = phrase.split(",");
    parts[parts.length - 1] = ` ${word}`;
    setPhrase(`${parts.join(",")}, `);
    setForceClosed(true);
    setHighlightedOption(null);
  };

  const handleTabKey = (event: React.KeyboardEvent) => {
    if (event.key !== "Tab") return;

    if (isOpen) {
      // Amb el desplegable obert, Tab confirma directament el suggeriment ressaltat (com Retorn)
      if (!suggestionForTab) return;
      event.preventDefault();
      selectHighlightedWord(suggestionForTab);
      return;
    }

    if (currentWord(phrase).length === 0) return;
    event.preventDefault();
    setPhrase(`${phrase.trimEnd()}, `);
  };

  const handleInputChange = (
    _: React.SyntheticEvent,
    value: string,
    reason: string,
  ) => {
    // "reset" vol dir que onChange ja ha actualitzat la frase — no sobreescriure
    if (reason === "reset") return;
    setPhrase(value);
    setForceClosed(false);
    // Cada nova lletra invalida la navegació manual anterior; tornem a confiar en el primer suggeriment
    setHighlightedOption(null);
  };

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

  const languagesSearchTitle =
    appLang !== searchLang
      ? ` (${settingCardOptions.languages[searchLang]})`
      : "";

  return (
    <form onSubmit={SubmitMagicEngine} style={{ flexGrow: 1, width: "100%" }}>
      <Box ref={containerRef} sx={{ position: "relative", width: "100%" }}>
        <Autocomplete
          freeSolo
          autoHighlight
          open={isOpen}
          onClose={() => setForceClosed(true)}
          onHighlightChange={(_, option) => setHighlightedOption(option)}
          inputValue={phrase}
          onInputChange={handleInputChange}
          onChange={(_, value, reason) => {
            // "createOption" = Enter amb freeSolo sense seleccionar res → el form ho gestiona
            if (reason !== "selectOption") return;
            if (value) {
              selectHighlightedWord(value as string);
            }
          }}
          options={keywords}
          filterOptions={filterByCurrentWord}
          sx={{ width: "100%" }}
          renderInput={(params) => (
            <TextField
              {...params}
              inputRef={inputRef}
              onKeyDown={handleTabKey}
              label={`${intl.formatMessage({ ...messages.field })}${languagesSearchTitle}`}
              id="search"
              variant="outlined"
              helperText={
                info.value
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
                      onClick={SubmitMagicEngine}
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
        {/* Mirall invisible per mesurar l'amplada del text i posicionar el tag "Tab" seguint les lletres */}
        <Box
          ref={mirrorRef}
          aria-hidden="true"
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            visibility: "hidden",
            whiteSpace: "pre",
          }}
        >
          {phrase}
        </Box>
        {showTabHint && (
          <Chip
            label="Tab"
            size="small"
            variant="outlined"
            color="default"
            aria-hidden="true"
            sx={{
              position: "absolute",
              top: 9,
              left: tagLeft,
              pointerEvents: "none",
              backgroundColor: "background.paper",
              opacity: 0.3,
            }}
          />
        )}
      </Box>
    </form>
  );
};

export default MagicSearch;
