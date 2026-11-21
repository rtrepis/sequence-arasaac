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
  extractPictVariants,
} from "../api/arasaacClient";
import {
  selectActiveSequenceCardDefaults,
  selectActiveSequencePictStyle,
  selectActiveSequenceStyle,
} from "@features/sequence/style/styleSelectors";
import { stripInherited } from "@features/sequence/style/pictogramStyle";

const useSearchPictogram = () => {
  // L'estil que hereten els pictogrames nous (el de la seqüència activa, o el
  // del document): no se'ls copia (solució A), però el vocabulari personal
  // només hi deixa un retoc si en canvia alguna cosa
  const inherited = useAppSelector(selectActiveSequenceCardDefaults);

  const getActiveSaacAmountPict = (state) =>
    state.document.content[state.document.activeSAAC].length;
  const amountSequence = useAppSelector(getActiveSaacAmountPict);

  const defaultSettingsPictApiAra = useAppSelector(
    (state) => selectActiveSequencePictStyle(state).pictApiAra,
  );
  // Colors de Fitzgerald de l'estil de la seqüència: el pictograma nou pren el
  // de la seva categoria
  const categoryColors = useAppSelector(
    (state) => selectActiveSequenceStyle(state).fitzgeraldColors,
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
          const newPict: PictSequence = stripInherited(
            {
              indexSequence: amountSequence + indexSequence,
              img: {
                searched: { word: wordAraSaac, bestIdPicts: findBestPict },
                selectedId: profile?.selectedId ?? findBestPict[0],
                // Només el vocabulari personal hi pot posar retocs (D5)
                settings: { ...profile?.overrides },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                variants: extractPictVariants((data as any[])[0]),
                ...(profile?.customImageUrl
                  ? { url: profile.customImageUrl }
                  : {}),
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                category: extractPictCategory((data as any[])[0]),
              },
              settings: {},
              ...(typeof word === "object" && { text: word.text }),
              cross: false,
            },
            inherited,
          );
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
          // Sense categoria: el color dels que no en tenen, de l'estil
          const toPictNotFound: PictSequence = stripInherited(
            {
              indexSequence: amountSequence + indexSequence,
              img: {
                searched: { word: wordAraSaac, bestIdPicts: [0] },
                selectedId: profile?.selectedId ?? 0,
                settings: { ...profile?.overrides },
                ...(profile?.customImageUrl
                  ? { url: profile.customImageUrl }
                  : {}),
                category: "none",
              },
              settings: {},
              ...(typeof word === "object" && { text: word.text }),
              cross: false,
            },
            inherited,
          );
          dispatch(addPictogramActionCreator(toPictNotFound));
          dispatch(sortSequenceActionCreator());
        }
      }
    },
    [locale, dispatch, amountSequence, wordProfiles, inherited],
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

        // Al document, cap estil: un altre pictograma no porta retocs, i
        // n'hereta les variants que admet. Al formulari, els valors resolts
        dispatch(
          settingsPictApiAraActionCreator({
            indexSequence: indexSequence,
            settings: {},
            variants: extractPictVariants(data),
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
