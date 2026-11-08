import React from "react";
import { Switch } from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { useFeedback } from "@/context/FeedbackContext";
import { useSequenceName } from "@features/free-layout/components/FreeLayoutPages/useSequenceName";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import type { SequenceViewSettings } from "@/types/document";
import { SectionTitle, SettingRow } from "@/components/SettingsLayout";
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
const LABEL_ID = "view-level-page-pictograms";

interface PagePictogramsProps {
  /** La pàgina; a la disposició automàtica d'un sol full, 0 */
  sheetIndex: number;
}

/**
 * Els pictogrames d'una pàgina, al nivell «Pàgina» de la columna: si tots els
 * blocs tenen la mateixa mida, espai i alineació o cadascun la seva. És
 * l'antic «Aplica a totes», ara pàgina a pàgina. Amb «la mateixa a tots», els
 * ajustos són aquí i valen per a tots els blocs de la pàgina; sense, cada bloc
 * es tria al nivell «Bloc». Amb un sol bloc no cal triar res: no hi és.
 */
const PagePictograms = ({
  sheetIndex,
}: PagePictogramsProps): React.ReactElement | null => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { showSnackbar } = useFeedback();
  const sequenceName = useSequenceName();
  const isFree = useAppSelector(selectHasPages);
  const documentView = useAppSelector(selectDocumentStyle).view;
  const { uniform, setUniform, view, blockCount, unit, smallest, differs } =
    usePageUniform(sheetIndex);
  if (blockCount < 2) return null;

  const change = (settings: Partial<SequenceViewSettings>) =>
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
   * Activar-ho posa a totes la configuració de la més petita (la que segur que
   * hi cap), i ho diu: és un canvi que l'usuari no ha fet a mà
   */
  const handleUniformChange = (checked: boolean) => {
    setUniform(checked);
    if (!checked || !differs || !smallest) return;
    const { sizePict, pictSpaceBetween, alignmentH, alignmentV } =
      smallest.view;
    change({ sizePict, pictSpaceBetween, alignmentH, alignmentV });
    showSnackbar({
      message: intl.formatMessage(messages.uniformApplied, {
        unit,
        name: sequenceName(smallest.sequenceKey),
      }),
      severity: "info",
    });
  };

  return (
    <SectionTitle title={<FormattedMessage {...messages.pictograms} />}>
      <SettingRow
        title={<FormattedMessage {...messages.uniform} values={{ unit }} />}
        labelId={`${LABEL_ID}-uniform`}
        helperId={`${LABEL_ID}-uniform-helper`}
        helper={
          <FormattedMessage
            {...(uniform ? messages.uniformOn : messages.uniformOff)}
            values={{ unit }}
          />
        }
        control="compact"
      >
        <Switch
          checked={uniform}
          onChange={(_, checked) => handleUniformChange(checked)}
          inputProps={{
            "aria-labelledby": `${LABEL_ID}-uniform`,
            "aria-describedby": `${LABEL_ID}-uniform-helper`,
          }}
        />
      </SettingRow>

      {uniform && (
        <SequenceViewRows view={view} labelId={LABEL_ID} onChange={change} />
      )}
    </SectionTitle>
  );
};

export default PagePictograms;
