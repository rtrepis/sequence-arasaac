import {
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Slider,
  Tooltip,
} from "@mui/material";
import StyledButton from "@/style/StyledButton";
import StyledToggleButtonGroup from "@/style/StyledToggleButtonGroup";
import {
  SettingsPanelLayout,
  SettingsActions,
  SectionTitle,
  SettingRow,
  SettingsPanelHint,
  IconToggleButton,
} from "@components/SettingsLayout";
import { FormattedMessage, useIntl } from "react-intl";
import { forwardRef, useImperativeHandle, useState } from "react";
import {
  MdFormatAlignLeft,
  MdFormatAlignCenter,
  MdFormatAlignRight,
  MdVerticalAlignTop,
  MdVerticalAlignCenter,
  MdVerticalAlignBottom,
  MdSettingsBackupRestore,
} from "react-icons/md";
import { useAppDispatch, useAppSelector } from "@app/hooks";
import { viewSettingsActionCreator } from "@features/user-settings/store/uiSlice";
import { DefaultSettingsPanelHandle } from "../DefaultSettingsPanel/DefaultSettingsPanel";
import {
  ViewSettings,
  SequenceDirection,
  PageOrientation,
  PageDisposition,
} from "@/types/ui";
import { PageSize, regionalPaperSize } from "@features/print/utils/pageFormat";
import { SequenceAlignmentH, SequenceAlignmentV } from "@/types/document";
import GlobalViewControls from "@components/ViewSequencesSettings/GlobalViewControls";
import PrintFooterSection from "@components/ViewSequencesSettings/PrintFooterSection";
import viewMessages from "@components/ViewSequencesSettings/ViewSequencesSettings.lang";
import DispositionToggle from "@features/free-layout/components/DispositionToggle/DispositionToggle";
import levelMessages from "@features/free-layout/components/ViewLevels/ViewLevels.lang";
import pageMessages from "@features/free-layout/components/FreeLayoutPages/FreeLayoutPages.lang";
import { previewSequenceColors } from "@/style/palette";
import ViewSettingsPreview, {
  PREVIEW_SEQUENCE_LENGTHS,
} from "./ViewSettingsPreview";
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
  VIEW_DEFAULT_ORIENTATION,
  VIEW_DEFAULT_ALIGNMENT_H,
  VIEW_DEFAULT_ALIGNMENT_V,
  VIEW_DEFAULT_LICENCE,
  VIEW_DEFAULT_AUTHOR,
  VIEW_DEFAULT_DISPOSITION,
} from "@/configs/viewSettingsConfig";
import React from "react";

// Prefix dels ids dels títols de fila, per lligar-los als controls amb aria-labelledby
const VIEW_PANEL_LABEL_ID = "view-settings-panel";

const ViewSettingsPanel = forwardRef<DefaultSettingsPanelHandle>(
  (_, ref): React.ReactElement => {
    const dispatch = useAppDispatch();
    const intl = useIntl();
    const reduxViewSettings = useAppSelector((store) => store.ui.viewSettings);
    const [localSettings, setLocalSettings] =
      useState<ViewSettings>(reduxViewSettings);
    // Quines seqüències de la mostra es veuen. Només és de la mostra: no es desa
    const [shown, setShown] = useState<boolean[]>(
      PREVIEW_SEQUENCE_LENGTHS.map(() => true),
    );

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
        // El paper per defecte és el de cada dia a la regió de qui l'usa
        pageSize: regionalPaperSize(navigator.languages),
        orientation: VIEW_DEFAULT_ORIENTATION,
        alignmentH: VIEW_DEFAULT_ALIGNMENT_H,
        alignmentV: VIEW_DEFAULT_ALIGNMENT_V,
        author: VIEW_DEFAULT_AUTHOR,
        licence: VIEW_DEFAULT_LICENCE,
        disposition: VIEW_DEFAULT_DISPOSITION,
      });
    };

    // Sense valor (el que ja estava desat), simple
    const disposition: PageDisposition = localSettings.disposition ?? "auto";
    const simple = disposition === "auto";

    const handlePageSizeChange = (pageSize: PageSize) => {
      setLocalSettings((prev) => ({ ...prev, pageSize }));
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

    return (
      <SettingsPanelLayout
        preview={<ViewSettingsPreview settings={localSettings} shown={shown} />}
        previewAside={
          <FormGroup aria-label={intl.formatMessage(messages.previewSequences)}>
            {PREVIEW_SEQUENCE_LENGTHS.map((_, index) => (
              <FormControlLabel
                key={index}
                control={
                  <Checkbox
                    checked={shown[index]}
                    onChange={(_, checked) =>
                      setShown((prev) =>
                        prev.map((value, i) => (i === index ? checked : value)),
                      )
                    }
                  />
                }
                label={
                  <Box
                    component="span"
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    {/* El color de la seqüència a la mostra */}
                    <Box
                      component="span"
                      aria-hidden
                      sx={{
                        width: 14,
                        height: 14,
                        borderRadius: "3px",
                        backgroundColor: previewSequenceColors[index],
                      }}
                    />
                    {intl.formatMessage(pageMessages.sequenceName, {
                      number: index + 1,
                    })}
                  </Box>
                }
              />
            ))}
          </FormGroup>
        }
        hint={
          // Guia del tab: què s'ajusta aquí
          <SettingsPanelHint>
            <FormattedMessage {...messages.panelDescription} />
          </SettingsPanelHint>
        }
      >
        {/* Secció: format i disposició de la pàgina (controls compartits amb la vista) */}
        <SectionTitle
          title={<FormattedMessage {...messages.sectionPageFormat} />}
        >
          <GlobalViewControls
            viewSettings={localSettings}
            pageSize={localSettings.pageSize}
            // La direcció i l'espai entre seqüències només són d'una
            // pàgina simple
            sequenceCount={simple ? 2 : 1}
            showDirection={simple}
            onPageSizeChange={handlePageSizeChange}
            onDirectionChange={handleDirectionChange}
            onSequenceSpaceChange={handleSequenceSpaceChange}
            onOrientationChange={handleOrientationChange}
            afterOrientation={
              <SettingRow
                title={<FormattedMessage {...levelMessages.mode} />}
                labelId={`${VIEW_PANEL_LABEL_ID}-disposition`}
                helperId={`${VIEW_PANEL_LABEL_ID}-disposition-helper`}
                helper={<FormattedMessage {...messages.dispositionHelp} />}
                control="wrap"
              >
                <DispositionToggle
                  value={disposition}
                  onChange={(next) =>
                    setLocalSettings((prev) => ({
                      ...prev,
                      disposition: next,
                    }))
                  }
                  labelId={`${VIEW_PANEL_LABEL_ID}-disposition`}
                  helperId={`${VIEW_PANEL_LABEL_ID}-disposition-helper`}
                />
              </SettingRow>
            }
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
          licence={localSettings.licence}
          onLicenceChange={(value) =>
            setLocalSettings((prev) => ({ ...prev, licence: value }))
          }
        />

        {/* Al final i a la dreta, com el peu d'un diàleg. Només hi ha
              «Restaura»: aquests valors van cap als documents nous, i un
              document obert no en rep res (els estils van en una sola
              direcció, de la configuració cap al document, R10 i R11) */}
        <SettingsActions>
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
        </SettingsActions>
      </SettingsPanelLayout>
    );
  },
);

ViewSettingsPanel.displayName = "ViewSettingsPanel";

export default ViewSettingsPanel;
