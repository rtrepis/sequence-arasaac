// Aplicar una plantilla a una pàgina, des de la columna o des del menú de la
// pàgina. Una plantilla sempre es pot triar (R4): si no hi caben tots els
// blocs, abans d'aplicar-la es diu quins sortiran de la pàgina, i es demana.
import React, { useState } from "react";
import { useIntl } from "react-intl";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import ConfirmDialog from "@components/ConfirmDialog/ConfirmDialog";
import { findPlacement } from "../model/sheets";
import { LayoutTemplate, overflowOf } from "../model/templates";
import { applyTemplateThunk, selectPages } from "../store/freeLayoutThunks";
import {
  TEMPLATE_NAMES,
  TEMPLATE_SLOT_TEXTS,
} from "../components/FreeLayoutPages/templateNames";
import { useSequenceName } from "../components/FreeLayoutPages/useSequenceName";
import { useTextBlockName } from "../components/FreeLayoutPages/TextBlock";
import messages from "../components/ViewLevels/ViewLevels.lang";

interface ApplyTemplate {
  /** Aplica la plantilla, o pregunta abans si se'n perdrien blocs */
  apply: (template: LayoutTemplate) => void;
  /** El diàleg de confirmació: qui fa servir el hook l'ha de pintar */
  dialog: React.ReactElement;
}

export const useApplyTemplate = (sheetIndex: number): ApplyTemplate => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const pages = useAppSelector(selectPages);
  const sequenceName = useSequenceName();
  const textName = useTextBlockName();
  const [pending, setPending] = useState<{
    template: LayoutTemplate;
    names: string[];
  } | null>(null);

  // El text amb què neixen els rètols d'una plantilla, a l'idioma de la interfície
  const labelText = (label: string): string =>
    TEMPLATE_SLOT_TEXTS[label]
      ? intl.formatMessage(TEMPLATE_SLOT_TEXTS[label])
      : "";
  // Torna a repartir la pàgina: surt el snackbar amb «Desfés»
  const run = (template: LayoutTemplate) =>
    dispatch(applyTemplateThunk(sheetIndex, template, labelText));

  const apply = (template: LayoutTemplate) => {
    const sheet = pages?.sheets[sheetIndex];
    const lost = sheet ? overflowOf(template, sheet.placements) : [];
    if (lost.length === 0) {
      run(template);
      return;
    }
    const names = lost.flatMap((id) => {
      const found = pages && findPlacement(pages, id);
      if (!found) return [];
      if (found.placement.kind === "sequence")
        return [sequenceName(found.placement.sequenceKey)];
      if (found.placement.kind === "text")
        return [textName(found.placement.text)];
      return [];
    });
    setPending({ template, names });
  };

  const name = pending
    ? intl.formatMessage(TEMPLATE_NAMES[pending.template.id])
    : "";
  const dialog = (
    <ConfirmDialog
      open={pending !== null}
      title={intl.formatMessage(messages.templateLossTitle, {
        name,
        number: sheetIndex + 1,
      })}
      body={intl.formatMessage(messages.templateLossBody, {
        count: pending?.names.length ?? 0,
        blocks: intl.formatList(pending?.names ?? [], { type: "conjunction" }),
      })}
      confirmLabel={intl.formatMessage(messages.templateLossConfirm)}
      onConfirm={() => {
        if (pending) run(pending.template);
        setPending(null);
      }}
      onCancel={() => setPending(null)}
    />
  );

  return { apply, dialog };
};
