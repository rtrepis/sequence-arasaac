import { Slider, Stack, Tooltip, Typography } from "@mui/material";
import StyledButton from "@/style/StyledButton";
import StyledToggleButtonGroup from "../../style/StyledToggleButtonGroup";
import {
  SettingsPanelLayout,
  SettingsActions,
  SectionTitle,
  SettingRow,
  SettingsPanelHint,
  IconToggleButton,
  SETTINGS_MAX_WIDTH,
} from "../../components/SettingsLayout";
import { FormattedMessage, useIntl } from "react-intl";
import { forwardRef, useImperativeHandle, useState } from "react";
import { SelectChangeEvent } from "@mui/material";
import {
  MdFormatAlignLeft,
  MdFormatAlignCenter,
  MdFormatAlignRight,
  MdVerticalAlignTop,
  MdVerticalAlignCenter,
  MdVerticalAlignBottom,
  MdSettingsBackupRestore,
} from "react-icons/md";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { viewSettingsActionCreator } from "@features/user-settings/store/uiSlice";
import { applyViewSettingsToAllActionCreator } from "@features/sequence/store/documentSlice";
import { DefaultSettingsPanelHandle } from "../../components/DefaultsForm/DefaultSettingsPanel";
import {
  ViewSettings,
  SequenceDirection,
  PageOrientation,
} from "../../types/ui";
import { PageSize } from "../../types/PageFormat";
import { SequenceAlignmentH, SequenceAlignmentV } from "../../types/document";
import GlobalViewControls from "../../components/ViewSequencesSettings/GlobalViewControls";
import PrintFooterSection from "../../components/ViewSequencesSettings/PrintFooterSection";
import viewMessages from "../../components/ViewSequencesSettings/ViewSequencesSettings.lang";
import ViewSettingsPreview from "./ViewSettingsPreview";
import messages from "./ViewSettingsPanel.lang";
import {
  SIZE_PICT_MIN,
  SIZE_PICT_MAX,
  SIZE_PICT_STEP,
  PICT_SPACE_MIN,
  PICT_SPACE_MAX,
  PICT_SPACE_STEP,
  VIEW_DEFAULT_SIZE_PICT,
  VIEW_DEFAULT_PICT_SPACE,
  VIEW_DEFAULT_SEQ_SPACE,
  VIEW_DEFAULT_DIRECTION,
  VIEW_DEFAULT_PAGE_SIZE,
  VIEW_DEFAULT_ORIENTATION,
  VIEW_DEFAULT_ALIGNMENT_H,
  VIEW_DEFAULT_ALIGNMENT_V,
  VIEW_DEFAULT_AUTHOR,
} from "../../configs/viewSettingsConfig";
import React from "react";

const PAGE_SIZE_MAP: Record<number, PageSize> = {
  0: "A4",
  1: "A3",
  2: "FULLSCREEN",
};
const PAGE_INDEX_MAP: Record<PageSize, 0 | 1 | 2> = {
  A4: 0,
  A3: 1,
  FULLSCREEN: 2,
};

// Prefix dels ids dels títols de fila, per lligar-los als controls amb aria-labelledby
const VIEW_PANEL_LABEL_ID = "view-settings-panel";

