import { useCallback, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { DefaultSettings } from "../../types/ui";
import { updateDefaultSettingsActionCreator } from "../../app/slice/uiSlice";
import { saveSettings } from "../../features/user-settings/storage/settingsStorage";
import {
  pictAraSettingsApplyAllActionCreator,
  pictSequenceApplyAllActionCreator,
  borderInApplyAllActionCreator,
  borderOutApplyAllActionCreator,
} from "../../app/slice/documentSlice";
import React from "react";
import DefaultForm from "./DefaultForm";

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

  const handlerSubmit = useCallback(() => {
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

    dispatch(updateDefaultSettingsActionCreator(newDefaultSettings));
    saveSettings(newDefaultSettings);
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
  ]);

  useEffect(() => {
    if (!submit) handlerSubmit();
    if (submit === "save") handlerSubmit();
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
      onSubmit={handlerSubmit}
    />
  );
};

export default DefaultSettingsPanel;
