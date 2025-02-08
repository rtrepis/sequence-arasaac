import axios from "axios";
import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  searchedActionCreator,
  addPictogramActionCreator,
  sortSequenceActionCreator,
  settingsPictApiAraActionCreator,
} from "../app/slice/sequenceSlice";
import {
  Hair,
  PictApiAraForEdit,
  PictApiAraSettings,
  PictSequence,
  Skin,
} from "../types/sequence";
import fitzgeraldColors from "../data/fitzgeraldColors";
import { updateKeywordsActionCreator } from "../app/slice/uiSlice";

const araSaacURL = import.meta.env.VITE_APP_API_ARASAAC_URL;

export interface Ai {
  word: string;
  text: string;
}

const useAraSaac = () => {
  const {
    font: { size: fontSize },
    textPosition,
  } = useAppSelector((state) => state.ui.defaultSettings.pictSequence);
  const amountSequence = useAppSelector((state) => state.sequence.length);
  const defaultSettingsPictApiAra = useAppSelector(
    (state) => state.ui.defaultSettings.pictApiAra,
  );

  const dispatch = useAppDispatch();
  const locale = useAppSelector((state) => state.ui.lang.search);

  const makeSettingsProperty = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (data: any) => {
      const settingsProperty: PictApiAraSettings = {};

      if (data.tags.slice(0, 3).includes("person"))
        settingsProperty.fitzgerald = fitzgeraldColors.person;
      if (data.tags.slice(0, 3).includes("verb"))
        settingsProperty.fitzgerald = fitzgeraldColors.verb;
      if (data.tags.slice(0, 3).includes("adjective"))
        settingsProperty.fitzgerald = fitzgeraldColors.adjective;
      if (data.tags.slice(0, 3).includes("expression"))
        settingsProperty.fitzgerald = fitzgeraldColors.expression;

      if (data.skin) settingsProperty.skin = defaultSettingsPictApiAra.skin;

      if (data.hair) settingsProperty.hair = defaultSettingsPictApiAra.hair;

      settingsProperty.color = defaultSettingsPictApiAra.color;

      return { ...settingsProperty };
    },
    [
      defaultSettingsPictApiAra.hair,
      defaultSettingsPictApiAra.skin,
      defaultSettingsPictApiAra.color,
    ],
  );

  const getSettingsPictId = useCallback(
    async (pictogramId: number, indexSequence: number) => {
      try {
        const { data } = await axios.get(
          `${araSaacURL}pictograms/${locale}/${pictogramId}`,
        );

        const findSettings: PictApiAraSettings =
          await makeSettingsProperty(data);

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
    [locale, dispatch, makeSettingsProperty],
  );

  const getSearchPictogram = useCallback(
    async (
      word: string | Ai,
      indexSequence: number,
      isUpdate: boolean,
      isExtends?: boolean,
    ) => {
      const search = isExtends ? "search" : "bestsearch";

      const wordAraSaac = typeof word === "string" ? word : word.word;

      try {
        const { data } = await axios.get(
          `${araSaacURL}pictograms/${locale}/${search}/${wordAraSaac.toLocaleLowerCase()}`,
        );

        const findBestPict: number[] = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.map((pictogram: any) => findBestPict.push(pictogram._id));

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
              settings: await makeSettingsProperty(data[0]),
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
      makeSettingsProperty,
      fontSize,
      textPosition,
    ],
  );

  const toUrlPath = (
    pictogramId: number,
    skin?: Skin | undefined,
    hair?: Hair | undefined,
    color?: boolean,
  ) => {
    if (pictogramId === 0) return "../img/settings/white.svg";
    let path = `${araSaacURL}pictograms/${pictogramId}`;

    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    skin &&
      skin !== "white" &&
      (path += `?skin=${skin === "asian" ? "assian" : skin}`);

    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    hair &&
      (skin === undefined || skin === "white"
        ? (path += `?hair=${hair}`)
        : (path += `&hair=${hair}`));

    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    color === false &&
      (skin === undefined && hair === undefined
        ? (path += `?color=${color}`)
        : (path += `&color=${color}`));

    return path;
  };

  const getAllKeyWordsForLanguages = useCallback(async () => {
    try {
      const { data } = await axios.get(`${araSaacURL}keywords/${locale}`);

      dispatch(updateKeywordsActionCreator(data.words));
    } catch {
      console.info("failed fetch keywords ");
    }
  }, [dispatch, locale]);

  return {
    getSearchPictogram,
    toUrlPath,
    getSettingsPictId,
    getAllKeyWordsForLanguages,
  };
};

export default useAraSaac;
