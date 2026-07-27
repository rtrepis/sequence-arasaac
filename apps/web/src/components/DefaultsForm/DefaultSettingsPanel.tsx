import { forwardRef, useCallback, useImperativeHandle, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { DefaultSettings } from "../../types/ui";
import {
  DEFAULT_SKIN,
  DEFAULT_HAIR,
  DEFAULT_FITZGERALD,
  DEFAULT_COLOR,
  DEFAULT_FONT_FAMILY,
  DEFAULT_FONT_SIZE,
  DEFAULT_FONT_COLOR,
  DEFAULT_BORDER_IN_COLOR,
  DEFAULT_BORDER_IN_RADIUS,
  DEFAULT_BORDER_IN_SIZE,
  DEFAULT_BORDER_OUT_COLOR,
  DEFAULT_BORDER_OUT_RADIUS,
  DEFAULT_BORDER_OUT_SIZE,
} from "../../configs/defaultSettingsConfig";
import {
  pictAraSettingsApplyAllActionCreator,
  pictSequenceApplyAllActionCreator,
  borderInApplyAllActionCreator,
  borderOutApplyAllActionCreator,
} from "@features/sequence/store/documentSlice";
import { updateDefaultSettingsActionCreator } from "@features/user-settings/store/uiSlice";
import React from "react";
import DefaultForm from "./DefaultForm";

export interface DefaultSettingsPanelHandle {
  syncToRedux: () => void;
}

const DefaultSettingsPanel = forwardRef<DefaultSettingsPanelHandle>(
  (_, ref): React.ReactElement => {
    const dispatch = useAppDispatch();

    const {
      defaultSettings: {
        pictApiAra: { fitzgerald, skin: initialSkin, hair: initialHair, color: initialColor },
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
    const [numberFont, setNumberFont] = useState(initialNumberFont ?? initialFont);
    const [textPosition, setTextPosition] = useState(initialTextPosition);
    const [skin, setSkin] = useState(initialSkin);
    const [borderIn, setBorderIn] = useState(initialBorderIn);
    const [borderOut, setBorderOut] = useState(initialBorderOut);
    const [hair, setHair] = useState(initialHair);
    const [color, setColor] = useState(initialColor);
    const [numbered, setNumbered] = useState(initialNumbered);

    const buildSettings = useCallback((): DefaultSettings => ({
      pictApiAra: { fitzgerald, skin, hair, color },
      pictSequence: { borderIn, borderOut, font, numberFont, numbered, textPosition },
    }), [fitzgerald, skin, hair, color, borderIn, borderOut, font, numberFont, numbered, textPosition]);

    // Sincronitza l'estat local del formulari al Redux (sense fer crida al backend)
    // Cridat pel DefaultSettingsDialog just abans de guardar tot en tancar
    useImperativeHandle(ref, () => ({
      syncToRedux: () => {
        dispatch(updateDefaultSettingsActionCreator(buildSettings()));
      },
    }), [dispatch, buildSettings]);

    const handleReset = useCallback(() => {
      const defaultFont = { family: DEFAULT_FONT_FAMILY, color: DEFAULT_FONT_COLOR, size: DEFAULT_FONT_SIZE };
      setFont(defaultFont);
      setNumberFont(defaultFont);
      setTextPosition("bottom");
      setSkin(DEFAULT_SKIN);
      setHair(DEFAULT_HAIR);
      setColor(DEFAULT_COLOR);
      setNumbered(false);
      setBorderIn({ color: DEFAULT_BORDER_IN_COLOR, radius: DEFAULT_BORDER_IN_RADIUS, size: DEFAULT_BORDER_IN_SIZE });
      setBorderOut({ color: DEFAULT_BORDER_OUT_COLOR, radius: DEFAULT_BORDER_OUT_RADIUS, size: DEFAULT_BORDER_OUT_SIZE });
    }, []);

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
        onApplyAllColor={() => dispatch(pictAraSettingsApplyAllActionCreator({ color }))}
        onApplyAllTextPosition={() => dispatch(pictSequenceApplyAllActionCreator({ textPosition }))}
        onApplyAllSkin={() => dispatch(pictAraSettingsApplyAllActionCreator({ skin }))}
        onApplyAllHair={() => dispatch(pictAraSettingsApplyAllActionCreator({ hair }))}
        onApplyAllBorderIn={() => dispatch(borderInApplyAllActionCreator({ borderIn }))}
        onApplyAllBorderOut={() => dispatch(borderOutApplyAllActionCreator({ borderOut }))}
        onSubmit={() => dispatch(updateDefaultSettingsActionCreator(buildSettings()))}
        onReset={handleReset}
      />
    );
  }
);

DefaultSettingsPanel.displayName = "DefaultSettingsPanel";

export default DefaultSettingsPanel;
