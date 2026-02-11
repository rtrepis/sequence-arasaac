import {
  Box,
  Button,
  Divider,
  FormGroup,
  FormLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Slider,
  Stack,
  TextField,
} from "@mui/material";
import { useCallback } from "react";
import NotPrint from "../utils/NotPrint/NotPrint";
import { AiFillPrinter, AiOutlineFullscreen } from "react-icons/ai";
import { MdScreenRotation } from "react-icons/md";
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
import { useAppSelector } from "@/app/hooks";
import { PRINT_CONTAINER_PADDING } from "@/types/PageFormat";
import { usePrintStyles, printWithOrientation } from "@/hooks/usePrintStyles";
import { ViewSettings } from "@/types/ui";

interface ViewSequencesSettingsChildrenProps {
  viewSettings: ViewSettings;
  scale: number;
  author: string;
}

interface ViewSequencesSettingsProps {
  children: (
    props: ViewSequencesSettingsChildrenProps,
  ) => React.ReactElement | React.ReactElement[];
}

/**
 * Component refactoritzat per gestionar la configuració de visualització de seqüències
 * Segueix els principis SOLID:
 * - Single Responsibility: Delega càlculs i lògica a hooks especialitzats
 * - Open/Closed: Fàcil afegir nous formats de pàgina
 * - Dependency Inversion: Depèn d'abstraccions (hooks) no d'implementacions concretes
 */
const ViewSequencesSettings = ({
  children,
}: ViewSequencesSettingsProps): React.ReactElement => {
  const intl = useIntl();
  const [screenWidth, screenHeight] = useWindowResize();

  // Obtenir configuració inicial des de Redux
  const initialViewSettings = useAppSelector((state) => state.ui.viewSettings);

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

  // Gestió de la configuració de visualització
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
   * Handler per canviar les configuracions de visualització
   */
  const handleViewChange = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (event: any, value: number | number[]) => {
      const target = event.target;
      if (target?.name) {
        updateViewSetting(
          target.name as keyof typeof viewSettings,
          value as number,
        );
      }
    },
    [updateViewSetting, viewSettings],
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

  return (
    <>
      <form onBlur={handleBlur} onSubmit={(event) => event.preventDefault()}>
        <NotPrint>
          <Stack
            direction={"row"}
            justifyContent={"end"}
            alignItems={"end"}
          >
            <Stack direction={"row"}>
              {!isFullscreen ? (
                <>
                  <Button
                    aria-label={"page orientation"}
                    variant="text"
                    color="primary"
                    sx={{ fontSize: "2rem" }}
                    onClick={toggleOrientation}
                  >
                    <MdScreenRotation />
                  </Button>
                  <Button
                    aria-label={"view"}
                    variant="text"
                    color="primary"
                    sx={{ fontSize: "2rem" }}
                    onClick={handlePrint}
                  >
                    <AiFillPrinter />
                  </Button>
                </>
              ) : (
                !isInFullscreen && (
                  <Button
                    aria-label={"fullScreen"}
                    variant="text"
                    color="primary"
                    sx={{ fontSize: "2rem" }}
                    onClick={enterFullscreen}
                  >
                    <AiOutlineFullscreen />
                  </Button>
                )
              )}
            </Stack>
          </Stack>
        </NotPrint>

        <Stack direction={{ xs: "column", md: "row" }} columnGap={3}>
          {/* Contenidor exterior: dimensions visuals de pantalla */}
          <Box
            className="preview-container"
            sx={{
              width: displayWidth,
              height: displayHeight,
              overflow: "hidden",
              border: "2px solid green",
              marginBottom: 1,
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
                direction={"row"}
                flexWrap={"wrap"}
                alignContent={"start"}
                alignItems={"start"}
                columnGap={viewSettings.columnGap}
                rowGap={viewSettings.rowGap}
                width="100%"
                height="100%"
                sx={{
                  padding: 2,
                  paddingInline: 1.5,
                }}
              >
                {children({ viewSettings, scale: 1, author })}
              </Stack>
            </Box>
          </Box>

          <NotPrint>
            <Divider orientation="vertical" />
          </NotPrint>

          <NotPrint>
            <Stack columnGap={2} maxWidth={300} paddingLeft={2}>
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
              <FormGroup>
                <FormLabel>
                  <FormattedMessage {...messages.size} />
                  <Slider
                    defaultValue={viewSettings.sizePict}
                    name="sizePict"
                    step={0.01}
                    min={0.5}
                    max={2}
                    value={viewSettings.sizePict}
                    onChange={handleViewChange}
                  />
                </FormLabel>
              </FormGroup>
              <FormGroup>
                <FormLabel>
                  <FormattedMessage {...messages.columnGap} />
                  <Slider
                    name="columnGap"
                    step={0.5}
                    min={-2}
                    max={10}
                    value={viewSettings.columnGap}
                    onChange={handleViewChange}
                  />
                </FormLabel>
              </FormGroup>
              <FormGroup>
                <FormLabel>
                  <FormattedMessage {...messages.rowGap} />
                  <Slider
                    name="rowGap"
                    step={0.5}
                    min={0}
                    max={10}
                    value={viewSettings.rowGap}
                    onChange={handleViewChange}
                  />
                </FormLabel>
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
        {children({ viewSettings, scale: activeScale, author })}
      </Stack>
    </>
  );
};

export default ViewSequencesSettings;
