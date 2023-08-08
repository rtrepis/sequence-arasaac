import { useIntl } from "react-intl";
import { useAppSelector } from "../app/hooks";
import { PictSequence } from "../types/sequence";
import messages from "./newPictogram.lang";

const useNewPictogram = () => {
  const intl = useIntl();
  const pictSequenceDefault = useAppSelector(
    (state) => state.ui.defaultSettings.pictSequence
  );

  const getPictogramEmptyWithDefaultSettings = (indexSequence: number) => {
    const pictogramEmpty: PictSequence = {
      indexSequence: indexSequence,
      img: {
        searched: {
          word: `${intl.formatMessage(messages.empty)}`,
          bestIdPicts: [],
        },
        selectedId: 26527,
        settings: { fitzgerald: "#2222ff" },
      },
      settings: {
        textPosition: pictSequenceDefault.textPosition,
        font: pictSequenceDefault.font,
      },
      cross: false,
    };

    return pictogramEmpty;
  };

  return { getPictogramEmptyWithDefaultSettings };
};

export default useNewPictogram;