const ViewSettingsPanel = forwardRef<DefaultSettingsPanelHandle>(
  (_, ref): React.ReactElement => {
    const dispatch = useAppDispatch();
    const intl = useIntl();
    const reduxViewSettings = useAppSelector((store) => store.ui.viewSettings);
    const [localSettings, setLocalSettings] =
      useState<ViewSettings>(reduxViewSettings);

    useImperativeHandle(ref, () => ({
      syncToRedux: () => {
        dispatch(viewSettingsActionCreator(localSettings));
      },
    }));

    const handleResetToDefaults = () => {
      setLocalSettings({
        sizePict: VIEW_DEFAULT_SIZE_PICT,
        pictSpaceBetween: VIEW_DEFAULT_PICT_SPACE,
        sequenceSpaceBetween: VIEW_DEFAULT_SEQ_SPACE,
        direction: VIEW_DEFAULT_DIRECTION,
        pageSize: VIEW_DEFAULT_PAGE_SIZE,
        orientation: VIEW_DEFAULT_ORIENTATION,
        alignmentH: VIEW_DEFAULT_ALIGNMENT_H,
        alignmentV: VIEW_DEFAULT_ALIGNMENT_V,
        author: VIEW_DEFAULT_AUTHOR,
      });
    };

    const handlePageSizeChange = (event: SelectChangeEvent<number>) => {
      const pageSize = PAGE_SIZE_MAP[Number(event.target.value)];
      if (pageSize) setLocalSettings((prev) => ({ ...prev, pageSize }));
    };

    const handleDirectionChange = (
      _: React.MouseEvent<HTMLElement>,
      value: SequenceDirection | null,
    ) => {
      if (!value) return;
      setLocalSettings((prev) => ({ ...prev, direction: value }));
    };

    const handleSequenceSpaceChange = (_: Event, value: number | number[]) => {
      setLocalSettings((prev) => ({
        ...prev,
        sequenceSpaceBetween: value as number,
      }));
    };

    const handleOrientationChange = (orientation: PageOrientation) => {
      setLocalSettings((prev) => ({ ...prev, orientation }));
    };

    const handleAuthorChange = (value: string) => {
      setLocalSettings((prev) => ({ ...prev, author: value }));
    };

    const handleSizePict = (_: Event, value: number | number[]) => {
      setLocalSettings((prev) => ({ ...prev, sizePict: value as number }));
    };

    const handlePictSpaceBetween = (_: Event, value: number | number[]) => {
      setLocalSettings((prev) => ({
        ...prev,
        pictSpaceBetween: value as number,
      }));
    };

    const handleAlignmentH = (
      _: React.MouseEvent<HTMLElement>,
      value: SequenceAlignmentH | null,
    ) => {
      if (!value) return;
      setLocalSettings((prev) => ({ ...prev, alignmentH: value }));
    };

    const handleAlignmentV = (
      _: React.MouseEvent<HTMLElement>,
      value: SequenceAlignmentV | null,
    ) => {
      if (!value) return;
      setLocalSettings((prev) => ({ ...prev, alignmentV: value }));
    };

    const handleApply = () => {
      dispatch(viewSettingsActionCreator(localSettings));
      dispatch(
        applyViewSettingsToAllActionCreator({
          sizePict: localSettings.sizePict,
          pictSpaceBetween: localSettings.pictSpaceBetween,
          alignmentH: localSettings.alignmentH,
          alignmentV: localSettings.alignmentV,
        }),
      );
    };

    return (
      <Stack
        direction="column"
        gap={1}
        sx={{ pt: 1, maxWidth: SETTINGS_MAX_WIDTH, mx: "auto", width: "100%" }}
      >
        <SettingsPanelLayout
          preview={<ViewSettingsPreview settings={localSettings} />}
        >
          {/* Guia del tab: què s'ajusta aquí */}
          <SettingsPanelHint>
            <FormattedMessage {...messages.panelDescription} />
          </SettingsPanelHint>

          {/* Secció: format i disposició de la pàgina (controls compartits amb la vista) */}
          <SectionTitle
            title={<FormattedMessage {...messages.sectionPageFormat} />}
          >
            <GlobalViewControls
              viewSettings={localSettings}
              pageSizeIndex={PAGE_INDEX_MAP[localSettings.pageSize]}
              sequenceCount={2}
              onPageSizeChange={handlePageSizeChange}
              onDirectionChange={handleDirectionChange}
              onSequenceSpaceChange={handleSequenceSpaceChange}
              onOrientationChange={handleOrientationChange}
            />
          </SectionTitle>

          {/* Secció: mida i alineació dels pictogrames */}
          <SectionTitle
            title={<FormattedMessage {...messages.sectionPictograms} />}
          >
            <SettingRow
              title={<FormattedMessage {...viewMessages.size} />}
              labelId={`${VIEW_PANEL_LABEL_ID}-size`}
            >
              <Slider
                aria-labelledby={`${VIEW_PANEL_LABEL_ID}-size`}
                step={SIZE_PICT_STEP}
                min={SIZE_PICT_MIN}
                max={SIZE_PICT_MAX}
                value={localSettings.sizePict}
                valueLabelDisplay="auto"
                valueLabelFormat={(v) => parseFloat(v.toFixed(2))}
                onChange={handleSizePict}
              />
            </SettingRow>

            <SettingRow
              title={<FormattedMessage {...viewMessages.pictSpaceBetween} />}
              labelId={`${VIEW_PANEL_LABEL_ID}-space`}
            >
              <Slider
                aria-labelledby={`${VIEW_PANEL_LABEL_ID}-space`}
                step={PICT_SPACE_STEP}
                min={PICT_SPACE_MIN}
                max={PICT_SPACE_MAX}
                value={localSettings.pictSpaceBetween}
                valueLabelDisplay="auto"
                valueLabelFormat={(v) => parseFloat(v.toFixed(2))}
                onChange={handlePictSpaceBetween}
              />
            </SettingRow>

            <SettingRow
              title={<FormattedMessage {...viewMessages.alignmentH} />}
              control="wide"
            >
              <StyledToggleButtonGroup
                value={localSettings.alignmentH}
                exclusive
                onChange={handleAlignmentH}
              >
                <IconToggleButton
                  value="left"
                  message={viewMessages.tooltipAlignLeft}
                >
                  <MdFormatAlignLeft />
                </IconToggleButton>
                <IconToggleButton
                  value="center"
                  message={viewMessages.tooltipAlignHCenter}
                >
                  <MdFormatAlignCenter />
                </IconToggleButton>
                <IconToggleButton
                  value="right"
                  message={viewMessages.tooltipAlignRight}
                >
                  <MdFormatAlignRight />
                </IconToggleButton>
              </StyledToggleButtonGroup>
            </SettingRow>

            <SettingRow
              title={<FormattedMessage {...viewMessages.alignmentV} />}
              control="wide"
            >
              <StyledToggleButtonGroup
                value={localSettings.alignmentV}
                exclusive
                onChange={handleAlignmentV}
              >
                <IconToggleButton
                  value="top"
                  message={viewMessages.tooltipAlignTop}
                >
                  <MdVerticalAlignTop />
                </IconToggleButton>
                <IconToggleButton
                  value="center"
                  message={viewMessages.tooltipAlignVCenter}
                >
                  <MdVerticalAlignCenter />
                </IconToggleButton>
                <IconToggleButton
                  value="bottom"
                  message={viewMessages.tooltipAlignBottom}
                >
                  <MdVerticalAlignBottom />
                </IconToggleButton>
              </StyledToggleButtonGroup>
            </SettingRow>
          </SectionTitle>

          {/* Secció: el que només surt al peu del full imprès i del PDF */}
          <PrintFooterSection
            author={localSettings.author}
            onAuthorChange={handleAuthorChange}
          />

          {/* Al final i a la dreta, com el peu d'un diàleg: afecten tot el que
              hi ha a sobre. «Aplica» és la principal i per això va plena */}
          <SettingsActions
            helper={<FormattedMessage {...messages.applyHelper} />}
          >
            <Tooltip
              title={intl.formatMessage(messages.tooltipReset)}
              describeChild
            >
              <StyledButton
                color="inherit"
                endIcon={<MdSettingsBackupRestore />}
                onClick={handleResetToDefaults}
              >
                <FormattedMessage {...messages.reset} />
              </StyledButton>
            </Tooltip>
            <StyledButton variant="contained" onClick={handleApply}>
              <FormattedMessage {...messages.apply} />
            </StyledButton>
          </SettingsActions>
        </SettingsPanelLayout>
      </Stack>
    );
  },
);

ViewSettingsPanel.displayName = "ViewSettingsPanel";

export default ViewSettingsPanel;
