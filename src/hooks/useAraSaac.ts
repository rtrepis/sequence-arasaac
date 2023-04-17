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
  PictApiAraForEdit,
  PictApiAraSettings,
  PictSequence,
} from "../types/sequence";
import useUserLocation from "./useUserLocation";

const araSaacURL = process.env.REACT_APP_API_ARASAAC_URL;

const useAraSaac = () => {
  const defaultSettingsPictSequence = useAppSelector(
    (state) => state.ui.defaultSettings.pictSequence
  );
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
        settingsProperty.fitzgerald = "#DD8800";
      if (data.tags.slice(0, 3).includes("verb"))
        settingsProperty.fitzgerald = "#229900";
      if (data.tags.slice(0, 3).includes("adjective"))
        settingsProperty.fitzgerald = "#0088CC";
      if (data.tags.slice(0, 3).includes("expression"))
        settingsProperty.fitzgerald = "#CC00BB";

      if (data.skin) settingsProperty.skin = defaultSettingsPictApiAra.skin;

      return { ...settingsProperty };
    },
    [defaultSettingsPictApiAra.skin]
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
      } catch {}
    },
    [locale, dispatch, makeSettingsProperty]
  );

  const getSearchPictogram = useCallback(
    async (word: string, indexSequence: number, isUpdate: boolean) => {
      try {
        const { data } = await axios.get(
          `${araSaacURL}pictograms/${locale}/bestsearch/${word.toLocaleLowerCase()}`
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
            settings: defaultSettingsPictSequence,
            text: word,
          };

          dispatch(addPictogramActionCreator(newPict));
          dispatch(sortSequenceActionCreator());
        }
      } catch {
        if (isUpdate) {
          const toPictNotFound: PictApiAraForEdit = {
            indexSequence: indexSequence,
            searched: { word: word, bestIdPicts: [-1] },
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
            settings: defaultSettingsPictSequence,
            text: word,
          };
          dispatch(addPictogramActionCreator(toPictNotFound));
          dispatch(sortSequenceActionCreator());
        }
      }
    },
    [
      dispatch,
      locale,
      amountSequence,
      makeSettingsProperty,
      defaultSettingsPictSequence,
    ]
  );

  const toUrlPath = (pictogramId: number, skin: string | undefined) => {
    let path = `${araSaacURL}pictograms/${pictogramId}`;

    skin &&
      skin !== "white" &&
      (path += `?skin=${skin === "asian" ? "assian" : skin}`);

    return path;
  };

  return { getSearchPictogram, toUrlPath, getSettingsPictId };
};

export default useAraSaac;
