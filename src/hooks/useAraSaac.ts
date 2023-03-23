import axios from "axios";
import { useCallback } from "react";
import { useIntl } from "react-intl";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  upDatePictNumberActionCreator,
  upDatePictWordActionCreator,
} from "../app/slice/sequenceSlice";
import { UpdatePictWordI } from "../types/sequence";

const araSaacURL = process.env.REACT_APP_API_ARASAAC_URL;

const useAraSaac = () => {
  const uiSettings = useAppSelector((state) => state.ui.setting);
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const locale = intl.locale.slice(0, 2).toLocaleLowerCase();

  const getSearchPictogram = useCallback(
    async (word: string, index: number, upDateNumber?: boolean | true) => {
      try {
        const { data } = await axios.get(
          `${araSaacURL}pictograms/${locale}/bestsearch/${word.toLocaleLowerCase()}`
        );
        const findPict: number[] = [];

        data.map((pictogram: any) => findPict.push(pictogram._id));

        const toPictUpdate: UpdatePictWordI = {
          indexPict: index,
          word: { keyWord: word, pictograms: findPict },
        };

        dispatch(upDatePictWordActionCreator(toPictUpdate));
        upDateNumber &&
          dispatch(
            upDatePictNumberActionCreator({ index: index, number: findPict[0] })
          );

        return findPict;
      } catch {
        const toPictNotFound: UpdatePictWordI = {
          indexPict: index,
          word: { keyWord: word, pictograms: [-1] },
        };
        dispatch(upDatePictWordActionCreator(toPictNotFound));
      }
    },
    [dispatch, locale]
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
