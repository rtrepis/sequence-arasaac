import {
  Button,
  FormGroup,
  FormLabel,
  Slider,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
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
import { ViewSettings, SequenceDirection, PageOrientation } from "../../types/ui";
import { PageSize } from "../../types/PageFormat";
import { SequenceAlignmentH, SequenceAlignmentV } from "../../types/document";
import GlobalViewControls from "../../components/ViewSequencesSettings/GlobalViewControls";
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

const PAGE_SIZE_MAP: Record<number, PageSize> = { 0: "A4", 1: "A3", 2: "FULLSCREEN" };
const PAGE_INDEX_MAP: Record<PageSize, 0 | 1 | 2> = { A4: 0, A3: 1, FULLSCREEN: 2 };

const ViewSettingsPanel = forwardRef<DefaultSettingsPanelHandle>(
  (_, ref): React.ReactElement => {
    const dispatch = useAppDispatch();
    const intl = useIntl();
    const reduxViewSettings = useAppSelector((store) => store.ui.viewSettings);
    const [localSettings, setLocalSettings] = useState<ViewSettings>(reduxViewSettings);

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
      setLocalSettings((prev) => ({ ...prev, sequenceSpaceBetween: value as number }));
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
      setLocalSettings((prev) => ({ ...prev, pictSpaceBetween: value as number }));
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
      dispatch(applyViewSettingsToAllActionCreator({
        sizePict: localSettings.sizePict,
        pictSpaceBetween: localSettings.pictSpaceBetween,
        alignmentH: localSettings.alignmentH,
        alignmentV: localSettings.alignmentV,
      }));
    };


    return (
      <Stack direction="column" gap={1} sx={{ pt: 1, maxWidth: 700, mx: "auto", width: "100%" }}>
        <Typography variant="body2" color="text.secondary">
          <FormattedMessage {...messages.panelDescription} />
        </Typography>

        <Stack
          direction={{ xs: "column", md: "row" }}
          gap={4}
          alignItems="flex-start"
          marginTop={1}
        >
          <Stack
            sx={{
              position: { xs: "sticky", md: "static" },
              top: { xs: 0 },
              zIndex: { xs: 10, md: "auto" },
            }}
          >
            <ViewSettingsPreview settings={localSettings} />
          </Stack>

          <Stack flex={1} gap={1}>
            <GlobalViewControls
              viewSettings={localSettings}
              author={localSettings.author}
              pageSizeIndex={PAGE_INDEX_MAP[localSettings.pageSize]}
              sequenceCount={2}
              onPageSizeChange={handlePageSizeChange}
              onDirectionChange={handleDirectionChange}
              onSequenceSpaceChange={handleSequenceSpaceChange}
              onAuthorChange={handleAuthorChange}
              onOrientationChange={handleOrientationChange}
            >
              <FormGroup>
                <FormLabel>
                  <FormattedMessage {...viewMessages.size} />
                  <Slider
                    step={SIZE_PICT_STEP}
                    min={SIZE_PICT_MIN}
                    max={SIZE_PICT_MAX}
                    value={localSettings.sizePict}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(v) => parseFloat(v.toFixed(2))}
                    onChange={handleSizePict}
                  />
                </FormLabel>
              </FormGroup>

              <FormGroup>
                <FormLabel>
                  <FormattedMessage {...viewMessages.pictSpaceBetween} />
                  <Slider
                    step={PICT_SPACE_STEP}
                    min={PICT_SPACE_MIN}
                    max={PICT_SPACE_MAX}
                    value={localSettings.pictSpaceBetween}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(v) => parseFloat(v.toFixed(2))}
                    onChange={handlePictSpaceBetween}
                  />
                </FormLabel>
              </FormGroup>

              <FormGroup>
                <FormLabel component="legend">
                  <FormattedMessage {...viewMessages.alignmentH} />
                </FormLabel>
                <ToggleButtonGroup
                  value={localSettings.alignmentH}
                  exclusive
                  onChange={handleAlignmentH}
                  size="small"
                >
                  <Tooltip title={intl.formatMessage(viewMessages.tooltipAlignLeft)}>
                    <ToggleButton value="left" aria-label="left">
                      <MdFormatAlignLeft />
                    </ToggleButton>
                  </Tooltip>
                  <Tooltip title={intl.formatMessage(viewMessages.tooltipAlignHCenter)}>
                    <ToggleButton value="center" aria-label="center">
                      <MdFormatAlignCenter />
                    </ToggleButton>
                  </Tooltip>
                  <Tooltip title={intl.formatMessage(viewMessages.tooltipAlignRight)}>
                    <ToggleButton value="right" aria-label="right">
                      <MdFormatAlignRight />
                    </ToggleButton>
                  </Tooltip>
                </ToggleButtonGroup>
              </FormGroup>

              <FormGroup>
                <FormLabel component="legend">
                  <FormattedMessage {...viewMessages.alignmentV} />
                </FormLabel>
                <ToggleButtonGroup
                  value={localSettings.alignmentV}
                  exclusive
                  onChange={handleAlignmentV}
                  size="small"
                >
                  <Tooltip title={intl.formatMessage(viewMessages.tooltipAlignTop)}>
                    <ToggleButton value="top" aria-label="top">
                      <MdVerticalAlignTop />
                    </ToggleButton>
                  </Tooltip>
                  <Tooltip title={intl.formatMessage(viewMessages.tooltipAlignVCenter)}>
                    <ToggleButton value="center" aria-label="center">
                      <MdVerticalAlignCenter />
                    </ToggleButton>
                  </Tooltip>
                  <Tooltip title={intl.formatMessage(viewMessages.tooltipAlignBottom)}>
                    <ToggleButton value="bottom" aria-label="bottom">
                      <MdVerticalAlignBottom />
                    </ToggleButton>
                  </Tooltip>
                </ToggleButtonGroup>
              </FormGroup>
            </GlobalViewControls>

            <Stack direction="row" gap={1} alignItems="flex-start" sx={{ mt: 1 }}>
              <Stack gap={0.5}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleApply}
                  sx={{ alignSelf: "flex-start" }}
                >
                  <FormattedMessage {...messages.apply} />
                </Button>
                <Typography variant="caption" color="text.secondary">
                  <FormattedMessage {...messages.applyHelper} />
                </Typography>
              </Stack>
              <Tooltip title={intl.formatMessage(messages.tooltipReset)}>
                <Button
                  variant="text"
                  color="inherit"
                  endIcon={<MdSettingsBackupRestore />}
                  onClick={handleResetToDefaults}
                  sx={{ alignSelf: "flex-start" }}
                >
                  <FormattedMessage {...messages.reset} />
                </Button>
              </Tooltip>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    );
  }
);

ViewSettingsPanel.displayName = "ViewSettingsPanel";

export default ViewSettingsPanel;
