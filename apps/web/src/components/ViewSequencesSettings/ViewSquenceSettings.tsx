import { Box, Divider, Stack, Tooltip } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import NotPrint from "../utils/NotPrint/NotPrint";
import { AiFillPrinter, AiOutlineFullscreen } from "react-icons/ai";
import { BsFilePdf } from "react-icons/bs";
import {
  MdOutlinePushPin,
  MdScreenRotation,
  MdSettingsBackupRestore,
} from "react-icons/md";
import { FormattedMessage, useIntl } from "react-intl";
import messages from "./ViewSequencesSettings.lang";
import StyledButton from "@/style/StyledButton";
import StyledIconButton from "@/style/StyledIconButton";
import useWindowResize from "@shared/hooks/useWindowResize";
import React from "react";
import { trackEvent } from "@shared/hooks/usePageTracking";
import { usePageFormat } from "@features/print/hooks/usePageFormat";
import {
  useScaleCalculator,
  usePrintDimensions,
} from "@features/print/hooks/useScaleCalculator";
import { useFullscreen } from "@features/print/hooks/useFullScreen";
import {
  useViewManager,
  useAuthorManager,
} from "@features/print/hooks/useViewManager";
import { useAppSelector, useAppDispatch } from "@/app/hooks";
import {
  usePrintStyles,
  printWithOrientation,
} from "@features/print/hooks/usePrintStyles";
import { useDownloadPdf } from "@features/print/hooks/useDownloadPdf";
import { getCurrentDPI } from "@/features/print-refactor/utils/dpiManager";
import { ViewSettings, SequenceDirection } from "@/types/ui";
import {
  SequenceViewSettings,
  SequenceAlignmentH,
  SequenceAlignmentV,
} from "@/types/document";
import {
  updateSequenceViewSettingsActionCreator,
  applyViewSettingsToAllActionCreator,
  DEFAULT_SEQUENCE_VIEW,
} from "@features/sequence/store/documentSlice";
import { ALIGN_H, ALIGN_V } from "@shared/constants/alignmentMaps";
import { sheetSurface } from "@/style/palette";
import { useSaveUiSettings } from "@features/backend/user-settings/hooks/useSaveUiSettings";
import SettingsSaveErrorDialog from "@/Modals/DefaultSettingsModal/SettingsSaveErrorDialog";
import { RootState } from "@/app/store";
import SequenceControlsPanel from "./SequenceControlsPanel";
import GlobalViewControls from "./GlobalViewControls";
import PrintFooterSection from "./PrintFooterSection";
import { VIEW_SETTINGS_COLUMN_WIDTH } from "./ViewSequenceSettings.styled";
import {
  SectionTitle,
  SettingsActions,
  SETTINGS_ROW_GAP,
} from "@/components/SettingsLayout";
import { SelectChangeEvent } from "@mui/material";

