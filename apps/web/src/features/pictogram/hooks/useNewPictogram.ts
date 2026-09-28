import { useAppSelector } from "@/app/hooks";
import { PictSequence } from "@/types/sequence";
import { selectDocumentPictStyle } from "@features/sequence/style/styleSelectors";

const useNewPictogram = () => {
  const {
    textPosition,
    borderIn: defaultBorderIn,
    borderOut: defaultBorderOut,
    // Els pictogrames nous reben l'estil del document on entren
  } = useAppSelector((state) => selectDocumentPictStyle(state).pictSequence);

  const getPictogramEmptyWithDefaultSettings = (indexSequence: number) => {
    const pictogramEmpty: PictSequence = {
      indexSequence: indexSequence,
      img: {
        searched: {
          word: "",
          bestIdPicts: [],
        },
        selectedId: 0,
        settings: { fitzgerald: "#2222ff" },
      },
      settings: {
        textPosition,
        borderIn: defaultBorderIn,
        borderOut: defaultBorderOut,
      },
      cross: false,
    };

    return pictogramEmpty;
  };

  return { getPictogramEmptyWithDefaultSettings };
};

export default useNewPictogram;
