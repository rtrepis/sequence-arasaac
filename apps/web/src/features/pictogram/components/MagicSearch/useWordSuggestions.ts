import { KeyboardEvent, SyntheticEvent, useMemo, useState } from "react";
import {
  currentWord,
  filterByCurrentWord,
  MIN_WORD_LENGTH,
} from "./magicSearchUtils";

// Gestiona l'estat de la frase i els suggeriments de l'autocomplete:
// obertura del desplegable, opció ressaltada i selecció amb la tecla Tab
const useWordSuggestions = (keywords: string[]) => {
  const [phrase, setPhrase] = useState("");
  const [forceClosed, setForceClosed] = useState(false);
  const [highlightedOption, setHighlightedOption] = useState<string | null>(
    null,
  );

  const isOpen = currentWord(phrase).length >= MIN_WORD_LENGTH && !forceClosed;

  // Primera opció filtrada (el que MUI ressalta automàticament amb autoHighlight,
  // però onHighlightChange no notifica el ressaltat "auto" — cal calcular-lo
  // nosaltres per saber què seleccionarà Tab)
  const topSuggestion = useMemo(() => {
    if (!isOpen) return null;
    return filterByCurrentWord(keywords, { inputValue: phrase })[0] ?? null;
  }, [isOpen, keywords, phrase]);

  // Si l'usuari navega manualment (fletxes/ratolí), preval sobre el primer suggeriment
  const suggestionForTab = highlightedOption ?? topSuggestion;

  // Substitueix la paraula actual per la seleccionada i hi afegeix la coma,
  // sense perdre el focus de l'input
  const selectWord = (word: string) => {
    const parts = phrase.split(",");
    parts[parts.length - 1] = ` ${word}`;
    setPhrase(`${parts.join(",")}, `);
    setForceClosed(true);
    setHighlightedOption(null);
  };

  const handleTabKey = (event: KeyboardEvent) => {
    if (event.key !== "Tab") return;

    // Amb un suggeriment ressaltat, Tab el confirma directament (com Retorn)
    if (isOpen && suggestionForTab) {
      event.preventDefault();
      selectWord(suggestionForTab);
      return;
    }

    // Sense suggeriment (cap coincidència o desplegable tancat), Tab afegeix la coma
    if (currentWord(phrase).length === 0) return;
    event.preventDefault();
    setPhrase(`${phrase.trimEnd()}, `);
  };

  const handleInputChange = (
    _: SyntheticEvent,
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

  const handleOptionSelect = (value: string | null, reason: string) => {
    // "createOption" = Enter amb freeSolo sense seleccionar res → el form ho gestiona
    if (reason !== "selectOption" || !value) return;
    selectWord(value);
  };

  const closeSuggestions = () => setForceClosed(true);

  const clearPhrase = () => setPhrase("");

  return {
    phrase,
    isOpen,
    handleTabKey,
    handleInputChange,
    handleOptionSelect,
    setHighlightedOption,
    closeSuggestions,
    clearPhrase,
  };
};

export default useWordSuggestions;
