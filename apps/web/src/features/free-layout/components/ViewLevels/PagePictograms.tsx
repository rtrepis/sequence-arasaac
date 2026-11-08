import React from "react";
import { Switch } from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { useFeedback } from "@/context/FeedbackContext";
import { useSequenceName } from "@features/free-layout/components/FreeLayoutPages/useSequenceName";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import type { SequenceViewSettings } from "@/types/document";
import { SettingRow } from "@/components/SettingsLayout";
import SequenceViewRows from "@components/ViewSequencesSettings/SequenceViewRows";
import { applyViewSettingsToAllActionCreator } from "@features/sequence/store/documentSlice";
import { selectDocumentStyle } from "@features/sequence/style/styleSelectors";
import {
  selectHasPages,
  setSheetViewThunk,
} from "@features/free-layout/store/freeLayoutThunks";
import { usePageUniform } from "@features/free-layout/hooks/usePageUniform";
import messages from "./ViewLevels.lang";

/** Prefix dels ids dels títols de fila, per lligar-los als controls. */
const LABEL_ID = "view-level-pictograms";

interface PagePictogramsProps {
  /** La pàgina del bloc; a la pàgina única de sempre, 0 */
  sheetIndex: number;
  /** La vista d'aquest bloc, amb la cascada sencera */
  view: SequenceViewSettings;
  /** Canvia només aquest bloc */
  onChange: (change: Partial<SequenceViewSettings>) => void;
  /** Un bloc comú surt a totes les pàgines: no segueix «igual a tots» */
  common?: boolean;
  /** Avís sota la mida (els pictogrames no hi caben), si n'hi ha */
  sizeHelper?: React.ReactNode;
}

/**
 * Els pictogrames del bloc seleccionat, al nivell «Bloc» de la columna: la
 * mida, l'espai i l'alineació i, a dalt, l'interruptor «Igual a tots els
 * blocs» de la pàgina (l'antic «Aplica a totes», pàgina a pàgina). Activat,
 * el que es canvia aquí val per a tots els blocs de la pàgina; desactivat,
 * només per a aquest. Amb un sol bloc, l'interruptor no hi és.
 */
const PagePictograms = ({
  sheetIndex,
  view,
  onChange,
  common = false,
  sizeHelper,
}: PagePictogramsProps): React.ReactElement => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { showSnackbar } = useFeedback();
  const sequenceName = useSequenceName();
  const isFree = useAppSelector(selectHasPages);
  const documentView = useAppSelector(selectDocumentStyle).view;
  const page = usePageUniform(sheetIndex);
  const canBeUniform = page.blockCount > 1 && !common;
  const uniform = canBeUniform && page.uniform;

  const changeAll = (settings: Partial<SequenceViewSettings>) =>
    dispatch(
      isFree
        ? setSheetViewThunk(sheetIndex, settings)
        : // Un sol full: és l'estil del document, com feia «Aplica a totes»
          applyViewSettingsToAllActionCreator({
            settings,
            styleView: documentView,
          }),
    );

  /**
   * Activar-ho posa a tots la configuració del més petit (la que segur que
   * hi cap), i ho diu: és un canvi que l'usuari no ha fet a mà
   */
  const handleUniformChange = (checked: boolean) => {
    page.setUniform(checked);
    if (!checked || !page.differs || !page.smallest) return;
    const { sizePict, pictSpaceBetween, alignmentH, alignmentV } =
      page.smallest.view;
    changeAll({ sizePict, pictSpaceBetween, alignmentH, alignmentV });
    showSnackbar({
      message: intl.formatMessage(messages.uniformApplied, {
        unit: page.unit,
        name: sequenceName(page.smallest.sequenceKey),
      }),
      severity: "info",
    });
  };

  return (
    <>
      {canBeUniform && (
        <SettingRow
          title={
            <FormattedMessage
              {...messages.uniform}
              values={{ unit: page.unit }}
            />
          }
          labelId={`${LABEL_ID}-uniform`}
          control="compact"
        >
          <Switch
            checked={uniform}
            onChange={(_, checked) => handleUniformChange(checked)}
            inputProps={{ "aria-labelledby": `${LABEL_ID}-uniform` }}
          />
        </SettingRow>
      )}
      <SequenceViewRows
        view={uniform ? page.view : view}
        labelId={LABEL_ID}
        onChange={uniform ? changeAll : onChange}
        sizeHelper={sizeHelper}
      />
    </>
  );
};

export default PagePictograms;
