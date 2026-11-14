import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { useAppDispatch, useAppSelector } from "@app/hooks";
import { DefaultSettings } from "@/types/ui";
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
} from "@/configs/defaultSettingsConfig";
import { updateDefaultSettingsActionCreator } from "@features/user-settings/store/uiSlice";
import { deepEqual } from "@features/sequence/style/styleModel";
import MyStyleHeader from "./MyStyleHeader";
import { FormattedMessage } from "react-intl";
import formMessages from "./DefaultForm.lang";
import React from "react";
import DefaultForm from "./DefaultForm";

export interface DefaultSettingsPanelHandle {
  syncToRedux: () => void;
}

const DefaultSettingsPanel = forwardRef<DefaultSettingsPanelHandle>(
  (_, ref): React.ReactElement => {
    const dispatch = useAppDispatch();

    // Aquest panell edita «el meu estil»: l'estil dels pictogrames amb què
    // neixen els documents nous i el que aplica «Aplica el meu estil» des del
    // menú «⋯» de la pàgina i del bloc. No toca mai el document obert: els
    // estils van en una sola direcció, de la configuració cap al document
    // (R10, `docs/fonaments/03-model-contingut-estil.md`)
    const myStyle = useAppSelector((state) => state.ui.defaultSettings);
    const {
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
    } = myStyle;

    const [font, setFont] = useState(initialFont);
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

    const buildSettings = useCallback(
      (): DefaultSettings => ({
        pictApiAra: { fitzgerald, skin, hair, color },
        pictSequence: {
          borderIn,
          borderOut,
          font,
          numberFont,
          numbered,
          textPosition,
        },
      }),
      [
        fitzgerald,
        skin,
        hair,
        color,
        borderIn,
        borderOut,
        font,
        numberFont,
        numbered,
        textPosition,
      ],
    );

    // Quan el meu estil canvia des de fora del formulari —«Carrega un estil
    // des d'un fitxer»—, el formulari passa a ensenyar el que hi ha ara
    useEffect(() => {
      const { pictSequence, pictApiAra } = myStyle;
      setFont(pictSequence.font);
      setNumberFont(pictSequence.numberFont ?? pictSequence.font);
      setTextPosition(pictSequence.textPosition);
      setSkin(pictApiAra.skin);
      setBorderIn(pictSequence.borderIn);
      setBorderOut(pictSequence.borderOut);
      setHair(pictApiAra.hair);
      setColor(pictApiAra.color);
      setNumbered(pictSequence.numbered);
    }, [myStyle]);

    // Porta el formulari a les preferències. Si no ha canviat res no es toca
    // res. El SettingsDialog el crida en tancar, i el desat (al compte o al
    // navegador) el fa ell, en segon pla
    const syncToRedux = useCallback(() => {
      const settings = buildSettings();
      if (deepEqual(settings, myStyle)) return;
      dispatch(updateDefaultSettingsActionCreator(settings));
    }, [dispatch, buildSettings, myStyle]);

    useImperativeHandle(ref, () => ({ syncToRedux }), [syncToRedux]);

    const handleReset = useCallback(() => {
      const defaultFont = {
        family: DEFAULT_FONT_FAMILY,
        color: DEFAULT_FONT_COLOR,
        size: DEFAULT_FONT_SIZE,
      };
      setFont(defaultFont);
      setNumberFont(defaultFont);
      setTextPosition("bottom");
      setSkin(DEFAULT_SKIN);
      setHair(DEFAULT_HAIR);
      setColor(DEFAULT_COLOR);
      setNumbered(false);
      setBorderIn({
        color: DEFAULT_BORDER_IN_COLOR,
        radius: DEFAULT_BORDER_IN_RADIUS,
        size: DEFAULT_BORDER_IN_SIZE,
      });
      setBorderOut({
        color: DEFAULT_BORDER_OUT_COLOR,
        radius: DEFAULT_BORDER_OUT_RADIUS,
        size: DEFAULT_BORDER_OUT_SIZE,
      });
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
        onSubmit={syncToRedux}
        onReset={handleReset}
        header={
          <MyStyleHeader
            help={<FormattedMessage {...formMessages.panelHint} />}
            onBeforeAction={syncToRedux}
          />
        }
      />
    );
  },
);

DefaultSettingsPanel.displayName = "DefaultSettingsPanel";

export default DefaultSettingsPanel;
