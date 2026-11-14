import React from "react";
import { Chip, MenuItem, Select, Slider } from "@mui/material";
import {
  MdCropPortrait,
  MdOutlineDashboard,
  MdTableRows,
  MdViewColumn,
  MdViewStream,
} from "react-icons/md";
import { FormattedMessage, useIntl } from "react-intl";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import type { SheetMode } from "@/types/document";
import StyledToggleButtonGroup from "@/style/StyledToggleButtonGroup";
import type { SequenceDirection } from "@/types/ui";
import { IconToggleButton, SettingRow } from "@/components/SettingsLayout";
import SettingsLevel from "@components/ViewSequencesSettings/SettingsLevel";
import levelMessages from "@components/ViewSequencesSettings/ViewLevels.lang";
import viewMessages from "@components/ViewSequencesSettings/ViewSequencesSettings.lang";
import { selectDocumentStyle } from "@features/sequence/style/styleSelectors";
import { isBoxed } from "@features/free-layout/model/placement";
import {
  Arrangement,
  LayoutTemplate,
  SHAPED_TEMPLATES,
  arrangementOf,
  arrangementTemplate,
} from "@features/free-layout/model/templates";
import {
  selectPageLayout,
  selectPages,
  setSheetDirectionThunk,
  setSheetGapThunk,
} from "@features/free-layout/store/freeLayoutThunks";
import { useViewSelection } from "@features/free-layout/hooks/useViewSelection";
import { useApplyTemplate } from "@features/free-layout/hooks/useApplyTemplate";
import {
  Disposition,
  MAX_LINES,
  useSheetDisposition,
} from "@features/free-layout/hooks/useSheetDisposition";
import { TEMPLATE_NAMES } from "@features/free-layout/components/FreeLayoutPages/templateNames";
import TemplatePicker from "@features/free-layout/components/TemplatePicker";
import pageMessages from "@features/free-layout/components/FreeLayoutPages/FreeLayoutPages.lang";
import messages from "./ViewLevels.lang";

/** L'`id` del nivell «Pàgina»: les molles hi porten. */
export const VIEW_PAGE_LEVEL_ID = "view-level-page";

/** La icona del nivell: un full. */
export const PageIcon = (): React.ReactElement => <MdCropPortrait />;

/** Prefix dels ids dels títols de fila, per lligar-los als controls. */
const LABEL_ID = "view-level-page";

/** La disposició de sempre, quan el document encara no té pàgines pròpies. */
export interface ImplicitPage {
  direction: SequenceDirection;
  onDirectionChange: (direction: SequenceDirection) => void;
  gap: number;
  onGapChange: (gap: number) => void;
}

interface PageLevelProps {
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  /** Sense pàgines pròpies, la direcció i l'espai són els de sempre */
  implicit: ImplicitPage;
  /** La pantalla completa no té mil·límetres: no s'hi pot treballar en blocs */
  fullscreen: boolean;
}

/**
 * El nivell «Pàgina N» de la columna de la vista (R5, R8), que segueix la
 * pàgina que es veu més o la del bloc seleccionat. Cada pàgina tria com
 * treballa:
 * - **Contínua**, com sempre: les seqüències una darrere l'altra, amb la
 *   direcció i l'espai entre seqüències.
 * - **En blocs**: cada seqüència és un bloc amb el seu lloc a la pàgina,
 *   repartits en X columnes, Y files o una plantilla.
 * Totes dues tenen els pictogrames (la mateixa configuració a tots els blocs o
 * cadascun la seva) i el menú de la pàgina, el mateix que a la capçalera (P3).
 */