// El desat de preferències va al compte o al navegador segons si hi ha sessió,
// i el botó ho ha de dir abans de prémer-lo, no després.
const selectIsAuthenticated = (state: RootState): boolean =>
  state.auth.accessToken !== null;

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
 * Orquestrador de la visualització de seqüències: gestiona hooks, handlers i composició
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
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // Desat de preferències: en segon pla, amb reintent i diàleg d'error
  const { saveInBackground, retry, failure, isRetrying, dismissError } =
    useSaveUiSettings();

  // Aplicar les preferències de l'usuari (ui.viewSettings) a totes les seqüències en muntar.
  // document.viewSettings s'inicialitza amb valors hardcodats al documentSlice;
  // aquí les substituïm pels valors guardats de l'usuari com a punt de partida.
  // Instantània de les preferències desades en entrar, no el selector viu: el
  // mirall de sessió de més avall reescriu `ui.viewSettings` a cada canvi, i amb
  // el selector «Restaura» tornaria als valors que l'usuari acaba de tocar.
  // Només avança quan l'usuari desa les preferències explícitament.
  const savedUserDefaults = useRef(initialViewSettings);
  useEffect(() => {
    const { sizePict, pictSpaceBetween, alignmentH, alignmentV } =
      savedUserDefaults.current;
    dispatch(
      applyViewSettingsToAllActionCreator({
        sizePict,
        pictSpaceBetween,
        alignmentH,
        alignmentV,
      }),
    );
  }, [dispatch]);

  // Estat local: mode aplicar a totes vs individual
  const [applyAll, setApplyAll] = useState(true);
  // Acordió expandit: només un a la vegada (null = tots tancats)
  const [expandedAccordion, setExpandedAccordion] = useState<number | null>(
    sequenceKeys[0] ?? 0,
  );

  // Gestió del format de pàgina (usa el pageSize per defecte de l'usuari)
  const {
    pageFormat,
    pageSize,
    pageSizeIndex,
    orientation,
    isLandscape,
    isFullscreen,
    setPageSizeByIndex,
    toggleOrientation,
  } = usePageFormat({
    initialSize: initialViewSettings.pageSize ?? "A4",
    initialOrientation: initialViewSettings.orientation ?? "landscape",
  });

  // Gestió de la configuració de visualització global (sequenceSpaceBetween)
  const { viewSettings, updateViewSetting, persistViewSettings } =
    useViewManager({
      initialViewSettings,
    });

  // Gestió de l'autor (usa el valor per defecte de l'usuari)
  const { author, updateAuthor } = useAuthorManager(
    initialViewSettings.author ?? "",
  );

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

  // Gestió de la descàrrega de PDF
  const { downloadPdf, isGenerating } = useDownloadPdf(pageFormat);

  // Determinar l'escala activa
  const activeScale = isInFullscreen ? currentScale : calculatedScale;

  // Alineació de bloc: posiciona tot el conjunt de seqüències dins la pàgina,
  // sempre a l'eix creuat de `direction` (V si row, H si column). Font única:
  // la primera seqüència (amb applyAll totes comparteixen el mateix valor)
  const blockSource =
    sequenceViewSettings[sequenceKeys[0]] ?? DEFAULT_SEQUENCE_VIEW;
  const isRowDirection = viewSettings.direction === "row";
  const blockAlign = isRowDirection
    ? ALIGN_V[blockSource.alignmentV]
    : ALIGN_H[blockSource.alignmentH];

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
   * Handler per canviar l'alineació H d'una seqüència
   */
  const handleAlignmentHChange = useCallback(
    (seqKey: number) =>
      (_: React.MouseEvent<HTMLElement>, value: SequenceAlignmentH | null) => {
        if (!value) return;
        if (applyAll) {
          dispatch(applyViewSettingsToAllActionCreator({ alignmentH: value }));
        } else {
          dispatch(
            updateSequenceViewSettingsActionCreator({
              key: seqKey,
              settings: { alignmentH: value },
            }),
          );
        }
      },
    [applyAll, dispatch],
  );

  /**
   * Handler per canviar l'alineació V d'una seqüència
   */
  const handleAlignmentVChange = useCallback(
    (seqKey: number) =>
      (_: React.MouseEvent<HTMLElement>, value: SequenceAlignmentV | null) => {
        if (!value) return;
        if (applyAll) {
          dispatch(applyViewSettingsToAllActionCreator({ alignmentV: value }));
        } else {
          dispatch(
            updateSequenceViewSettingsActionCreator({
              key: seqKey,
              settings: { alignmentV: value },
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
   * Handler per restaurar les preferències guardades de l'usuari a totes les seqüències
   */
  const handleResetToDefaults = useCallback(() => {
    const {
      sizePict,
      pictSpaceBetween,
      alignmentH,
      alignmentV,
      direction,
      sequenceSpaceBetween,
    } = savedUserDefaults.current;
    dispatch(
      applyViewSettingsToAllActionCreator({
        sizePict,
        pictSpaceBetween,
        alignmentH,
        alignmentV,
      }),
    );
    updateViewSetting("direction", direction);
    updateViewSetting("sequenceSpaceBetween", sequenceSpaceBetween);
  }, [dispatch, updateViewSetting]);

  /**
   * Mirall de sessió: manté `ui.viewSettings` al dia amb el que es veu, inclosos
   * els camps que gestionen hooks externs (author, pageSize, orientation). Serveix
   * perquè anar a Edició i tornar conservi el format de pàgina; **no desa res
   * enlloc**. Abans ho feia l'`onBlur` del formulari, que en ser `focusout` puja:
   * qualsevol control que perdia el focus —fins i tot els botons d'imprimir—
   * enviava tota la configuració de l'usuari (idioma, tema, pictogrames i el
   * vocabulari sencer, amb les imatges) al compte o al navegador. Ningú ho havia
   * demanat, ningú n'era avisat si fallava, i de passada despertava Render.
   */
  useEffect(() => {
    persistViewSettings({ author, pageSize, orientation });
  }, [persistViewSettings, author, pageSize, orientation]);

  /**
   * Desa aquests ajustos com a preferències de l'usuari: al compte si hi ha
   * sessió, al navegador si no n'hi ha. Passa per `useSaveUiSettings` perquè
   * tingui reintent, confirmació i diàleg d'error, com el modal de configuracions.
   */
  const handleSavePreferences = useCallback(() => {
    // El que es desa és el que hi ha a Redux i el mirall ja hi és: la instantània
    // de «Restaura» pot avançar amb ell.
    savedUserDefaults.current = {
      ...viewSettings,
      author,
      pageSize,
      orientation,
    };
    saveInBackground();
  }, [saveInBackground, viewSettings, author, pageSize, orientation]);

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
   * Handler de la descàrrega del PDF.
   * El botó continua sent focusable mentre genera (aria-disabled), així que el
   * clic repetit el para aquí: el backdrop del hook ja diu què està passant.
   */
  const handleDownloadPdf = useCallback(() => {
    if (isGenerating) return;
    void downloadPdf();
  }, [isGenerating, downloadPdf]);

  /**
   * Handler per imprimir amb orientació correcta
   */
  const handlePrint = useCallback(() => {
    (document.activeElement as HTMLElement)?.blur();
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
      <form onSubmit={(event) => event.preventDefault()}>
        <NotPrint>
          <Stack direction={"row"} justifyContent={"end"} alignItems={"end"}>
            {/* Botons només-icona: l'aria-label sempre repeteix el mateix missatge
                que el tooltip. El tooltip no s'obre en tàctil, així que l'aria-label
                és l'únic nom del botó; i fer-los coincidir compleix el criteri WCAG
                2.5.3 (el nom llegit conté el text visible). */}
            <Stack direction={"row"}>
              {!isFullscreen ? (
                <>
                  <Tooltip
                    title={intl.formatMessage(messages.tooltipOrientation)}
                  >
                    <StyledIconButton
                      aria-label={intl.formatMessage(
                        messages.tooltipOrientation,
                      )}
                      color="inherit"
                      sx={{ fontSize: "2rem" }}
                      onClick={toggleOrientation}
                    >
                      <MdScreenRotation />
                    </StyledIconButton>
                  </Tooltip>
                  <Tooltip title={intl.formatMessage(messages.tooltipPrint)}>
                    <StyledIconButton
                      aria-label={intl.formatMessage(messages.tooltipPrint)}
                      color="inherit"
                      sx={{ fontSize: "2rem" }}
                      onClick={handlePrint}
                    >
                      <AiFillPrinter />
                    </StyledIconButton>
                  </Tooltip>
                  <Tooltip
                    title={intl.formatMessage(messages.tooltipDownloadPdf)}
                  >
                    {/* aria-disabled i no `disabled`: un botó desactivat surt de
                        l'ordre de tabulació i qui hi navega amb teclat el perd
                        de sota els dits sense cap avís. Sense `disabled` tampoc
                        cal el <span> embolcall: el Tooltip ja rep els events del
                        Button i l'aria-label es queda on ha de ser. */}
                    <StyledIconButton
                      aria-label={intl.formatMessage(
                        messages.tooltipDownloadPdf,
                      )}
                      aria-disabled={isGenerating}
                      aria-busy={isGenerating}
                      color="inherit"
                      sx={{ fontSize: "2rem" }}
                      onClick={handleDownloadPdf}
                    >
                      <BsFilePdf />
                    </StyledIconButton>
                  </Tooltip>
                </>
              ) : (
                !isInFullscreen && (
                  <Tooltip
                    title={intl.formatMessage(messages.tooltipFullscreen)}
                  >
                    <StyledIconButton
                      aria-label={intl.formatMessage(
                        messages.tooltipFullscreen,
                      )}
                      color="inherit"
                      sx={{ fontSize: "2rem" }}
                      onClick={enterFullscreen}
                    >
                      <AiOutlineFullscreen />
                    </StyledIconButton>
                  </Tooltip>
                )
              )}
            </Stack>
          </Stack>
        </NotPrint>

        <Stack
          direction={{ xs: "column", md: "row" }}
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
              outline: (theme) => `2px solid ${theme.palette.primary.main}`,
              marginBottom: 1,
              "@media print": { marginBottom: 0, outline: "none" },
              position: { xs: "sticky", md: "static" },
              top: { xs: 0 },
              zIndex: { xs: 10, md: "auto" },
              // El full és paper en tots dos temes: aquesta previsualització ha de
              // ser idèntica al que sortirà per impressora i al PDF
              backgroundColor: sheetSurface,
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
                alignContent={blockAlign}
                alignItems={blockAlign}
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

          {/* Grup divider + settings: empès sempre a la vora dreta en desktop */}
          <Box
            sx={{
              marginLeft: { md: "auto" },
              display: { md: "flex" },
              gap: { md: 3 },
              alignItems: "stretch",
            }}
          >
            <NotPrint>
              <Divider orientation="vertical" />
            </NotPrint>

            <NotPrint>
              <Stack
                maxWidth={{ md: VIEW_SETTINGS_COLUMN_WIDTH }}
                width={{ xs: "100%", md: "auto" }}
                flexShrink={0}
                spacing={SETTINGS_ROW_GAP}
                sx={{
                  // Zona de configuració: fons paper a tota la columna de controls
                  backgroundColor: "background.paper",
                  borderRadius: 2,
                  padding: 1.5,
                  height: { md: "100%" },
                }}
              >
                {/* Secció: format i disposició de la pàgina (afecta tot el document) */}
                <SectionTitle
                  title={<FormattedMessage {...messages.sectionPageFormat} />}
                >
                  <GlobalViewControls
                    viewSettings={viewSettings}
                    pageSizeIndex={pageSizeIndex}
                    sequenceCount={sequenceKeys.length}
                    onPageSizeChange={handlePageSizeChange}
                    onDirectionChange={handleDirectionChange}
                    onSequenceSpaceChange={handleSequenceSpaceChange}
                  />
                </SectionTitle>

                {/* Secció: ajustos de cada seqüència (mida, separació i alineació) */}
                <SectionTitle
                  title={<FormattedMessage {...messages.sectionSequences} />}
                >
                  <SequenceControlsPanel
                    sequenceKeys={sequenceKeys}
                    sequenceViewSettings={sequenceViewSettings}
                    applyAll={applyAll}
                    expandedAccordion={expandedAccordion}
                    onAccordionToggle={handleAccordionToggle}
                    onApplyAllChange={handleApplyAllChange}
                    onSequenceSliderChange={handleSequenceSliderChange}
                    onAlignmentHChange={handleAlignmentHChange}
                    onAlignmentVChange={handleAlignmentVChange}
                  />
                </SectionTitle>

                {/* Secció: el que només surt al peu del full imprès i del PDF */}
                <PrintFooterSection
                  author={author}
                  onAuthorChange={updateAuthor}
                />

                {/* Accions de tota la columna, per això van al final: restaurar el
                    que hi ha desat i desar el que hi ha ara com a preferència.
                    Amb `floatingClearance` perquè aquesta columna acaba al mateix
                    racó on sura el botó d'estat */}
                <SettingsActions floatingClearance>
                  <Tooltip
                    title={intl.formatMessage(messages.tooltipResetDefaults)}
                    describeChild
                  >
                    {/* `inherit` i no el primary: el verd de la casa sobre el
                        paper es queda a 2,1:1 i no es llegeix (F11) */}
                    <StyledButton
                      color="inherit"
                      endIcon={<MdSettingsBackupRestore />}
                      onClick={handleResetToDefaults}
                    >
                      <FormattedMessage {...messages.resetDefaults} />
                    </StyledButton>
                  </Tooltip>
                  {/* El tooltip diu on van a parar els ajustos, que no és el mateix
                      lloc amb sessió que sense */}
                  <Tooltip
                    title={intl.formatMessage(
                      isAuthenticated
                        ? messages.tooltipSavePreferencesCloud
                        : messages.tooltipSavePreferencesLocal,
                    )}
                    describeChild
                  >
                    <StyledButton
                      variant="contained"
                      endIcon={<MdOutlinePushPin />}
                      onClick={handleSavePreferences}
                    >
                      <FormattedMessage {...messages.savePreferences} />
                    </StyledButton>
                  </Tooltip>
                </SettingsActions>
              </Stack>
            </NotPrint>
          </Box>
        </Stack>
      </form>

      {/* Només apareix si el desat ha fallat també al reintent automàtic */}
      <SettingsSaveErrorDialog
        failure={failure}
        isRetrying={isRetrying}
        onRetry={retry}
        onDismiss={dismissError}
      />

      {/* Contenidor per a fullscreen: mateix layout de blocs que la
          previsualització (direcció, wrap i separació entre seqüències) */}
      <Stack
        className="displayFullScreen"
        direction={viewSettings.direction}
        flexWrap={"wrap"}
        alignContent={blockAlign}
        alignItems={blockAlign}
        // La previsualització escala tot el full amb un `transform`; aquí no
        // n'hi ha, així que la separació es multiplica per l'escala activa
        // perquè es vegi proporcionada als pictogrames, com el `pictSpaceBetween`
        columnGap={
          viewSettings.direction === "column"
            ? viewSettings.sequenceSpaceBetween * activeScale
            : 0
        }
        rowGap={
          viewSettings.direction === "row"
            ? viewSettings.sequenceSpaceBetween * activeScale
            : 0
        }
        overflow={"hidden"}
        padding={2}
        display={"none"}
        // Pantalla completa: mateixa superfície de full que la previsualització
        sx={{ backgroundColor: sheetSurface }}
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

export default ViewSequencesSettings;
