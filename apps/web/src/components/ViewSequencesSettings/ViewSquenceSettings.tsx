import { Box, Divider, Stack, Tooltip } from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import NotPrint from "../utils/NotPrint/NotPrint";
import { AiFillPrinter, AiOutlineFullscreen } from "react-icons/ai";
import { BsFilePdf } from "react-icons/bs";
import { MdOutlinePushPin, MdScreenRotation } from "react-icons/md";
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
import { usePrintSheet } from "@features/print/hooks/usePrintSheet";
import CopyRight from "@components/CopyRight/CopyRight";
import { useDownloadPdf } from "@features/print/hooks/useDownloadPdf";
import { ViewSettings, SequenceDirection } from "@/types/ui";
import {
  DocumentLayout,
  SequenceViewSettings,
  SequenceAlignmentH,
  SequenceAlignmentV,
} from "@/types/document";
import {
  documentLayoutChangedActionCreator,
  updateSequenceViewSettingsActionCreator,
  applyViewSettingsToAllActionCreator,
  setSequenceSpaceBetweenActionCreator,
} from "@features/sequence/store/documentSlice";
import {
  selectDocumentStyle,
  selectResolvedSequenceViews,
} from "@features/sequence/style/styleSelectors";
import { viewSettingsActionCreator } from "@features/user-settings/store/uiSlice";
import ApplyUserDefaultStyleButton from "@features/sequence/components/DocumentStyle/ApplyUserDefaultStyleButton";
import { ALIGN_H, ALIGN_V } from "@shared/constants/alignmentMaps";
import { sheetSurface } from "@/style/palette";
import { useSaveUiSettings } from "@features/backend/user-settings/hooks/useSaveUiSettings";
import SettingsSaveErrorDialog from "@features/backend/user-settings/components/SettingsSaveErrorDialog";
import { selectIsLoggedIn } from "@features/backend/auth/store/authSelectors";
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
  // La vista de cada pestanya és la del document (B25): la que porta el
  // `.saac`, o la de l'estil del document a les seqüències que no en tenen
  const sequenceViewSettings = useAppSelector(selectResolvedSequenceViews);
  const documentStyle = useAppSelector(selectDocumentStyle);
  const sequenceKeys = useAppSelector((state) =>
    Object.keys(state.document.content).map(Number),
  );
  // El desat de preferències va al compte o al navegador segons si hi ha
  // sessió, i el botó ho ha de dir abans de prémer-lo, no després.
  const isAuthenticated = useAppSelector(selectIsLoggedIn);

  // Desat de preferències: en segon pla, amb reintent i diàleg d'error
  const { saveInBackground, retry, failure, isRetrying, dismissError } =
    useSaveUiSettings();

  // Aquí hi havia un efecte que, en muntar-se la columna, posava les
  // preferències de l'usuari a totes les pestanyes: el `.saac` no es veia mai
  // com s'havia desat, i tornar-lo a desar en perdia la vista (B25). Ara la
  // document es veu sempre amb el seu estil, i les preferències només arriben
  // als documents nous, que l'hereten (`docs/fonaments/03-model-contingut-estil.md`).

  // Estat local: mode aplicar a totes vs individual
  const [applyAll, setApplyAll] = useState(true);
  // Acordió expandit: només un a la vegada (null = tots tancats)
  const [expandedAccordion, setExpandedAccordion] = useState<number | null>(
    sequenceKeys[0] ?? 0,
  );

  // La pàgina és del document (B26): la seva, o la de les preferències de
  // l'usuari si encara l'hereta (un document nou que no s'ha desat)
  const documentLayout = useAppSelector((state) => state.document.layout);
  const pageLayout: DocumentLayout = documentLayout ?? {
    pageSize: initialViewSettings.pageSize ?? "A4",
    orientation: initialViewSettings.orientation ?? "landscape",
    direction: initialViewSettings.direction ?? "row",
  };
  const pageLayoutRef = useRef(pageLayout);
  pageLayoutRef.current = pageLayout;

  // Gestió del format de pàgina: parteix de la del document
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
    initialSize: pageLayout.pageSize ?? "A4",
    initialOrientation: pageLayout.orientation ?? "landscape",
  });

  // Gestió de la disposició de la pàgina (direcció). L'espai entre seqüències
  // és de l'estil del document i surt d'allà, no d'aquest estat local
  const { viewSettings: layoutViewSettings, updateViewSetting } =
    useViewManager({
      initialViewSettings: {
        ...initialViewSettings,
        direction: pageLayout.direction ?? initialViewSettings.direction,
      },
      persistToStore: false,
    });
  // Les preferències tal com són ara a l'store, per al mirall de sessió
  const uiViewSettingsRef = useRef(initialViewSettings);
  uiViewSettingsRef.current = initialViewSettings;
  const viewSettings = useMemo(
    () => ({
      ...layoutViewSettings,
      sequenceSpaceBetween: documentStyle.view.sequenceSpaceBetween,
    }),
    [layoutViewSettings, documentStyle.view.sequenceSpaceBetween],
  );

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
  // I la còpia del full, que és l'únic que arriba al paper —també amb Ctrl+P
  usePrintSheet();

  // Gestió de la descàrrega de PDF
  const { downloadPdf, isGenerating } = useDownloadPdf(pageFormat);

  // Determinar l'escala activa
  const activeScale = isInFullscreen ? currentScale : calculatedScale;

  // Alineació de bloc: posiciona tot el conjunt de seqüències dins la pàgina,
  // sempre a l'eix creuat de `direction` (V si row, H si column). Font única:
  // la primera seqüència (amb applyAll totes comparteixen el mateix valor)
  const blockSource =
    sequenceViewSettings[sequenceKeys[0]] ?? documentStyle.view;
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
            applyViewSettingsToAllActionCreator({
              settings: { [name]: value as number },
              styleView: documentStyle.view,
            }),
          );
        } else {
          dispatch(
            updateSequenceViewSettingsActionCreator({
              key: seqKey,
              settings: { [name]: value as number },
              base: sequenceViewSettings[seqKey],
            }),
          );
        }
      },
    [applyAll, dispatch, documentStyle.view, sequenceViewSettings],
  );

  /**
   * Handler per canviar l'alineació H d'una seqüència
   */
  const handleAlignmentHChange = useCallback(
    (seqKey: number) =>
      (_: React.MouseEvent<HTMLElement>, value: SequenceAlignmentH | null) => {
        if (!value) return;
        if (applyAll) {
          dispatch(
            applyViewSettingsToAllActionCreator({
              settings: { alignmentH: value },
              styleView: documentStyle.view,
            }),
          );
        } else {
          dispatch(
            updateSequenceViewSettingsActionCreator({
              key: seqKey,
              settings: { alignmentH: value },
              base: sequenceViewSettings[seqKey],
            }),
          );
        }
      },
    [applyAll, dispatch, documentStyle.view, sequenceViewSettings],
  );

  /**
   * Handler per canviar l'alineació V d'una seqüència
   */
  const handleAlignmentVChange = useCallback(
    (seqKey: number) =>
      (_: React.MouseEvent<HTMLElement>, value: SequenceAlignmentV | null) => {
        if (!value) return;
        if (applyAll) {
          dispatch(
            applyViewSettingsToAllActionCreator({
              settings: { alignmentV: value },
              styleView: documentStyle.view,
            }),
          );
        } else {
          dispatch(
            updateSequenceViewSettingsActionCreator({
              key: seqKey,
              settings: { alignmentV: value },
              base: sequenceViewSettings[seqKey],
            }),
          );
        }
      },
    [applyAll, dispatch, documentStyle.view, sequenceViewSettings],
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
   * Handler per canviar l'espai entre seqüències: és de l'estil del document
   */
  const handleSequenceSpaceChange = useCallback(
    (_: Event, value: number | number[]) => {
      dispatch(
        setSequenceSpaceBetweenActionCreator({
          value: value as number,
          styleView: documentStyle.view,
        }),
      );
    },
    [dispatch, documentStyle.view],
  );

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
  // Només hi escriu l'autor. La pàgina ja no hi va: és del document (B26), i
  // les preferències de pàgina només canvien quan l'usuari les desa. Abans el
  // mirall copiava la pàgina i les mides i barrejava els dos rols (B21).
  const { direction } = layoutViewSettings;
  useEffect(() => {
    dispatch(
      viewSettingsActionCreator({
        ...uiViewSettingsRef.current,
        author,
      }),
    );
  }, [dispatch, author]);

  // La pàgina que es toca aquí és la del document. En muntar-se coincideix amb
  // la que ja té (o hereta), i llavors no s'hi escriu res: el document no ha
  // canviat només per mirar-lo
  useEffect(() => {
    const current = pageLayoutRef.current;
    if (
      current.direction === direction &&
      current.pageSize === pageSize &&
      current.orientation === orientation
    )
      return;
    dispatch(
      documentLayoutChangedActionCreator({
        layout: { direction, pageSize, orientation },
        base: current,
      }),
    );
  }, [dispatch, direction, pageSize, orientation]);

  /**
   * Desa aquests ajustos com a preferències de l'usuari: al compte si hi ha
   * sessió, al navegador si no n'hi ha. Passa per `useSaveUiSettings` perquè
   * tingui reintent, confirmació i diàleg d'error, com el modal de configuracions.
   */
  const handleSavePreferences = useCallback(() => {
    // Les mides i els espaiats del document passen a ser els de l'estil per
    // defecte; la pàgina, la direcció i l'autor, les preferències de disposició
    dispatch(
      viewSettingsActionCreator({
        ...uiViewSettingsRef.current,
        ...documentStyle.view,
        direction,
        author,
        licence: viewSettings.licence,
        pageSize,
        orientation,
      }),
    );
    saveInBackground();
  }, [
    dispatch,
    saveInBackground,
    documentStyle.view,
    direction,
    author,
    pageSize,
    orientation,
  ]);

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
            {/* Contenidor interior: dimensions reals amb transform per visualització.
                És el full sencer i l'únic que s'imprimeix (`usePrintSheet`): una
                columna amb el contingut i, a sota, el peu de llicència */}
            <Box
              className="preview-content"
              sx={{
                width: pageFormat.dimensions.width,
                height: pageFormat.dimensions.height,
                transform: `scale(${calculatedScale})`,
                transformOrigin: "top left",
                display: "flex",
                flexDirection: "column",
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
                sx={{
                  flex: 1,
                  // Sense això, un contingut alt eixamplaria el full en comptes
                  // de quedar retallat per la vora, com fa el paper
                  minHeight: 0,
                  // I sense això el sobrant es pintaria damunt del peu: el que
                  // no hi cap es talla, que és el que fa el paper
                  overflow: "hidden",
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

              {/* Al peu del full, dins del flux: només es pinta al paper i al
                  PDF, i allà s'hi reserva l'espai perquè no caigui damunt de
                  l'última fila de pictogrames */}
              <CopyRight author={author} licence={viewSettings.licence} />
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
                  licence={viewSettings.licence}
                  onLicenceChange={(value) =>
                    updateViewSetting("licence", value)
                  }
                />

                {/* Accions de tota la columna, per això van al final: restaurar el
                    que hi ha desat i desar el que hi ha ara com a preferència.
                    Amb `floatingClearance` perquè aquesta columna acaba al mateix
                    racó on sura el botó d'estat */}
                <SettingsActions floatingClearance>
                  {/* Substitueix «Restaura les seqüències»: fa el mateix, amb tot
                      l'estil del document i amb desfer */}
                  <ApplyUserDefaultStyleButton />
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
