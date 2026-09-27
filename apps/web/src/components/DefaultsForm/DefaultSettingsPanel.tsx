import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
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
import { applyDocumentStyleActionCreator } from "@features/sequence/store/documentSlice";
import { selectDocumentStyle } from "@features/sequence/style/styleSelectors";
import { deepEqual, pictStyleOf } from "@features/sequence/style/styleModel";
import { useSetDefaultStyle } from "@features/sequence/hooks/useSetDefaultStyle";
import SettingsSaveErrorDialog from "@/Modals/DefaultSettingsModal/SettingsSaveErrorDialog";
import DocumentStyleHeader from "@features/sequence/components/DocumentStyle/DocumentStyleHeader";
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

    // Aquest panell edita l'estil del document obert —el que s'aplica a totes
    // les seves seqüències—, no les preferències de l'usuari: per als documents
    // nous hi ha «Desa com a estil per defecte»
    // (`docs/fonaments/sequencia-i-estil.md`)
    const documentStyle = useAppSelector(selectDocumentStyle);
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
    } = documentStyle;
    const { setAsDefault, retry, failure, isRetrying, dismissError } =
      useSetDefaultStyle();

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

    // Quan l'estil del document canvia des de fora del formulari —les accions
    // de la capçalera: aplicar l'estil per defecte, carregar-ne un, desfer—, el
    // formulari passa a ensenyar el que té ara el document
    useEffect(() => {
      const { pictSequence, pictApiAra } = documentStyle;
      setFont(pictSequence.font);
      setNumberFont(pictSequence.numberFont ?? pictSequence.font);
      setTextPosition(pictSequence.textPosition);
      setSkin(pictApiAra.skin);
      setBorderIn(pictSequence.borderIn);
      setBorderOut(pictSequence.borderOut);
      setHair(pictApiAra.hair);
      setColor(pictApiAra.color);
      setNumbered(pictSequence.numbered);
    }, [documentStyle]);

    // Porta el formulari a l'estil del document, amb la regla dels retocs:
    // els pictogrames que tenien el mateix que l'estil el segueixen. Si no ha
    // canviat res no es toca el document, que si no quedaria com a canviat
    // només per haver obert la configuració
    const applyToDocument = useCallback(() => {
      const settings = buildSettings();
      if (deepEqual(settings, pictStyleOf(documentStyle))) return;
      dispatch(
        applyDocumentStyleActionCreator({
          from: documentStyle,
          to: { ...documentStyle, ...settings },
        }),
      );
    }, [dispatch, buildSettings, documentStyle]);

    // Cridat pel DefaultSettingsDialog en tancar
    useImperativeHandle(
      ref,
      () => ({
        syncToRedux: applyToDocument,
      }),
      [applyToDocument],
    );

    const handleSetAsDefault = useCallback(() => {
      applyToDocument();
      setAsDefault({ ...documentStyle, ...buildSettings() });
    }, [applyToDocument, setAsDefault, documentStyle, buildSettings]);

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
      <>
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
            dispatch(pictAraSettingsApplyAllActionCreator({ color }))
          }
          onApplyAllTextPosition={() =>
            dispatch(pictSequenceApplyAllActionCreator({ textPosition }))
          }
          onApplyAllAppearance={() =>
            dispatch(pictAraSettingsApplyAllActionCreator({ skin, hair }))
          }
          onApplyAllBorderIn={() =>
            dispatch(borderInApplyAllActionCreator({ borderIn }))
          }
          onApplyAllBorderOut={() =>
            dispatch(borderOutApplyAllActionCreator({ borderOut }))
          }
          onSubmit={applyToDocument}
          onReset={handleReset}
          header={
            <DocumentStyleHeader
              help={<FormattedMessage {...formMessages.panelHint} />}
              onBeforeAction={applyToDocument}
              onSetAsDefault={handleSetAsDefault}
            />
          }
        />
        <SettingsSaveErrorDialog
          failure={failure}
          isRetrying={isRetrying}
          onRetry={retry}
          onDismiss={dismissError}
        />
      </>
    );
  },
);

DefaultSettingsPanel.displayName = "DefaultSettingsPanel";

export default DefaultSettingsPanel;
