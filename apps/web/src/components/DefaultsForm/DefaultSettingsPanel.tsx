import { useCallback, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { DefaultSettings } from "../../types/ui";
import {
  pictAraSettingsApplyAllActionCreator,
  pictSequenceApplyAllActionCreator,
  borderInApplyAllActionCreator,
  borderOutApplyAllActionCreator,
} from "@features/sequence/store/documentSlice";
import { saveSettingsThunk } from "@features/backend/user-settings/store/settingsThunks";
import { useFeedback } from "../../context/FeedbackContext/FeedbackContext";
import React from "react";
import DefaultForm from "./DefaultForm";
import messages from "./DefaultForm.lang";

interface DefaultSettingsPanelProps {
  submit: boolean | "save";
}

/**
 * Component smart: llegeix Redux, gestiona estat del formulari i persistència.
 * Renderitza DefaultForm com a component de presentació pur.
 */
const DefaultSettingsPanel = ({
  submit,
}: DefaultSettingsPanelProps): React.ReactElement => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const { showSnackbar } = useFeedback();

  const {
    defaultSettings: {
      pictApiAra: {
        fitzgerald,
        skin: initialSkin,
        hair: initialHair,
        color: initialColor,
      },
      pictSequence: {
        borderIn: initialBorderIn,
        borderOut: initialBorderOut,
        font: initialFont,
        numberFont: initialNumberFont,
        numbered: initialNumbered,
        textPosition: initialTextPosition,
      },
    },
  } = useAppSelector((state) => state.ui);

  const [font, setFont] = useState(initialFont);
  // Si no hi ha numberFont guardat (dades antigues), usa el font del text com a base
  const [numberFont, setNumberFont] = useState(
    initialNumberFont ?? initialFont,
  );
  const [textPosition, setTextPosition] = useState(initialTextPosition);
  const [skin, setSkin] = useState(initialSkin);
  const [borderIn, setBorderIn] = useState(initialBorderIn);
  const [borderOut, setBorderOut] = useState(initialBorderOut);
  const [hair, setHair] = useState(initialHair);
  const [color, setColor] = useState(initialColor);
  const [numbered, setNumbered] = useState(initialNumbered);

  const handlerSubmit = useCallback(async (showFeedback = false) => {
    const newDefaultSettings: DefaultSettings = {
      pictApiAra: { fitzgerald, skin, hair, color },
      pictSequence: {
        borderIn,
        borderOut,
        font,
        numberFont,
        numbered,
        textPosition,
      },
    };

    const result = await dispatch(saveSettingsThunk(newDefaultSettings));

    if (showFeedback) {
      if (saveSettingsThunk.fulfilled.match(result) && result.payload.synced) {
        showSnackbar({
          message: intl.formatMessage(messages.saveSuccess),
          severity: "success",
        });
      } else if (saveSettingsThunk.rejected.match(result)) {
        showSnackbar({
          message: intl.formatMessage(messages.saveError),
          severity: "error",
        });
      }
    }
  }, [
    fitzgerald,
    skin,
    hair,
    borderIn,
    borderOut,
    numbered,
    numberFont,
    textPosition,
    dispatch,
    color,
    font,
    showSnackbar,
    intl,
  ]);

  useEffect(() => {
    if (!submit) void handlerSubmit();
    if (submit === "save") void handlerSubmit(true);
  }, [submit, handlerSubmit]);

  return (
    <DefaultForm
      font={font}
      setFont={setFont}
      numberFont={numberFont}
      setNumberFont={setNumberFont}
      textPosition={textPosition}
      setTextPosition={setTextPosition}
      skin={skin}
      setSkin={setSkin}
      borderIn={borderIn}
      setBorderIn={setBorderIn}
      borderOut={borderOut}
      setBorderOut={setBorderOut}
      hair={hair}
      setHair={setHair}
      color={color}
      setColor={setColor}
      numbered={numbered}
      setNumbered={setNumbered}
      onApplyAllColor={() =>
        dispatch(pictAraSettingsApplyAllActionCreator({ color: !color }))
      }
      onApplyAllTextPosition={() =>
        dispatch(pictSequenceApplyAllActionCreator({ textPosition }))
      }
      onApplyAllSkin={() =>
        dispatch(pictAraSettingsApplyAllActionCreator({ skin }))
      }
      onApplyAllHair={() =>
        dispatch(pictAraSettingsApplyAllActionCreator({ hair }))
      }
      onApplyAllBorderIn={() =>
        dispatch(borderInApplyAllActionCreator({ borderIn }))
      }
      onApplyAllBorderOut={() =>
        dispatch(borderOutApplyAllActionCreator({ borderOut }))
      }
      onSubmit={() => void handlerSubmit()}
    />
  );
};

export default DefaultSettingsPanel;
