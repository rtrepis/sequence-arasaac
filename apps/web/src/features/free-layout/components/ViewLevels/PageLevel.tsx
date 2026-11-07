import React from "react";
import { MenuItem, Select, Typography } from "@mui/material";
import { MdCropPortrait } from "react-icons/md";
import { FormattedMessage, useIntl } from "react-intl";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { SettingRow } from "@/components/SettingsLayout";
import SettingsLevel from "@components/ViewSequencesSettings/SettingsLevel";
import levelMessages from "@components/ViewSequencesSettings/ViewLevels.lang";
import { templatesFor } from "@features/free-layout/model/templates";
import {
  applyTemplateThunk,
  selectPages,
} from "@features/free-layout/store/freeLayoutThunks";
import { useViewSelection } from "@features/free-layout/hooks/useViewSelection";
import PageActionsMenu from "@features/free-layout/components/FreeLayoutPages/PageActionsMenu";
import { TEMPLATE_NAMES } from "@features/free-layout/components/FreeLayoutPages/templateNames";
import pageMessages from "@features/free-layout/components/FreeLayoutPages/FreeLayoutPages.lang";
import PagePictograms from "./PagePictograms";
import messages from "./ViewLevels.lang";

/** L'`id` del nivell «Pàgina»: les molles hi porten. */
export const VIEW_PAGE_LEVEL_ID = "view-level-page";

/** La icona del nivell: un full. */
export const PageIcon = (): React.ReactElement => <MdCropPortrait />;

/** Prefix dels ids dels títols de fila, per lligar-los als controls. */
const LABEL_ID = "view-level-page";

interface PageLevelProps {
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
}

/**
 * El nivell «Pàgina N» de la columna de la vista, en un document amb pàgines
 * (R5, R8): segueix la pàgina que es veu més, o la del bloc seleccionat. Hi
 * ha la plantilla de la pàgina i el seu menú, el mateix que a la capçalera de
 * la pàgina, al full (P3).
 */
const PageLevel = ({
  expanded,
  onExpandedChange,
}: PageLevelProps): React.ReactElement | null => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const pages = useAppSelector(selectPages);
  const { activePage } = useViewSelection();
  const sheet = pages?.sheets[activePage];
  if (!pages || !sheet) return null;

  const total = pages.sheets.length;
  const number = activePage + 1;
  const count = sheet.placements.length;
  const templates = templatesFor(count);
  const current = templates.some(({ id }) => id === sheet.template)
    ? (sheet.template ?? "")
    : "";
  const templateName = (id: string) =>
    TEMPLATE_NAMES[id]
      ? intl.formatMessage(TEMPLATE_NAMES[id])
      : intl.formatMessage(messages.noTemplate);

  return (
    <SettingsLevel
      id={VIEW_PAGE_LEVEL_ID}
      icon={<PageIcon />}
      kind={<FormattedMessage {...levelMessages.kindPage} />}
      title={intl.formatMessage(pageMessages.pageLabel, { number, total })}
      scope={intl.formatMessage(levelMessages.pageScope, { number, total })}
      summary={intl.formatMessage(messages.pageSummary, {
        template: templateName(current),
        count,
      })}
      expanded={expanded}
      onExpandedChange={onExpandedChange}
    >
      {count > 0 && (
        <SettingRow
          title={<FormattedMessage {...pageMessages.template} />}
          labelId={`${LABEL_ID}-template`}
        >
          {templates.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              <FormattedMessage {...pageMessages.templateNone} />
            </Typography>
          ) : (
            <Select<string>
              value={current}
              displayEmpty
              renderValue={templateName}
              onChange={(event) => {
                const template = templates.find(
                  ({ id }) => id === event.target.value,
                );
                // Substitueix els retocs de la pàgina: surt el snackbar amb «Desfés»
                if (template)
                  dispatch(applyTemplateThunk(activePage, template));
              }}
              size="small"
              fullWidth
              labelId={`${LABEL_ID}-template`}
            >
              {templates.map(({ id }) => (
                <MenuItem key={id} value={id}>
                  {templateName(id)}
                </MenuItem>
              ))}
            </Select>
          )}
        </SettingRow>
      )}

      {/* La mateixa mida, espai i alineació a tots els blocs, o cadascun la seva */}
      <PagePictograms sheetIndex={activePage} />

      <SettingRow
        title={<FormattedMessage {...messages.pageActions} />}
        control="compact"
      >
        <PageActionsMenu sheetIndex={activePage} sheetCount={total} />
      </SettingRow>
    </SettingsLevel>
  );
};

export default PageLevel;