const PageLevel = ({
  expanded,
  onExpandedChange,
  implicit,
  fullscreen,
}: PageLevelProps): React.ReactElement => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const pages = useAppSelector(selectPages);
  const layout = useAppSelector(selectPageLayout);
  const documentGap =
    useAppSelector(selectDocumentStyle).view.sequenceSpaceBetween;
  const { activePage, setTemplatePreview } = useViewSelection();

  const sheet = pages?.sheets[activePage];
  const total = pages?.sheets.length ?? 1;
  const index = sheet ? activePage : 0;
  const number = index + 1;
  const mode: SheetMode = sheet?.mode ?? "auto";
  const direction = sheet
    ? (sheet.direction ?? layout.direction ?? "row")
    : implicit.direction;
  const gap = sheet ? (sheet.sequenceGap ?? documentGap) : implicit.gap;
  const count = sheet ? sheet.placements.filter(isBoxed).length : 0;
  const arrangement: Arrangement = arrangementOf(sheet?.template);

  const templateName = (id: string | undefined): string => {
    if (id && TEMPLATE_NAMES[id]) return intl.formatMessage(TEMPLATE_NAMES[id]);
    const grid = /^grid-(\d+)x(\d+)$/.exec(id ?? "");
    if (grid)
      return intl.formatMessage(messages.gridName, {
        columns: Number(grid[1]),
        rows: Number(grid[2]),
      });
    return intl.formatMessage(messages.noTemplate);
  };
  const arrangementName =
    arrangement.kind === "template"
      ? templateName(arrangement.id)
      : intl.formatMessage(messages.arrangementSummary, {
          kind: arrangement.kind,
          n: arrangement.n,
        });
  const summary =
    mode === "auto"
      ? intl.formatMessage(
          direction === "row"
            ? levelMessages.directionRowShort
            : levelMessages.directionColumnShort,
        )
      : intl.formatMessage(messages.blocksSummary, {
          arrangement: arrangementName,
          count,
        });

  // Aplicar una plantilla: si no hi caben tots els blocs, abans es pregunta
  const { apply: applyWithWarning, dialog: lossDialog } =
    useApplyTemplate(index);
  const applyTemplate = (template: LayoutTemplate | undefined) => {
    // Les guies de la previsualització ja no fan falta
    if (!template) return;
    setTemplatePreview(null);
    applyWithWarning(template);
  };
  // La disposició: simple, o en blocs per columnes, per files o lliures
  const { disposition, change: changeDisposition } = useSheetDisposition(
    index,
    applyTemplate,
  );

  return (
    <SettingsLevel
      id={VIEW_PAGE_LEVEL_ID}
      icon={<PageIcon />}
      kind={<FormattedMessage {...levelMessages.kindPage} />}
      title={intl.formatMessage(pageMessages.pageLabel, { number, total })}
      scope={intl.formatMessage(levelMessages.pageScope, { number, total })}
      summary={summary}
      expanded={expanded}
      onExpandedChange={onExpandedChange}
    >
      {/* Com treballa la pàgina. La pantalla completa no té mil·límetres */}
      {!fullscreen && (
        <SettingRow
          title={
            <>
              <FormattedMessage {...messages.mode} />
              <Chip
                label={intl.formatMessage(messages.newTag)}
                size="small"
                color="primary"
                sx={{ marginInlineStart: 1, verticalAlign: "middle" }}
              />
            </>
          }
          labelId={`${LABEL_ID}-mode`}
          helperId={`${LABEL_ID}-mode-helper`}
          helper={
            <FormattedMessage
              {...(mode === "auto"
                ? messages.modeAutoHelp
                : messages.modeBlocksHelp)}
            />
          }
          control="wide"
        >
          <StyledToggleButtonGroup
            value={disposition}
            exclusive
            onChange={(_, value: Disposition | null) =>
              value && changeDisposition(value)
            }
            aria-labelledby={`${LABEL_ID}-mode`}
            aria-describedby={`${LABEL_ID}-mode-helper`}
          >
            <IconToggleButton value="auto" message={messages.modeAuto}>
              <MdViewStream />
            </IconToggleButton>
            <IconToggleButton value="columns" message={messages.byColumns}>
              <MdViewColumn />
            </IconToggleButton>
            <IconToggleButton value="rows" message={messages.byRows}>
              <MdTableRows />
            </IconToggleButton>
            <IconToggleButton value="free" message={messages.byFree}>
              <MdOutlineDashboard />
            </IconToggleButton>
          </StyledToggleButtonGroup>
        </SettingRow>
      )}

      {mode === "auto" && (
        <>
          <SettingRow
            title={<FormattedMessage {...viewMessages.direction} />}
            labelId={`${LABEL_ID}-direction`}
            control="wide"
          >
            <StyledToggleButtonGroup
              value={direction}
              exclusive
              onChange={(_, value: SequenceDirection | null) => {
                if (!value) return;
                if (sheet) dispatch(setSheetDirectionThunk(index, value));
                else implicit.onDirectionChange(value);
              }}
              aria-labelledby={`${LABEL_ID}-direction`}
            >
              <IconToggleButton
                value="row"
                message={viewMessages.tooltipDirectionRow}
              >
                <MdTableRows />
              </IconToggleButton>
              <IconToggleButton
                value="column"
                message={viewMessages.tooltipDirectionColumn}
              >
                <MdViewColumn />
              </IconToggleButton>
            </StyledToggleButtonGroup>
          </SettingRow>

          <SettingRow
            title={<FormattedMessage {...viewMessages.sequenceSpaceBetween} />}
            labelId={`${LABEL_ID}-gap`}
          >
            <Slider
              step={0.5}
              min={0}
              max={10}
              value={gap}
              valueLabelDisplay="auto"
              onChange={(_, value) => {
                const next = Array.isArray(value) ? value[0] : value;
                if (sheet) dispatch(setSheetGapThunk(index, next));
                else implicit.onGapChange(next);
              }}
              aria-labelledby={`${LABEL_ID}-gap`}
            />
          </SettingRow>
        </>
      )}

      {mode === "template" && (
        <>
          {arrangement.kind !== "template" && (
            <SettingRow
              title={
                <FormattedMessage
                  {...(arrangement.kind === "columns"
                    ? messages.columnCount
                    : messages.rowCount)}
                />
              }
              labelId={`${LABEL_ID}-lines`}
            >
              <Select<number>
                value={arrangement.n}
                onChange={(event) =>
                  applyTemplate(
                    arrangementTemplate(
                      arrangement.kind as "columns" | "rows",
                      Number(event.target.value),
                      count,
                    ),
                  )
                }
                size="small"
                fullWidth
                labelId={`${LABEL_ID}-lines`}
              >
                {Array.from(
                  { length: Math.max(MAX_LINES, arrangement.n) },
                  (_, i) => i + 1,
                ).map((n) => (
                  <MenuItem key={n} value={n}>
                    {n}
                  </MenuItem>
                ))}
              </Select>
            </SettingRow>
          )}

          {/* Les plantilles, sempre a sota: aplicar-ne una és un punt de
              partida, i la pàgina queda lliure amb els seus espais */}
          <SettingRow
            title={<FormattedMessage {...messages.templates} />}
            labelId={`${LABEL_ID}-template`}
            helperId={`${LABEL_ID}-template-helper`}
            helper={<FormattedMessage {...messages.templateHelp} />}
            control="block"
          >
            <TemplatePicker
              templates={SHAPED_TEMPLATES}
              value={
                arrangement.kind === "template" ? arrangement.id : undefined
              }
              landscape={(layout.orientation ?? "landscape") === "landscape"}
              labelId={`${LABEL_ID}-template`}
              helperId={`${LABEL_ID}-template-helper`}
              onApply={applyTemplate}
              onPreview={(template) =>
                setTemplatePreview(
                  template ? { sheetIndex: index, template } : null,
                )
              }
            />
          </SettingRow>
        </>
      )}

      {/* Les accions de la pàgina (afegir, plantilla, duplicar…) són al seu
          menú «⋯», damunt de la previsualització: no a la columna */}
      {lossDialog}
    </SettingsLevel>
  );
};

export default PageLevel;
