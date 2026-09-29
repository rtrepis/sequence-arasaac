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
  extractPictCategory,
  extractPictSettings,
} from "../api/arasaacClient";
import {
  selectDocumentPictStyle,
  selectDocumentStyle,
} from "@features/sequence/style/styleSelectors";

const useSearchPictogram = () => {
  const {
    textPosition,
    borderIn: defaultBorderIn,
    borderOut: defaultBorderOut,
    // Els pictogrames nous reben l'estil del document on entren
  } = useAppSelector((state) => selectDocumentPictStyle(state).pictSequence);

  const getActiveSaacAmountPict = (state) =>
    state.document.content[state.document.activeSAAC].length;
  const amountSequence = useAppSelector(getActiveSaacAmountPict);

  const defaultSettingsPictApiAra = useAppSelector(
    (state) => selectDocumentPictStyle(state).pictApiAra,
  );
  // Colors de Fitzgerald de l'estil del document: el pictograma nou pren el de
  // la seva categoria
  const categoryColors = useAppSelector(
    (state) => selectDocumentStyle(state).fitzgeraldColors,
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
          const baseSettings = extractPictSettings(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (data as any[])[0],
            defaultSettingsPictApiAra,
            categoryColors,
          );
          const newPict: PictSequence = {
            indexSequence: amountSequence + indexSequence,
            img: {
              searched: { word: wordAraSaac, bestIdPicts: findBestPict },
              selectedId: profile?.selectedId ?? findBestPict[0],
              settings: { ...baseSettings, ...profile?.overrides },
              ...(profile?.customImageUrl ? { url: profile.customImageUrl } : {}),
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              category: extractPictCategory((data as any[])[0]),
            },
            settings: {
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
              // Sense categoria: el color dels que no en tenen, de l'estil
              settings: {
                fitzgerald: defaultSettingsPictApiAra.fitzgerald,
                ...profile?.overrides,
              },
              ...(profile?.customImageUrl ? { url: profile.customImageUrl } : {}),
              category: "none",
            },
            settings: {
              textPosition,
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
      categoryColors,
      wordProfiles,
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
        const findSettings = extractPictSettings(
          data,
          defaultSettingsPictApiAra,
          categoryColors,
        );

        const category = extractPictCategory(data);

        dispatch(
          settingsPictApiAraActionCreator({
            indexSequence: indexSequence,
            settings: findSettings,
            category,
          }),
        );
        return { settings: findSettings, category };
      } catch {
        console.error("getSettingsPictId ");
      }
    },
    [locale, dispatch, defaultSettingsPictApiAra, categoryColors],
  );

  return {
    getSearchPictogram,
    getSettingsPictId,
  };
};

export default useSearchPictogram;
