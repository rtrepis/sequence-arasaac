import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Divider,
  FormControlLabel,
  FormGroup,
  FormLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Slider,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { useCallback, useState } from "react";
import NotPrint from "../utils/NotPrint/NotPrint";
import { AiFillPrinter, AiOutlineFullscreen } from "react-icons/ai";
import {
  MdExpandMore,
  MdFormatAlignLeft,
  MdFormatAlignCenter,
  MdFormatAlignRight,
  MdVerticalAlignTop,
  MdVerticalAlignCenter,
  MdVerticalAlignBottom,
  MdScreenRotation,
  MdTableRows,
  MdViewColumn,
} from "react-icons/md";
import { FormattedMessage, useIntl } from "react-intl";
import messages from "./ViewSequencesSettings.lang";
import useWindowResize from "@/hooks/useWindowResize";
import React from "react";
import { trackEvent } from "@/hooks/usePageTracking";
import { usePageFormat } from "@/hooks/usePageFormat";
import {
  useScaleCalculator,
  usePrintDimensions,
} from "@/hooks/useScaleCalculator";
import { useFullscreen } from "@/hooks/useFullScreen";
import { useViewManager, useAuthorManager } from "@/hooks/useViewManager";
import { useAppSelector, useAppDispatch } from "@/app/hooks";
import { usePrintStyles, printWithOrientation } from "@/hooks/usePrintStyles";
import { ViewSettings, SequenceDirection } from "@/types/ui";
import { SequenceViewSettings, SequenceAlignment } from "@/types/document";
import {
  updateSequenceViewSettingsActionCreator,
  applyViewSettingsToAllActionCreator,
} from "@/app/slice/documentSlice";

interface ViewSequencesSettingsChildrenProps {
  viewSettings: ViewSettings;
  sequenceViewSettings: { [key: number]: SequenceViewSettings };
  scale: number;
  author: string;
}

interface ViewSequencesSettingsProps {
  children: (
    props: ViewSequencesSettingsChildrenProps,
  ) => React.ReactElement | React.ReactElement[];
}

/**
 * Mapatge d'alignment a justifyContent CSS
 */
const ALIGNMENT_TO_JUSTIFY: Record<SequenceAlignment, string> = {
  left: "flex-start",
  center: "center",
  right: "flex-end",
};

/**
 * Component refactoritzat per gestionar la configuració de visualització de seqüències
 */
