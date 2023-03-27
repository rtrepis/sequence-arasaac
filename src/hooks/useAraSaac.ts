import axios from "axios";
import { useCallback } from "react";
import { useIntl } from "react-intl";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  upDatePictSearchedActionCreator,
  addPictogramActionCreator,
  sortSequenceActionCreator,
} from "../app/slice/sequenceSlice";
import { PictSequence, UpdateSearched } from "../types/sequence";

const araSaacURL = process.env.REACT_APP_API_ARASAAC_URL;

const useAraSaac = () => {
  const uiSettings = useAppSelector(
    (state) => state.ui.defaultSettings.PictApiAra
  );
  const amountSequence = useAppSelector((state) => state.sequence.length);
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const locale = intl.locale.slice(0, 2).toLocaleLowerCase();

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
              settings: { skin: "default" },
            },
            settings: {},
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
              settings: { skin: "default" },
            },
            settings: {},
            text: word,
          };
          dispatch(addPictogramActionCreator(toPictNotFound));
          dispatch(sortSequenceActionCreator());
        }
      }
    },
    [dispatch, locale, amountSequence]
  );

  const toUrlPath = (pictogram: number, skin: string | undefined) => {
    let path = `${araSaacURL}pictograms/${pictogram}`;

    const urlSkin = skin !== "default" ? skin : uiSettings.skin;

    urlSkin !== "white" &&
      (path += `?skin=${urlSkin === "asian" ? "assian" : urlSkin}`);

    return path;
  };

  return { getSearchPictogram, toUrlPath };
};

export default useAraSaac;
