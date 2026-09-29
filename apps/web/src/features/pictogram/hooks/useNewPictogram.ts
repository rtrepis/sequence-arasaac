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
  // Un pictograma buit no té categoria: pren el color dels que no en tenen
  const noCategoryColor = useAppSelector(
    (state) => selectDocumentPictStyle(state).pictApiAra.fitzgerald,
  );

  const getPictogramEmptyWithDefaultSettings = (indexSequence: number) => {
    const pictogramEmpty: PictSequence = {
      indexSequence: indexSequence,
      img: {
        searched: {
          word: "",
          bestIdPicts: [],
        },
        selectedId: 0,
        settings: { fitzgerald: noCategoryColor },
        category: "none",
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