const ViewSequencesSettings = ({
  children,
}: ViewSequencesSettingsProps): React.ReactElement => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const [screenWidth, screenHeight] = useWindowResize();

  // Obtenir configuració des de Redux
  const initialViewSettings = useAppSelector((state) => state.ui.viewSettings);
  const sequenceViewSettings = useAppSelector(
    (state) => state.document.viewSettings,
  );
  const sequenceKeys = useAppSelector((state) =>
    Object.keys(state.document.content).map(Number),
  );

  // Estat local: mode aplicar a totes vs individual
  const [applyAll, setApplyAll] = useState(true);
  // Acordió expandit: només un a la vegada (null = tots tancats)
  const [expandedAccordion, setExpandedAccordion] = useState<number | null>(
    sequenceKeys[0] ?? 0,
  );

  // Gestió del format de pàgina
  const {
    pageFormat,
    pageSizeIndex,
    isLandscape,
    isFullscreen,
    setPageSizeByIndex,
    toggleOrientation,
  } = usePageFormat({
    initialSize: "A4",
    initialOrientation: "landscape",
  });

  // Gestió de la configuració de visualització global (sequenceSpaceBetween)
  const { viewSettings, updateViewSetting, persistViewSettings } =
    useViewManager({
      initialViewSettings,
    });

  // Gestió de l'autor
  const { author, updateAuthor } = useAuthorManager();

  // Càlculs d'escala
  const {
    displayWidth,
    displayHeight,
    scale: calculatedScale,
  } = useScaleCalculator(pageFormat, screenWidth, screenHeight);

  // Dimensions d'impressió
  const printDimensions = usePrintDimensions(pageFormat);

  // Gestió de fullscreen
  const {
    isFullscreen: isInFullscreen,
    enterFullscreen,
    currentScale,
  } = useFullscreen({
    onEnter: () => {
      trackEvent({
        event: "full-screen-view",
        event_category: "View",
        event_label: "Full Screen",
        value: `sizePict_${viewSettings.sizePict}`,
      });
    },
    scale: 0.82,
  });

  // Gestió dels estils d'impressió dinàmics
  usePrintStyles(pageFormat);

  // Determinar l'escala activa
  const activeScale = isInFullscreen ? currentScale : calculatedScale;

  /**
   * Handler per expandir/col·lapsar un acordió (només un obert a la vegada)
   */
  const handleAccordionToggle = useCallback(
    (key: number) => (_: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedAccordion(isExpanded ? key : null);
    },
    [],
  );

  /**
   * Handler per canviar el switch apply-all
   * Quan es desactiva, obrir tots els acordions
   * Quan s'activa, tancar tots menys el primer
   */
  const handleApplyAllChange = useCallback(
    (_: React.SyntheticEvent, checked: boolean) => {
      setApplyAll(checked);
      // Obrir el primer acordió en ambdós casos
      setExpandedAccordion(sequenceKeys[0] ?? 0);
    },
    [sequenceKeys],
  );

  /**
   * Handler per canviar sizePict o pictSpaceBetween per seqüència
   */
  const handleSequenceSliderChange = useCallback(
    (seqKey: number) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (event: any, value: number | number[]) => {
        const name = event.target?.name as
          | keyof SequenceViewSettings
          | undefined;
        if (!name) return;

        if (applyAll) {
          dispatch(
            applyViewSettingsToAllActionCreator({ [name]: value as number }),
          );
        } else {
          dispatch(
            updateSequenceViewSettingsActionCreator({
              key: seqKey,
              settings: { [name]: value as number },
            }),
          );
        }
      },
    [applyAll, dispatch],
  );

  /**
   * Handler per canviar l'alineació d'una seqüència
   */
  const handleAlignmentChange = useCallback(
    (seqKey: number) =>
      (
        _: React.MouseEvent<HTMLElement>,
        newAlignment: SequenceAlignment | null,
      ) => {
        if (!newAlignment) return;

        if (applyAll) {
          dispatch(
            applyViewSettingsToAllActionCreator({ alignment: newAlignment }),
          );
        } else {
          dispatch(
            updateSequenceViewSettingsActionCreator({
              key: seqKey,
              settings: { alignment: newAlignment },
            }),
          );
        }
      },
    [applyAll, dispatch],
  );

  /**
   * Handler per canviar la direcció del contenidor de seqüències (global)
   */
  const handleDirectionChange = useCallback(
    (
      _: React.MouseEvent<HTMLElement>,
      newDirection: SequenceDirection | null,
    ) => {
      if (!newDirection) return;
      updateViewSetting("direction", newDirection);
    },
    [updateViewSetting],
  );

  /**
   * Handler per canviar sequenceSpaceBetween (global)
   */
  const handleSequenceSpaceChange = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (event: any, value: number | number[]) => {
      const target = event.target;
      if (target?.name) {
        updateViewSetting(target.name as keyof ViewSettings, value as number);
      }
    },
    [updateViewSetting],
  );

  /**
   * Handler per persistir canvis quan es perd el focus
   */
  const handleBlur = useCallback(() => {
    persistViewSettings();
  }, [persistViewSettings]);

  /**
   * Handler per canviar la mida de pàgina via Select
   */
  const handlePageSizeChange = useCallback(
    (event: SelectChangeEvent<number>) => {
      setPageSizeByIndex(Number(event.target.value) as 0 | 1 | 2);
    },
    [setPageSizeByIndex],
  );

  /**
   * Handler per imprimir amb orientació correcta
   */
  const handlePrint = useCallback(() => {
    printWithOrientation(pageFormat);
    trackEvent({
      event: "click-print-view",
      event_category: "View",
      event_label: "Print view",
      value: `size_${viewSettings.sizePict}`,
    });
  }, [pageFormat, viewSettings.sizePict]);

  /**
   * Renderitza els controls per una seqüència dins l'acordió
   */
  const renderSequenceControls = (seqKey: number) => {
    const seqView = sequenceViewSettings[seqKey] ?? {
      sizePict: 0.9,
      pictSpaceBetween: 1,
      alignment: "left" as SequenceAlignment,
    };

    // Mostrar icones d'alineació diferents segons la direcció global
    const isColumn = viewSettings.direction === "column";

    return (
      <Stack spacing={1}>
        <FormGroup>
          <FormLabel>
            <FormattedMessage {...messages.size} />
            <Slider
              name="sizePict"
              step={0.05}
              min={0.4}
              max={6}
              value={seqView.sizePict}
              valueLabelDisplay="auto"
              onChange={handleSequenceSliderChange(seqKey)}
            />
          </FormLabel>
        </FormGroup>
        <FormGroup>
          <FormLabel>
            <FormattedMessage {...messages.pictSpaceBetween} />
            <Slider
              name="pictSpaceBetween"
              step={0.5}
              min={-2}
              max={10}
              value={seqView.pictSpaceBetween}
              valueLabelDisplay="auto"
              onChange={handleSequenceSliderChange(seqKey)}
            />
          </FormLabel>
        </FormGroup>
        <FormGroup>
          <FormLabel component="legend">
            <FormattedMessage {...messages.alignment} />
          </FormLabel>
          <ToggleButtonGroup
            value={seqView.alignment}
            exclusive
            onChange={handleAlignmentChange(seqKey)}
            size="small"
          >
            <Tooltip title={intl.formatMessage(messages.tooltipAlignLeft)}>
              <ToggleButton value="left" aria-label="left">
                {isColumn ? <MdVerticalAlignTop /> : <MdFormatAlignLeft />}
              </ToggleButton>
            </Tooltip>
            <Tooltip title={intl.formatMessage(messages.tooltipAlignCenter)}>
              <ToggleButton value="center" aria-label="center">
                {isColumn ? <MdVerticalAlignCenter /> : <MdFormatAlignCenter />}
              </ToggleButton>
            </Tooltip>
            <Tooltip title={intl.formatMessage(messages.tooltipAlignRight)}>
              <ToggleButton value="right" aria-label="right">
                {isColumn ? <MdVerticalAlignBottom /> : <MdFormatAlignRight />}
              </ToggleButton>
            </Tooltip>
          </ToggleButtonGroup>
        </FormGroup>
      </Stack>
    );
  };

  return (
    <>
      <form onBlur={handleBlur} onSubmit={(event) => event.preventDefault()}>
        <NotPrint>
          <Stack direction={"row"} justifyContent={"end"} alignItems={"end"}>
            <Stack direction={"row"}>
              {!isFullscreen ? (
                <>
                  <Tooltip title={intl.formatMessage(messages.tooltipOrientation)}>
                    <Button
                      aria-label={"page orientation"}
                      variant="text"
                      color="primary"
                      sx={{ fontSize: "2rem" }}
                      onClick={toggleOrientation}
                    >
                      <MdScreenRotation />
                    </Button>
                  </Tooltip>
                  <Tooltip title={intl.formatMessage(messages.tooltipPrint)}>
                    <Button
                      aria-label={"view"}
                      variant="text"
                      color="primary"
                      sx={{ fontSize: "2rem" }}
                      onClick={handlePrint}
                    >
                      <AiFillPrinter />
                    </Button>
                  </Tooltip>
                </>
              ) : (
                !isInFullscreen && (
                  <Tooltip title={intl.formatMessage(messages.tooltipFullscreen)}>
                    <Button
                      aria-label={"fullScreen"}
                      variant="text"
                      color="primary"
                      sx={{ fontSize: "2rem" }}
                      onClick={enterFullscreen}
                    >
                      <AiOutlineFullscreen />
                    </Button>
                  </Tooltip>
                )
              )}
            </Stack>
          </Stack>
        </NotPrint>

        <Stack
          direction={{ xs: "column", md: "row" }}
          columnGap={{ md: 3 }}
          flexWrap={{ xs: "wrap", md: "nowrap" }}
        >
          {/* Contenidor exterior: dimensions visuals de pantalla, sticky en mòbil */}
          <Box
            className="preview-container"
            sx={{
              width: displayWidth,
              height: displayHeight,
              minWidth: 0,
              overflow: "hidden",
              outline: "2px solid green",
              marginBottom: 1,
              position: { xs: "sticky", md: "static" },
              top: { xs: 0 },
              zIndex: { xs: 10, md: "auto" },
              backgroundColor: "background.paper",
            }}
          >
            {/* Contenidor interior: dimensions reals amb transform per visualització */}
            <Box
              className="preview-content"
              sx={{
                width: pageFormat.dimensions.width,
                height: pageFormat.dimensions.height,
                transform: `scale(${calculatedScale})`,
                transformOrigin: "top left",
              }}
            >
              <Stack
                display={"flex"}
                direction={viewSettings.direction}
                flexWrap={"wrap"}
                alignContent={"start"}
                alignItems={"start"}
                columnGap={
                  viewSettings.direction === "column"
                    ? viewSettings.sequenceSpaceBetween
                    : 0
                }
                rowGap={
                  viewSettings.direction === "row"
                    ? viewSettings.sequenceSpaceBetween
                    : 0
                }
                width="100%"
                height="100%"
                sx={{
                  padding: 2,
                  paddingInline: 1.5,
                }}
              >
                {children({
                  viewSettings,
                  sequenceViewSettings,
                  scale: 1,
                  author,
                })}
              </Stack>
            </Box>
          </Box>

          <NotPrint>
            <Divider orientation="vertical" />
          </NotPrint>

          <NotPrint>
            <Stack
              maxWidth={{ md: 300 }}
              width={{ xs: "100%", md: "auto" }}
              flexShrink={0}
              spacing={1}
            >
              <FormGroup>
                <FormLabel>
                  <FormattedMessage {...messages.pageSize} />
                </FormLabel>
                <Select<number>
                  value={pageSizeIndex}
                  onChange={handlePageSizeChange}
                  size="small"
                >
                  <MenuItem value={0}>A4</MenuItem>
                  <MenuItem value={1}>A3</MenuItem>
                  <MenuItem value={2}>
                    <FormattedMessage {...messages.fullScreen} />
                  </MenuItem>
                </Select>
              </FormGroup>

              {/* Switch aplicar a totes: només visible quan hi ha més d'una seqüència */}
              {sequenceKeys.length > 1 && (
                <FormGroup>
                  <Tooltip title={intl.formatMessage(messages.tooltipApplyAll)}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={applyAll}
                          onChange={handleApplyAllChange}
                          size="small"
                        />
                      }
                      label={intl.formatMessage(messages.applyAll)}
                    />
                  </Tooltip>
                </FormGroup>
              )}

              {/* Acordions per cada seqüència */}
              {sequenceKeys.map((seqKey) => (
                <Accordion
                  key={seqKey}
                  expanded={expandedAccordion === seqKey}
                  onChange={handleAccordionToggle(seqKey)}
                  disableGutters
                  sx={{
                    // Quan applyAll, amagar totes menys la primera
                    display:
                      applyAll && seqKey !== sequenceKeys[0] ? "none" : "block",
                  }}
                >
                  <AccordionSummary expandIcon={<MdExpandMore />}>
                    <Typography variant="subtitle2">
                      {applyAll
                        ? intl.formatMessage(messages.sequence)
                        : `${intl.formatMessage(messages.sequence)} ${seqKey + 1}`}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {renderSequenceControls(
                      applyAll ? sequenceKeys[0] : seqKey,
                    )}
                  </AccordionDetails>
                </Accordion>
              ))}

              <FormGroup>
                <FormLabel>
                  <FormattedMessage {...messages.sequenceSpaceBetween} />
                  <Slider
                    name="sequenceSpaceBetween"
                    step={0.5}
                    min={0}
                    max={10}
                    value={viewSettings.sequenceSpaceBetween}
                    valueLabelDisplay="auto"
                    onChange={handleSequenceSpaceChange}
                  />
                </FormLabel>
              </FormGroup>

              <FormGroup>
                <FormLabel component="legend">
                  <FormattedMessage {...messages.direction} />
                </FormLabel>
                <ToggleButtonGroup
                  value={viewSettings.direction}
                  exclusive
                  onChange={handleDirectionChange}
                  size="small"
                >
                  <Tooltip title={intl.formatMessage(messages.tooltipDirectionRow)}>
                    <ToggleButton value="row" aria-label="row">
                      <MdTableRows />
                    </ToggleButton>
                  </Tooltip>
                  <Tooltip title={intl.formatMessage(messages.tooltipDirectionColumn)}>
                    <ToggleButton value="column" aria-label="column">
                      <MdViewColumn />
                    </ToggleButton>
                  </Tooltip>
                </ToggleButtonGroup>
              </FormGroup>

              <FormGroup>
                <FormLabel>
                  <FormattedMessage {...messages.authSequence} />
                  <TextField
                    value={author}
                    onChange={(event) => updateAuthor(event.target.value)}
                    variant="filled"
                    fullWidth
                    helperText={intl.formatMessage({
                      ...messages.authHelperText,
                    })}
                    sx={{
                      ".MuiInputBase-input": { paddingTop: 2 },
                    }}
                  />
                </FormLabel>
              </FormGroup>
            </Stack>
          </NotPrint>
        </Stack>
      </form>

      {/* Contenidor per a fullscreen */}
      <Stack
        className="displayFullScreen"
        direction={"column"}
        alignContent={"start"}
        alignItems={"start"}
        overflow={"hidden"}
        padding={2}
        display={"none"}
      >
        {children({
          viewSettings,
          sequenceViewSettings,
          scale: activeScale,
          author,
        })}
      </Stack>
    </>
  );
};

export { ALIGNMENT_TO_JUSTIFY };
export default ViewSequencesSettings;
