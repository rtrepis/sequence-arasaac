import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  searchedActionCreator,
  sortSequenceActionCreator,
  settingsPictApiAraActionCreator,
  addPictogramActionCreator,
} from "../../../app/slice/documentSlice";
import { updateKeywordsActionCreator } from "../../../app/slice/uiSlice";
import { Ai, PictApiAraForEdit, PictSequence } from "../../../types/sequence";
import {
  searchPictogramByWord,
  fetchPictogramData,
  fetchKeywordsForLocale,
  extractPictSettings,
} from "../api/arasaacClient";

const useSearchPictogram = () => {
  const {
    font: { size: fontSize },
    textPosition,
  } = useAppSelector((state) => state.ui.defaultSettings.pictSequence);

  const getActiveSaacAmountPict = (state) =>
    state.document.content[state.document.activeSAAC].length;
  const amountSequence = useAppSelector(getActiveSaacAmountPict);

  const defaultSettingsPictApiAra = useAppSelector(
    (state) => state.ui.defaultSettings.pictApiAra,
  );

  const dispatch = useAppDispatch();
  const locale = useAppSelector((state) => state.ui.lang.search);

  // Cerca pictogrames per paraula i actualitza o afegeix a la seqüència.
  const getSearchPictogram = useCallback(
    async (
      word: string | Ai,
      indexSequence: number,
      isUpdate: boolean,
      isExtends?: boolean,
    ) => {
      const wordAraSaac = typeof word === "string" ? word : word.word;

      try {
        const data = await searchPictogramByWord(wordAraSaac, locale, isExtends);

        const findBestPict: number[] = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (data as any[]).map((pictogram: any) => findBestPict.push(pictogram._id));

        if (isUpdate) {
          const toPictUpdate: PictApiAraForEdit = {
            indexSequence: indexSequence,
            searched: { word: wordAraSaac, bestIdPicts: findBestPict },
          };
          dispatch(searchedActionCreator(toPictUpdate));
        }

        if (!isUpdate) {
          const newPict: PictSequence = {
            indexSequence: amountSequence + indexSequence,
            img: {
              searched: { word: wordAraSaac, bestIdPicts: findBestPict },
              selectedId: findBestPict[0],
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              settings: extractPictSettings((data as any[])[0], defaultSettingsPictApiAra),
            },
            settings: { fontSize, textPosition },
            ...(typeof word === "object" && { text: word.text }),
            cross: false,
          };
          dispatch(addPictogramActionCreator(newPict));
          dispatch(sortSequenceActionCreator());
        }
      } catch {
        if (isUpdate) {
          const toPictNotFound: PictApiAraForEdit = {
            indexSequence: indexSequence,
            searched: { word: wordAraSaac, bestIdPicts: [-1] },
            settings: {},
          };
          dispatch(searchedActionCreator(toPictNotFound));
        }

        if (!isUpdate) {
          const toPictNotFound: PictSequence = {
            indexSequence: amountSequence + indexSequence,
            img: {
              searched: { word: wordAraSaac, bestIdPicts: [0] },
              selectedId: 0,
              settings: { fitzgerald: "#666" },
            },
            settings: { textPosition, fontSize },
            ...(typeof word === "object" && { text: word.text }),
            cross: false,
          };
          dispatch(addPictogramActionCreator(toPictNotFound));
          dispatch(sortSequenceActionCreator());
        }
      }
    },
    [
      locale,
      dispatch,
      amountSequence,
      defaultSettingsPictApiAra,
      fontSize,
      textPosition,
    ],
  );

  // Obté les settings d'un pictograma per ID i actualitza la seqüència.
  const getSettingsPictId = useCallback(
    async (pictogramId: number, indexSequence: number) => {
      try {
        const data = await fetchPictogramData(pictogramId, locale);
        const findSettings = extractPictSettings(data, defaultSettingsPictApiAra);

        dispatch(
          settingsPictApiAraActionCreator({
            indexSequence: indexSequence,
            settings: findSettings,
          }),
        );
        return findSettings;
      } catch {
        console.error("getSettingsPictId ");
      }
    },
    [locale, dispatch, defaultSettingsPictApiAra],
  );

  // Carrega les paraules clau disponibles per a l'idioma de cerca.
  const getAllKeyWordsForLanguages = useCallback(
    async (value?: string) => {
      try {
        const words = await fetchKeywordsForLocale(value ?? locale);
        dispatch(updateKeywordsActionCreator(words));
      } catch {
        console.info("failed fetch keywords ");
      }
    },
    [dispatch, locale],
  );

  return {
    getSearchPictogram,
    getSettingsPictId,
    getAllKeyWordsForLanguages,
  };
};

export default useSearchPictogram;
