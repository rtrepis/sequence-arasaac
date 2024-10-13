import { useAppSelector } from "../app/hooks";
import { PictSequence } from "../types/sequence";

const useNewPictogram = () => {
  const pictSequenceDefault = useAppSelector(
    (state) => state.ui.defaultSettings.pictSequence
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
        settings: { fitzgerald: "#2222ff" },
      },
      settings: {
        textPosition: pictSequenceDefault.textPosition,
      },
      cross: false,
    };

    return pictogramEmpty;
  };

  return { getPictogramEmptyWithDefaultSettings };
};

export default useNewPictogram;
