import axios from "axios";
import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import removeDiacritics from "../utils/removeDiacritics";
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
import useUserLocation from "./useUserLocation";
import fitzgeraldColors from "../data/fitzgeraldColors";

const araSaacURL = process.env.REACT_APP_API_ARASAAC_URL;

const useAraSaac = () => {
  const {
    font: { size: fontSize },
    textPosition,
  } = useAppSelector((state) => state.ui.defaultSettings.pictSequence);
  const amountSequence = useAppSelector((state) => state.sequence.length);
  const defaultSettingsPictApiAra = useAppSelector(
    (state) => state.ui.defaultSettings.pictApiAra
  );

  const dispatch = useAppDispatch();
  const locale = useUserLocation();

  const makeSettingsProperty = useCallback(
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
    ]
  );

  const getSettingsPictId = useCallback(
    async (pictogramId: number, indexSequence: number) => {
      try {
        const { data } = await axios.get(
          `${araSaacURL}pictograms/${locale}/${pictogramId}`
        );

        const findSettings: PictApiAraSettings = await makeSettingsProperty(
          data
        );

        dispatch(
          settingsPictApiAraActionCreator({
            indexSequence: indexSequence,
            settings: findSettings,
          })
        );
        return findSettings;
      } catch {}
    },
    [locale, dispatch, makeSettingsProperty]
  );

  const getSearchPictogram = useCallback(
    async (
      word: string,
      indexSequence: number,
      isUpdate: boolean,
      isExtends?: boolean
    ) => {
      const search = isExtends ? "search" : "bestsearch";

      try {
        const { data } = await axios.get(
          `${araSaacURL}pictograms/${locale}/${search}/${removeDiacritics(
            word.toLocaleLowerCase()
          )}`
        );

        const findBestPict: number[] = [];
        data.map((pictogram: any) => findBestPict.push(pictogram._id));

        if (isUpdate) {
          const toPictUpdate: PictApiAraForEdit = {
            indexSequence: indexSequence,
            searched: { word: word, bestIdPicts: findBestPict },
          };

          dispatch(searchedActionCreator(toPictUpdate));
        }

        if (!isUpdate) {
          const newPict: PictSequence = {
            indexSequence: amountSequence + indexSequence,
            img: {
              searched: { word: word, bestIdPicts: findBestPict },
              selectedId: findBestPict[0],
              settings: await makeSettingsProperty(data[0]),
            },
            settings: { fontSize, textPosition },
            cross: false,
          };

          dispatch(addPictogramActionCreator(newPict));
          dispatch(sortSequenceActionCreator());
        }
      } catch {
        if (isUpdate) {
          const toPictNotFound: PictApiAraForEdit = {
            indexSequence: indexSequence,
            searched: { word: word, bestIdPicts: [-1] },
            settings: {},
          };
          dispatch(searchedActionCreator(toPictNotFound));
        }

        if (!isUpdate) {
          const toPictNotFound: PictSequence = {
            indexSequence: amountSequence + indexSequence,
            img: {
              searched: { word: word, bestIdPicts: [3418] },
              selectedId: 3418,
              settings: { fitzgerald: "#666" },
            },
            settings: { textPosition, fontSize },
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
    ]
  );

  const toUrlPath = (
    pictogramId: number,
    skin?: Skin | undefined,
    hair?: Hair | undefined,
    color?: boolean
  ) => {
    let path = `${araSaacURL}pictograms/${pictogramId}`;

    skin &&
      skin !== "white" &&
      (path += `?skin=${skin === "asian" ? "assian" : skin}`);

    hair &&
      (skin === undefined || skin === "white"
        ? (path += `?hair=${hair}`)
        : (path += `&hair=${hair}`));

    color === false &&
      (skin === undefined && hair === undefined
        ? (path += `?color=${color}`)
        : (path += `&color=${color}`));

    return path;
  };

  return { getSearchPictogram, toUrlPath, getSettingsPictId };
};

export default useAraSaac;
