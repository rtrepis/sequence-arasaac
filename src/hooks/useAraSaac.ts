import axios from "axios";
import { useCallback } from "react";
import { useIntl } from "react-intl";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  upDatePictSearchedActionCreator,
  addPictogramActionCreator,
  sortSequenceActionCreator,
  upDateSettingsPictApiAraActionCreator,
} from "../app/slice/sequenceSlice";
import {
  PictApiAraSettings,
  PictSequence,
  UpdateSearched,
} from "../types/sequence";

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
  const intl = useIntl();

  const locale = intl.locale.slice(0, 2).toLocaleLowerCase();

  const makeSettingsProperty = useCallback(
    async (data: any) => {
      const settingsProperty: PictApiAraSettings = {};

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
          upDateSettingsPictApiAraActionCreator({
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
          const toPictUpdate: UpdateSearched = {
            indexSequence: indexSequence,
            searched: { word: word, bestIdPicts: findBestPict },
          };

          dispatch(upDatePictSearchedActionCreator(toPictUpdate));
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
          const toPictNotFound: UpdateSearched = {
            indexSequence: indexSequence,
            searched: { word: word, bestIdPicts: [-1] },
          };
          dispatch(upDatePictSearchedActionCreator(toPictNotFound));
        }

        if (!isUpdate) {
          const toPictNotFound: PictSequence = {
            indexSequence: amountSequence + 1,
            img: {
              searched: { word: word, bestIdPicts: [3418] },
              selectedId: 3418,
              settings: { skin: "white" },
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

    if (skin) {
      const urlSkin =
        skin !== "default" ? skin : defaultSettingsPictApiAra.skin;

      urlSkin !== "white" &&
        (path += `?skin=${urlSkin === "asian" ? "assian" : urlSkin}`);
    }

    return path;
  };

  return { getSearchPictogram, toUrlPath, getSettingsPictId };
};

export default useAraSaac;
