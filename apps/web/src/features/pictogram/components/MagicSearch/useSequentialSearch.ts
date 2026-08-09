import { useIntl } from "react-intl";
import { useFeedback } from "@/context/FeedbackContext";
import feedbackMessages from "@/context/FeedbackContext/FeedbackContext.lang";
import { trackEvent } from "@shared/hooks/usePageTracking";
import { Ai } from "@/types/sequence";
import useSearchPictogram from "../../hooks/useSearchPictogram";
import { parseSearchPhrase } from "./magicSearchUtils";

// Interval entre cerques consecutives perquè el progrés es vegi fluid
const SEARCH_INTERVAL_MS = 10;

// Retard abans d'amagar el progrés i mostrar el snackbar de confirmació
const FEEDBACK_DELAY_MS = 300;

// Orquestra la cerca seqüencial de pictogrames: interpreta la frase, llança les
// cerques una a una i mostra el progrés i el snackbar final. onComplete es crida
// quan totes les paraules s'han enviat a cercar
const useSequentialSearch = (onComplete?: () => void) => {
  const intl = useIntl();
  const { getSearchPictogram } = useSearchPictogram();
  const { showProgress, updateProgress, hideProgress, showSnackbar } =
    useFeedback();

  const searchWords = (words: (Ai | string)[]) => {
    if (words.length === 0) return;

    let index = 0;
    const total = words.length;

    showProgress({
      current: 0,
      total,
      message: intl.formatMessage(feedbackMessages.searchLoading),
    });

    const intervalWord = setInterval(() => {
      getSearchPictogram(words[index], index, false);
      index++;
      updateProgress(index);

      if (index === total) {
        clearInterval(intervalWord);
        onComplete?.();

        setTimeout(() => {
          hideProgress();
          showSnackbar({
            message: intl.formatMessage(feedbackMessages.searchComplete, {
              count: total,
            }),
            severity: "success",
          });
        }, FEEDBACK_DELAY_MS);
      }
    }, SEARCH_INTERVAL_MS);
  };

  const searchPhrase = (phrase: string) => {
    const { words, isAi } = parseSearchPhrase(phrase);

    trackEvent({
      event: isAi ? "ia-magic-search" : "magic-search",
      event_category: "Search API",
      event_label: isAi ? "IA Search API" : "Search API",
    });

    searchWords(words);
  };

  return { searchPhrase };
};

export default useSequentialSearch;
