import React from "react";
import { Typography } from "@mui/material";
import { MdOutlineDashboard, MdTableRows } from "react-icons/md";
import { FormattedMessage, useIntl } from "react-intl";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { useFeedback } from "@/context/FeedbackContext";
import StyledToggleButtonGroup from "@/style/StyledToggleButtonGroup";
import { IconToggleButton, SettingRow } from "@/components/SettingsLayout";
import type { PageSize } from "@/types/ui";
import { PaperSize, regionalPaperSize } from "@features/print/utils/pageFormat";
import { unplacedSequenceKeys } from "@features/free-layout/model/placementsOf";
import {
  selectPages,
  selectIsFreeLayout,
  selectSequenceKeys,
  setLayoutModeThunk,
} from "@features/free-layout/store/freeLayoutThunks";
import { useSequenceName } from "@features/free-layout/components/FreeLayoutPages/useSequenceName";
import viewMessages from "@components/ViewSequencesSettings/ViewSequencesSettings.lang";
import messages from "./FreeLayoutSettings.lang";

/** «Automàtica» o «Lliure», per a tot el document (ADR-005). */
type LayoutMode = "flow" | "free";

/** Prefix dels ids dels títols de fila, per lligar-los als controls. */
const LABEL_ID = "free-layout-settings";

/** El nom de cada paper, per dir a quin s'ha passat. */
const PAPER_NAMES: Record<
  PaperSize,
  string | typeof viewMessages.pageSizeLetter
> = {
  A4: "A4",
  A3: "A3",
  LETTER: viewMessages.pageSizeLetter,
  TABLOID: viewMessages.pageSizeTabloid,
};

interface FreeLayoutSettingsProps {
  pageSize: PageSize;
  onPageSizeChange: (size: PageSize) => void;
}

/**
 * Files de la columna de la vista per a la disposició (ADR-005): automàtica
 * o lliure i, en lliure, les seqüències que no surten a cap pàgina. Només
 * files d'ajust (`SettingRow`); la secció la posa qui el fa servir.
 *
 * La pantalla completa no té mil·límetres i no admet el mode lliure: triar
 * «Lliure» des d'allà passa la pàgina al paper de cada dia de qui la fa servir,
 * i el missatge ho diu.
 */
const FreeLayoutSettings = ({
  pageSize,
  onPageSizeChange,
}: FreeLayoutSettingsProps): React.ReactElement => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { showSnackbar } = useFeedback();
  const isFree = useAppSelector(selectIsFreeLayout);
  const keys = useAppSelector(selectSequenceKeys);
  const freeLayout = useAppSelector(selectPages);
  const sequenceName = useSequenceName();
  const unplaced = freeLayout ? unplacedSequenceKeys(freeLayout, keys) : [];

  const handleModeChange = (mode: LayoutMode | null) => {
    if (!mode || (mode === "free") === isFree) return;
    if (mode === "flow") {
      // Surt el snackbar amb «Desfés»
      dispatch(setLayoutModeThunk("flow"));
      return;
    }
    let message = intl.formatMessage(messages.freeOn);
    if (pageSize === "FULLSCREEN") {
      const paper = regionalPaperSize(navigator.languages);
      onPageSizeChange(paper);
      const name = PAPER_NAMES[paper];
      message = intl.formatMessage(messages.paperChanged, {
        paper: typeof name === "string" ? name : intl.formatMessage(name),
      });
    }
    dispatch(setLayoutModeThunk("free"));
    showSnackbar({ message, severity: "success" });
  };

  return (
    <>
      <SettingRow
        title={<FormattedMessage {...messages.layout} />}
        labelId={`${LABEL_ID}-mode`}
        control="wide"
      >
        <StyledToggleButtonGroup
          value={isFree ? "free" : "flow"}
          exclusive
          onChange={(_, mode: LayoutMode | null) => handleModeChange(mode)}
          aria-labelledby={`${LABEL_ID}-mode`}
        >
          <IconToggleButton value="flow" message={messages.layoutFlow}>
            <MdTableRows />
          </IconToggleButton>
          <IconToggleButton value="free" message={messages.layoutFree}>
            <MdOutlineDashboard />
          </IconToggleButton>
        </StyledToggleButtonGroup>
      </SettingRow>

      {/* El control és el nombre; a sota, quines són, o que no n'hi ha cap */}
      {isFree && (
        <SettingRow
          title={<FormattedMessage {...messages.unplaced} />}
          labelId={`${LABEL_ID}-unplaced`}
          control="compact"
          helper={
            unplaced.length === 0 ? (
              <FormattedMessage {...messages.unplacedNone} />
            ) : (
              <>
                {intl.formatList(unplaced.map(sequenceName), {
                  type: "conjunction",
                })}
                {". "}
                <FormattedMessage {...messages.unplacedHint} />
              </>
            )
          }
        >
          <Typography aria-labelledby={`${LABEL_ID}-unplaced`}>
            {unplaced.length}
          </Typography>
        </SettingRow>
      )}
    </>
  );
};

export default FreeLayoutSettings;
