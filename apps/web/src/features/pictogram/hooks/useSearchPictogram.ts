import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  searchedActionCreator,
  sortSequenceActionCreator,
  settingsPictApiAraActionCreator,
  addPictogramActionCreator,
} from "@features/sequence/store/documentSlice";
import { Ai, PictApiAraForEdit, PictSequence } from "../../../types/sequence";
import {
  searchPictogramByWord,
  fetchPictogramData,
  extractPictSettings,
} from "../api/arasaacClient";

const useSearchPictogram = () => {
  const {
    font: { size: fontSize },
    textPosition,
    borderIn: defaultBorderIn,
    borderOut: defaultBorderOut,
  } = useAppSelector((state) => state.ui.defaultSettings.pictSequence);

  const getActiveSaacAmountPict = (state) =>
    state.document.content[state.document.activeSAAC].length;
  const amountSequence = useAppSelector(getActiveSaacAmountPict);

  const defaultSettingsPictApiAra = useAppSelector(
    (state) => state.ui.defaultSettings.pictApiAra,
  );

  const wordProfiles = useAppSelector((state) => state.ui.wordProfiles);

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

      // Perfil personal per a aquesta paraula (cerca insensible a majúscules)
      const profile = wordProfiles.find(
        (p) => p.word.toLowerCase() === wordAraSaac.toLowerCase(),
      );

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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const baseSettings = extractPictSettings((data as any[])[0], defaultSettingsPictApiAra);
          const newPict: PictSequence = {
            indexSequence: amountSequence + indexSequence,
            img: {
              searched: { word: wordAraSaac, bestIdPicts: findBestPict },
              selectedId: profile?.selectedId ?? findBestPict[0],
              settings: { ...baseSettings, ...profile?.overrides },
              ...(profile?.customImageUrl ? { url: profile.customImageUrl } : {}),
            },
            settings: {
              fontSize,
              textPosition,
              borderIn: defaultBorderIn,
              borderOut: defaultBorderOut,
            },
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
              selectedId: profile?.selectedId ?? 0,
              settings: { fitzgerald: "#666", ...profile?.overrides },
              ...(profile?.customImageUrl ? { url: profile.customImageUrl } : {}),
            },
            settings: {
              textPosition,
              fontSize,
              borderIn: defaultBorderIn,
              borderOut: defaultBorderOut,
            },
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
      wordProfiles,
      fontSize,
      textPosition,
      defaultBorderIn,
      defaultBorderOut,
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

  return {
    getSearchPictogram,
    getSettingsPictId,
  };
};

export default useSearchPictogram;
