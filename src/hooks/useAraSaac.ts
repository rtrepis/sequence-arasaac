import axios from "axios";
import { useCallback } from "react";

const araSaacURL = process.env.REACT_APP_API_ARASAAC_URL;

const useAraSaac = () => {
  const getSearchPictogram = useCallback(async (word: string) => {
    try {
      const { data } = await axios.get(
        `${araSaacURL}pictograms/en/bestsearch/${word}`
      );
      const findPict: number[] = [];

      data.map((pictogram: any) => findPict.push(pictogram._id));

      return findPict;
    } catch {
      const error = "Error 404, not found";
      return error;
    }
  }, []);

  return { getSearchPictogram };
};

export default useAraSaac;
