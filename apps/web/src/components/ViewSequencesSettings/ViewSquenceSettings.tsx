import {
  Box,
  Collapse,
  Divider,
  GlobalStyles,
  Stack,
  Tooltip,
  useTheme,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import NotPrint from "../utils/NotPrint/NotPrint";
import { AiFillPrinter, AiOutlineFullscreen } from "react-icons/ai";
import { BsFilePdf } from "react-icons/bs";
import { MdOutlineDescription, MdScreenRotation } from "react-icons/md";
import {
  TbArrowAutofitHeight,
  TbArrowAutofitWidth,
  TbLayoutSidebarRightCollapse,
  TbLayoutSidebarRightExpand,
} from "react-icons/tb";
import { FormattedMessage, useIntl } from "react-intl";
import messages from "./ViewSequencesSettings.lang";
import StyledButton from "@/style/StyledButton";
import StyledIconButton from "@/style/StyledIconButton";
import useWindowResize from "@shared/hooks/useWindowResize";
import React from "react";
import { trackEvent } from "@shared/hooks/usePageTracking";
import { usePageFormat } from "@features/print/hooks/usePageFormat";
import {
  PreviewFit,
  useScaleCalculator,
  usePrintDimensions,
} from "@features/print/hooks/useScaleCalculator";
import { isMediumScreen } from "@features/print/utils/pageFormat";
import { useFullscreen } from "@features/print/hooks/useFullScreen";
import { useViewManager } from "@features/print/hooks/useViewManager";
import { useAppSelector, useAppDispatch } from "@/app/hooks";
import {
  usePrintStyles,
  printWithOrientation,
} from "@features/print/hooks/usePrintStyles";
import { usePrintSheet } from "@features/print/hooks/usePrintSheet";
import CopyRight from "@components/CopyRight/CopyRight";
import { useDownloadPdf } from "@features/print/hooks/useDownloadPdf";
import { ViewSettings, SequenceDirection } from "@/types/ui";
import { DocumentLayout, SequenceViewSettings } from "@/types/document";
import {
  documentAuthorChangedActionCreator,
  setSequenceSpaceBetweenActionCreator,
} from "@features/sequence/store/documentSlice";
import {
  selectDocumentStyle,
  selectResolvedSequenceViews,
} from "@features/sequence/style/styleSelectors";
import { ALIGN_H, ALIGN_V } from "@shared/constants/alignmentMaps";
import { sheetSurface } from "@/style/palette";
import GlobalViewControls from "./GlobalViewControls";
import SettingsLevel, { SettingsLevels } from "./SettingsLevel";
import LevelCrumbs, { LevelCrumb } from "./LevelCrumbs";
import levelMessages from "./ViewLevels.lang";
import PrintFooterSection from "./PrintFooterSection";
import { VIEW_SETTINGS_COLUMN_WIDTH } from "./ViewSequenceSettings.styled";
import FreeLayoutPages from "@features/free-layout/components/FreeLayoutPages";
import { pageFrameSx } from "@features/free-layout/components/FreeLayoutPages/FreeLayoutPages";
import FreeLayoutSettings from "@features/free-layout/components/FreeLayoutSettings";
import {
  changePageLayoutThunk,
  selectDocumentTitle,
  selectHasPages,
  selectPages,
} from "@features/free-layout/store/freeLayoutThunks";
import {
  VIEW_BLOCK_LEVEL_ID,
  ViewSelectionProvider,
  selectionKey,
  useClearOnEscape,
  useViewSelection,
} from "@features/free-layout/hooks/useViewSelection";
import { useSelectedBlock } from "@features/free-layout/hooks/useSelectedBlock";
import {
  BlockIcon,
  BlockLevel,
  PageLevel,
  LicencePagesRow,
  VIEW_PAGE_LEVEL_ID,
} from "@features/free-layout/components/ViewLevels";
import pageMessages from "@features/free-layout/components/FreeLayoutPages/FreeLayoutPages.lang";
import { floatingFloorCss, useFloatingRaised } from "@components/FloatingLayer";
import { AppBottomSheet, BottomSheetSnap } from "@components/AppBottomSheet";
import RotatePhoneOverlay from "@components/RotatePhoneOverlay";
import { APP_BAR_HEIGHT } from "../utils/HiddenOnScroll/HiddenOnScroll";
import SinglePageHeader from "@features/free-layout/components/FreeLayoutPages/SinglePageHeader";
import { useBeforePrintCheck } from "@features/free-layout/hooks/useBeforePrintCheck";
import {
  enterPageFullscreen,
  pageFrameId,
  scrollPageToTop,
  useAvailableHeight,
  useElementSize,
  useElementWidth,
  useFullscreenElementId,
  fullscreenScale,
} from "@features/free-layout/hooks/usePageView";
import { SectionTitle, SETTINGS_ROW_GAP } from "@/components/SettingsLayout";

/** La columna d'ajustos: el botó que l'amaga hi apunta amb `aria-controls`. */
const SETTINGS_COLUMN_ID = "view-settings-column";

/** L'aire entre el full i la columna, a l'escriptori, en px. */
const PREVIEW_COLUMN_GAP = 16;

/**
 * Al mòbil, el que queda a sobre del panell de baix no passa mai de la meitat
 * de la pantalla: a sencer, el full es queda a la mida de mig i el panell el
 * tapa, deixant-ne la franja que torna a mig (`docs/PLA-vista-mobil.md`, §4).
 */
const MOBILE_STAGE_BOTTOM = `min(${floatingFloorCss}, 50dvh)`;

/**
 * Al mòbil, el que ocupen els bàners que l'app posa a dalt del contingut (l'estil
 * propi del document, verificar el correu…), en px: van al flux de la pàgina, i
 * l'escenari del full, que és fix, ha de començar a sota perquè no els tapi.
 * Retorna on acaben (la vora de dalt de l'element `ref`, que va al flux just on
 * comença la vista), o zero si no n'hi ha cap; se segueix quan un bàner surt o
 * es tanca.
 */
const useBannersBottom = (): [(node: HTMLElement | null) => void, number] => {
  const [node, setNode] = useState<HTMLElement | null>(null);
  const [height, setHeight] = useState(0);
  useEffect(() => {
    const main = node?.closest("main");
    if (!node || !main) return undefined;
    const update = () => {
      const top = node.getBoundingClientRect().top;
      // Res entre el començament del contingut i la vista: no hi ha bàners
      setHeight(
        top - main.getBoundingClientRect().top > 0 ? Math.round(top) : 0,
      );
    };
    update();
    if (typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(update);
    observer.observe(main);
    return () => observer.disconnect();
  }, [node]);
  return [setNode, height];
};

/**
 * Porta un element a dalt del contenidor que es desplaça i el conté (al mòbil,
 * el contingut del panell de baix). No fa servir `scrollIntoView`: aquell
 * també podria desplaçar la pàgina, que al mòbil no s'ha de moure. El marge de
 * dalt de l'element (`scroll-margin-top`) es respecta.
 */
const scrollToTopOfScroller = (element: HTMLElement): void => {
  let scroller = element.parentElement;
  while (
    scroller &&
    !/(auto|scroll)/.test(getComputedStyle(scroller).overflowY)
  )
    scroller = scroller.parentElement;
  if (!scroller) return;
  const marginTop = parseFloat(getComputedStyle(element).scrollMarginTop) || 0;
  const top =
    scroller.scrollTop +
    element.getBoundingClientRect().top -
    scroller.getBoundingClientRect().top -
    marginTop;
  scroller.scrollTo?.({ top: Math.max(0, top), behavior: "smooth" });
};

/** L'`id` del nivell «Document»: les molles hi porten. */
const VIEW_DOCUMENT_LEVEL_ID = "view-level-document";

/** Quins nivells de la columna són desplegats. */
interface OpenLevels {
  document: boolean;
  page: boolean;
  block: boolean;
}

/**
 * Sense res seleccionat, tots oberts; amb una seqüència o un bloc, només el
 * seu nivell (P1). Si la pàgina té la mateixa configuració per a tots, els
 * ajustos són a la pàgina: llavors s'obre la pàgina.
 */
const levelsFor = (hasSelection: boolean, fromPage: boolean): OpenLevels => ({
  document: !hasSelection,
  page: !hasSelection || fromPage,
  block: true,
});

interface ViewSequencesSettingsChildrenProps {
  viewSettings: ViewSettings;
  sequenceViewSettings: { [key: number]: SequenceViewSettings };
  scale: number;
  author: string;
  /** Al full de la previsualització es pot seleccionar; a la pantalla completa, no */
  selectable: boolean;
}

interface ViewSequencesSettingsProps {
  children: (
    props: ViewSequencesSettingsChildrenProps,
  ) => React.ReactElement | React.ReactElement[];
}

/**
 * Orquestrador de la visualització de seqüències: gestiona hooks, handlers i composició
 */
const ViewSequencesSettingsContent = ({
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

  // Aquí hi havia un efecte que, en muntar-se la columna, posava les
  // preferències de l'usuari a totes les pestanyes: el `.saac` no es veia mai
  // com s'havia desat, i tornar-lo a desar en perdia la vista (B25). Ara la
  // document es veu sempre amb el seu estil, i les preferències només arriben
  // als documents nous, que l'hereten (`docs/fonaments/03-model-contingut-estil.md`).

  // La pàgina que es mira i el bloc seleccionat (R5): els nivells de la
  // columna els segueixen
  const { selection, clear: clearSelection, activePage } = useViewSelection();
  const selectedBlock = useSelectedBlock();
  const clearOnEscape = useClearOnEscape();
  const pages = useAppSelector(selectPages);
  const documentTitle = useAppSelector(selectDocumentTitle);
  const currentSelection = selectionKey(selection);
  // Amb un bloc seleccionat, sempre s'obre el seu nivell: la mida, l'espai i
  // l'alineació hi són, també amb «Igual a tots els blocs»
  const selectionFromPage = false;
  // Com es diuen les peces de la pàgina que es mira: seqüències o blocs
  const activeUnit =
    pages?.sheets[activePage]?.mode === "template" ? "blocks" : "sequences";
  // Amb un bloc seleccionat, Document i Pàgina es pleguen perquè el bloc quedi
  // a la vista (P1). Plegar-ne o desplegar-ne un a mà es respecta fins que
  // canvia la selecció
  const [openLevels, setOpenLevels] = useState<OpenLevels>(() =>
    levelsFor(currentSelection !== "", selectionFromPage),
  );
  // Només quan canvia la selecció: el que l'usuari plega a mà es respecta
  const fromPageRef = useRef(selectionFromPage);
  fromPageRef.current = selectionFromPage;
  useEffect(() => {
    setOpenLevels(levelsFor(currentSelection !== "", fromPageRef.current));
  }, [currentSelection]);
  const theme = useTheme();
  // Al mòbil, els ajustos van al panell de baix, i la seva alçada és estat
  // d'aquesta pantalla (no va a Redux ni enlloc)
  const [sheetSnap, setSheetSnap] = useState<BottomSheetSnap>("collapsed");
  const setLevelOpen =
    (level: keyof OpenLevels) =>
    (expanded: boolean): void =>
      setOpenLevels((current) => ({ ...current, [level]: expanded }));

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
    orientation,
    isLandscape,
    isFullscreen,
    setPageSize,
    toggleOrientation,
  } = usePageFormat({
    initialSize: pageLayout.pageSize ?? "A4",
    initialOrientation: pageLayout.orientation ?? "landscape",
    screen: pageLayout.screen,
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
  const viewSettings = useMemo(
    () => ({
      ...layoutViewSettings,
      sequenceSpaceBetween: documentStyle.view.sequenceSpaceBetween,
    }),
    [layoutViewSettings, documentStyle.view.sequenceSpaceBetween],
  );

  // L'autor és del document (B21): el seu, o el de les preferències de
  // l'usuari si encara l'hereta (un document nou que no s'ha desat)
  const documentAuthor = useAppSelector((state) => state.document.author);
  const author = documentAuthor ?? initialViewSettings.author ?? "";
  const updateAuthor = useCallback(
    (value: string) => dispatch(documentAuthorChangedActionCreator(value)),
    [dispatch],
  );

  // Disposició lliure (ADR-005): les pàgines i les seves caixes en lloc del
  // full del flux. També a la pantalla sencera, que és un paper virtual amb la
  // forma de la pantalla on es va encendre (`layoutAreaMm`)
  const isFreeLayout = useAppSelector(selectHasPages);

  // L'espai del full (`docs/PLA-mode-lliure.md`, §6, «L'espai»). A partir
  // d'escriptori, la columna d'ajustos es pot amagar perquè el full faci tota
  // l'amplada, i el full es pot ajustar a l'amplada en comptes d'encabir-lo
  // sencer: un full vertical, sencer, el limita l'alçada de la pantalla. Per
  // sota, la columna va sota el full i el full ja fa tota l'amplada: cap dels
  // dos botons no hi és. Són estat de la pàgina, no preferències: no es desen.
  const isWideScreen = isMediumScreen(screenWidth);
  // Al mòbil, l'espai que té el full per cabre-hi sencer: el que queda entre
  // la fila de dalt i el panell de baix
  const [sheetAreaRef, sheetArea] = useElementSize();
  // Amb el panell a mig o a sencer, la barra de l'app s'amaga i el full en
  // guanya l'alçada (M5)
  const panelRaised = useFloatingRaised();
  const [bannersRef, bannersBottom] = useBannersBottom();
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [fit, setFit] = useState<PreviewFit>("page");
  const settingsVisible = !isWideScreen || settingsOpen;
  // L'alçada de la columna: de la seva vora de dalt al peu de la finestra
  const columnRef = useRef<HTMLDivElement | null>(null);
  const columnHeight = useAvailableHeight(columnRef);
  // La pàgina única (sense pàgines pròpies), a pantalla completa
  const pageInFullscreen = useFullscreenElementId() === pageFrameId(0);

  // L'amplada que queda per al full al costat de la columna, mesurada: la
  // del contenidor menys la de la columna (amb el separador i l'aire)
  const layoutRef = useRef<HTMLDivElement | null>(null);
  const layoutWidth = useElementWidth(layoutRef);
  const columnWidth = useElementWidth(columnRef);
  const previewSpace =
    layoutWidth > 0 && columnWidth > 0
      ? layoutWidth - columnWidth - PREVIEW_COLUMN_GAP
      : undefined;

  // Càlculs d'escala
  const {
    displayWidth,
    displayHeight,
    scale: calculatedScale,
  } = useScaleCalculator(pageFormat, screenWidth, screenHeight, {
    fit: isWideScreen ? fit : "page",
    settingsBeside: isWideScreen && settingsOpen,
    // A l'escriptori, l'espai de debò que deixa la columna: amb finestres més
    // amples que el contenidor de l'app, o amb paper gran, el marge estimat no
    // n'hi ha prou i el full passava per sota de la columna
    availableWidth: isWideScreen
      ? previewSpace
      : sheetArea.width > 0
        ? sheetArea.width
        : undefined,
    // Al mòbil, el full s'encongeix per cabre sencer a sobre del panell (E1)
    availableHeight:
      !isWideScreen && sheetArea.height > 0 ? sheetArea.height : undefined,
  });

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

  // Aquí hi havia un «mirall de sessió» que copiava a `ui.viewSettings` el que
  // es veia: primer la pàgina i les mides, i al final només l'autor. Barrejava
  // la preferència desada amb el document obert (B21). Ara la pàgina (B26) i
  // l'autor són del document, i les preferències només canvien a la
  // configuració.
  const { direction } = layoutViewSettings;

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
    // Amb la pantalla sencera, el full canvia de mida i els blocs s'hi
    // recol·loquen (`changePageLayoutThunk`)
    dispatch(
      changePageLayoutThunk({ direction, pageSize, orientation }, current),
    );
  }, [dispatch, direction, pageSize, orientation]);

  /**
   * Handler de la descàrrega del PDF.
   * El botó continua sent focusable mentre genera (aria-disabled), així que el
   * clic repetit el para aquí: el backdrop del hook ja diu què està passant.
   */
  // En mode lliure, si hi ha seqüències sense col·locar o pàgines buides, es
  // diu abans d'imprimir o de fer el PDF (ADR-005). Ctrl+P no passa per aquí:
  // imprimeix el que es veu, que és el que diu la columna
  const { check: checkBeforePrint, dialog: beforePrintDialog } =
    useBeforePrintCheck();

  const handleDownloadPdf = useCallback(() => {
    if (isGenerating) return;
    checkBeforePrint("pdf", () => void downloadPdf());
  }, [isGenerating, downloadPdf, checkBeforePrint]);

  /**
   * Handler per imprimir amb orientació correcta
   */
  const handlePrint = useCallback(() => {
    checkBeforePrint("print", () => {
      (document.activeElement as HTMLElement)?.blur();
      printWithOrientation(pageFormat);
      trackEvent({
        event: "click-print-view",
        event_category: "View",
        event_label: "Print view",
        value: `size_${viewSettings.sizePict}`,
      });
    });
  }, [pageFormat, viewSettings.sizePict, checkBeforePrint]);

  // Els nivells de la columna (R8): Document, Pàgina N i, si n'hi ha, el bloc
  const sheetCount = isFreeLayout && pages ? pages.sheets.length : 1;
  const pageNumber = Math.min(activePage, sheetCount - 1) + 1;
  const pageTitle = intl.formatMessage(pageMessages.pageLabel, {
    number: pageNumber,
    total: sheetCount,
  });
  const paperName =
    pageSize === "A4" || pageSize === "A3"
      ? pageSize
      : intl.formatMessage(
          pageSize === "LETTER"
            ? messages.pageSizeLetter
            : pageSize === "TABLOID"
              ? messages.pageSizeTabloid
              : messages.fullScreen,
        );
  const documentSummary = [
    isFullscreen
      ? paperName
      : `${paperName} ${intl.formatMessage(
          isLandscape
            ? levelMessages.landscapeShort
            : levelMessages.portraitShort,
        )}`,
    intl.formatMessage(levelMessages.documentPages, { count: sheetCount }),
  ].join(" · ");
  const crumbs: LevelCrumb[] = [
    {
      levelId: VIEW_DOCUMENT_LEVEL_ID,
      label: intl.formatMessage(levelMessages.document),
    },
    { levelId: VIEW_PAGE_LEVEL_ID, label: pageTitle },
    ...(selectedBlock
      ? [{ levelId: VIEW_BLOCK_LEVEL_ID, label: selectedBlock.name }]
      : []),
  ];
  // Una molla obre el seu nivell, el porta a la vista i hi deixa el focus
  const goToLevel = (levelId: string) => {
    const level: keyof OpenLevels =
      levelId === VIEW_DOCUMENT_LEVEL_ID
        ? "document"
        : levelId === VIEW_PAGE_LEVEL_ID
          ? "page"
          : "block";
    setLevelOpen(level)(true);
    // Al mòbil, el panell plegat puja a mig: les molles també hi porten
    if (!isWideScreen && sheetSnap === "collapsed") setSheetSnap("half");
    requestAnimationFrame(() => {
      const header = document.getElementById(`${levelId}-header`);
      if (isWideScreen)
        header?.scrollIntoView?.({ behavior: "smooth", block: "start" });
      else {
        const levelElement = document.getElementById(levelId);
        if (levelElement) scrollToTopOfScroller(levelElement);
      }
      header?.focus({ preventScroll: true });
    });
  };

  // El full demana obrir uns ajustos (un toc a un bloc o al full, D1 i D2): al
  // mòbil, el panell va a mig amb el nivell obert i a dalt. Després de
  // l'efecte de la selecció, que ja ha plegat o obert els nivells
  const { settingsRequest } = useViewSelection();
  const isWideRef = useRef(isWideScreen);
  isWideRef.current = isWideScreen;
  useEffect(() => {
    if (!settingsRequest || isWideRef.current) return;
    if (settingsRequest.level === "page")
      setOpenLevels({ document: false, page: true, block: false });
    setSheetSnap("half");
    // Quan els nivells s'han plegat i el contingut del panell es veu
    const timer = window.setTimeout(() => {
      const level = document.getElementById(
        settingsRequest.level === "page"
          ? VIEW_PAGE_LEVEL_ID
          : VIEW_BLOCK_LEVEL_ID,
      );
      if (level) scrollToTopOfScroller(level);
    }, theme.transitions.duration.standard);
    return () => window.clearTimeout(timer);
  }, [settingsRequest, theme.transitions.duration.standard]);

  /**
   * Els botons de la vista: girar el full, imprimir, PDF, pantalla completa,
   * ajustar i amagar la columna. A l'escriptori són a dalt de la columna (i
   * en columna quan la columna és amagada); al mòbil, a sobre del full.
   */
  // Botons només-icona: l'aria-label sempre repeteix el mateix missatge
  // que el tooltip. El tooltip no s'obre en tàctil, així que l'aria-label
  // és l'únic nom del botó; i fer-los coincidir compleix el criteri WCAG
  // 2.5.3 (el nom llegit conté el text visible).
  // Al mòbil, girar el full no és una sortida: és un ajust del nivell
  // «Document» (M4). Amb un paper, les sortides són imprimir i PDF; la
  // pantalla completa només hi és amb la pantalla sencera, que és per mirar el
  // document a la pantalla i no s'imprimeix (decisió de l'usuari, 2026-11-19)
  const renderToolbar = (
    vertical: boolean,
    withRotate = true,
  ): React.ReactElement => (
    <Stack direction={vertical ? "column" : "row"} sx={{ flexShrink: 0 }}>
      {!isFullscreen ? (
        <>
          {withRotate && (
            <Tooltip title={intl.formatMessage(messages.tooltipOrientation)}>
              <StyledIconButton
                aria-label={intl.formatMessage(messages.tooltipOrientation)}
                color="inherit"
                sx={{ fontSize: "2rem" }}
                onClick={toggleOrientation}
              >
                <MdScreenRotation />
              </StyledIconButton>
            </Tooltip>
          )}
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
          <Tooltip title={intl.formatMessage(messages.tooltipDownloadPdf)}>
            {/* aria-disabled i no `disabled`: un botó desactivat surt de
                  l'ordre de tabulació i qui hi navega amb teclat el perd
                  de sota els dits sense cap avís. Sense `disabled` tampoc
                  cal el <span> embolcall: el Tooltip ja rep els events del
                  Button i l'aria-label es queda on ha de ser. */}
            <StyledIconButton
              aria-label={intl.formatMessage(messages.tooltipDownloadPdf)}
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
          <Tooltip title={intl.formatMessage(messages.tooltipFullscreen)}>
            <StyledIconButton
              aria-label={intl.formatMessage(messages.tooltipFullscreen)}
              color="inherit"
              sx={{ fontSize: "2rem" }}
              // Amb pàgines pròpies, les pàgines una a una, amb els seus
              // blocs i lliscant (com amb un paper); sense, el flux de sempre
              onClick={
                isFreeLayout
                  ? () => enterPageFullscreen(activePage)
                  : enterFullscreen
              }
            >
              <AiOutlineFullscreen />
            </StyledIconButton>
          </Tooltip>
        )
      )}
      {isWideScreen && !isFullscreen && (
        <Tooltip
          title={intl.formatMessage(
            fit === "page" ? messages.tooltipFitWidth : messages.tooltipFitPage,
          )}
        >
          <StyledIconButton
            aria-label={intl.formatMessage(
              fit === "page"
                ? messages.tooltipFitWidth
                : messages.tooltipFitPage,
            )}
            color="inherit"
            sx={{ fontSize: "2rem" }}
            onClick={() => {
              // I la pàgina, a dalt de tot amb la mida nova
              setFit((current) => (current === "page" ? "width" : "page"));
              scrollPageToTop(isFreeLayout ? activePage : 0);
            }}
          >
            {fit === "page" ? (
              <TbArrowAutofitWidth />
            ) : (
              <TbArrowAutofitHeight />
            )}
          </StyledIconButton>
        </Tooltip>
      )}
      {isWideScreen && (
        <Tooltip
          title={intl.formatMessage(
            settingsOpen
              ? messages.tooltipHideSettings
              : messages.tooltipShowSettings,
          )}
        >
          <StyledIconButton
            aria-label={intl.formatMessage(
              settingsOpen
                ? messages.tooltipHideSettings
                : messages.tooltipShowSettings,
            )}
            aria-expanded={settingsOpen}
            aria-controls={SETTINGS_COLUMN_ID}
            color="inherit"
            sx={{ fontSize: "2rem" }}
            onClick={() => setSettingsOpen((open) => !open)}
          >
            {settingsOpen ? (
              <TbLayoutSidebarRightCollapse />
            ) : (
              <TbLayoutSidebarRightExpand />
            )}
          </StyledIconButton>
        </Tooltip>
      )}
    </Stack>
  );

  // Al mòbil, un toc a l'espai de la pàgina única, fora de les seqüències
  // (que aturen el seu): treu la selecció i obre el nivell «Pàgina» (D2). Les
  // seqüències no es mouen: un toc ja hi porta
  const { requestSettings } = useViewSelection();
  const handleSingleSheetTap = (event: React.MouseEvent<HTMLElement>) => {
    const interactive = (event.target as Element).closest?.(
      "button, a, input, [role='button']",
    );
    if (interactive && event.currentTarget.contains(interactive)) return;
    clearSelection();
    requestSettings("page");
  };

  // La pàgina única (sense pàgines pròpies): la capçalera, el full i
  // «Afegeix una pàgina» a sota
  const singlePage = (
    <Stack
      sx={{ minWidth: 0, ...(!isWideScreen && { flex: 1, minHeight: 0 }) }}
    >
      {/* La capçalera de la pàgina única, com la de les pàgines del
          document: des de l'inici s'hi poden afegir pàgines, també a la
          pantalla sencera */}
      <SinglePageHeader
        slot="header"
        onFocusPage={() => {
          setFit("page");
          scrollPageToTop(0);
        }}
      />
      {/* Al mòbil, l'espai que té el full: s'hi encongeix sencer (E1) */}
      <Box
        ref={isWideScreen ? undefined : sheetAreaRef}
        data-testid={isWideScreen ? undefined : "view-sheet-area"}
        onClick={isWideScreen ? undefined : handleSingleSheetTap}
        sx={
          isWideScreen
            ? { display: "contents" }
            : {
                flex: 1,
                minHeight: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }
        }
      >
        {/* Contenidor exterior: dimensions visuals de pantalla */}
        {/* Un clic fora de cap seqüència treu la selecció; Escape també */}
        <Box
          className="preview-container"
          id={pageFrameId(0)}
          onClick={isWideScreen ? clearSelection : undefined}
          onKeyDown={clearOnEscape}
          sx={{
            width: displayWidth,
            height: displayHeight,
            minWidth: 0,
            flexShrink: 0,
            overflow: "hidden",
            // Amb una seqüència seleccionada, la pàgina es ressalta com
            // les del mode lliure
            ...pageFrameSx(selection !== null),
            marginBottom: { md: 1 },
            "@media print": {
              marginBottom: 0,
              outline: "none",
              boxShadow: "none",
            },
            // El full és paper en tots dos temes: aquesta previsualització ha de
            // ser idèntica al que sortirà per impressora i al PDF
            backgroundColor: sheetSurface,
            // A pantalla completa, el full al mig i tan gran com hi càpiga
            "&:fullscreen": {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              outline: "none",
              boxShadow: "none",
            },
            "&:fullscreen [data-html2canvas-ignore]": {
              display: "none",
            },
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
              transform: `scale(${
                pageInFullscreen
                  ? fullscreenScale(pageFormat.dimensions)
                  : calculatedScale
              })`,
              transformOrigin: pageInFullscreen ? "center" : "top left",
              flexShrink: 0,
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
                selectable: true,
              })}
            </Stack>

            {/* Al peu del full, dins del flux: només es pinta al paper i al
                PDF, i allà s'hi reserva l'espai perquè no caigui damunt de
                l'última fila de pictogrames */}
            <CopyRight author={author} licence={viewSettings.licence} />
          </Box>
        </Box>
      </Box>

      {/* «Afegeix una pàgina» sota el full, com a les pàgines del document */}
      <SinglePageHeader slot="footer" />
    </Stack>
  );

  // El full: les pàgines del document, o la pàgina única de sempre
  const sheets = isFreeLayout ? (
    <FreeLayoutPages
      pageDimensions={pageFormat.dimensions}
      displayWidth={displayWidth}
      displayHeight={displayHeight}
      scale={calculatedScale}
      author={author}
      licence={viewSettings.licence}
      onFocusPage={(index) => {
        // La pàgina sencera, a dalt de tot i tan gran com hi càpiga
        setFit("page");
        scrollPageToTop(index);
      }}
      sheetAreaRef={isWideScreen ? undefined : sheetAreaRef}
    />
  ) : (
    singlePage
  );

  // On s'és: Document › Pàgina N › el bloc. A l'escriptori, fixes a dalt de
  // la columna; al mòbil, a la capçalera del panell, on es veuen sempre
  const crumbsNode = <LevelCrumbs crumbs={crumbs} onGo={goToLevel} />;

  // Els tres nivells, lligats per la línia de la cascada. La columna no sap
  // on la munten: a l'escriptori, al costat del full; al mòbil, al panell
  const settingsLevels = (
    <SettingsLevels>
      {/* Nivell 1: el que s'aplica a tot el document */}
      <SettingsLevel
        id={VIEW_DOCUMENT_LEVEL_ID}
        icon={<MdOutlineDescription />}
        kind={<FormattedMessage {...levelMessages.document} />}
        title={
          documentTitle?.trim() || (
            <FormattedMessage {...levelMessages.untitled} />
          )
        }
        scope={<FormattedMessage {...levelMessages.documentScope} />}
        summary={documentSummary}
        expanded={openLevels.document}
        onExpandedChange={setLevelOpen("document")}
      >
        <SectionTitle
          title={<FormattedMessage {...messages.sectionPageFormat} />}
        >
          {/* El paper, i a sota la pantalla sencera. La direcció i l'espai
              entre seqüències són de cada pàgina. Al mòbil, girar el full
              també és aquí (M4) */}
          <GlobalViewControls
            viewSettings={{ ...viewSettings, orientation }}
            pageSize={pageSize}
            sequenceCount={1}
            showDirection={false}
            onPageSizeChange={setPageSize}
            onDirectionChange={handleDirectionChange}
            onSequenceSpaceChange={handleSequenceSpaceChange}
            onOrientationChange={
              !isWideScreen && !isFullscreen
                ? (value) => {
                    if (value !== orientation) toggleOrientation();
                  }
                : undefined
            }
          />
        </SectionTitle>

        {/* Les seqüències que no són a cap pàgina */}
        <FreeLayoutSettings />

        {/* El que només surt al peu del full imprès i del PDF */}
        <PrintFooterSection
          author={author}
          onAuthorChange={updateAuthor}
          licence={viewSettings.licence}
          onLicenceChange={(value) => updateViewSetting("licence", value)}
        >
          <LicencePagesRow />
        </PrintFooterSection>
      </SettingsLevel>

      {/* Nivell 2: la pàgina que es mira, contínua o en blocs. Sense
          pàgines pròpies, la direcció i l'espai són els de sempre */}
      <PageLevel
        expanded={openLevels.page}
        onExpandedChange={setLevelOpen("page")}
        implicit={{
          direction,
          onDirectionChange: (value) => updateViewSetting("direction", value),
          gap: viewSettings.sequenceSpaceBetween,
          onGapChange: (value) =>
            dispatch(
              setSequenceSpaceBetweenActionCreator({
                value,
                styleView: documentStyle.view,
              }),
            ),
        }}
      />

      {/* Nivell 3: el bloc seleccionat, o com s'hi arriba */}
      {selectedBlock ? (
        <BlockLevel
          expanded={openLevels.block}
          onExpandedChange={setLevelOpen("block")}
        />
      ) : (
        <SettingsLevel
          id={VIEW_BLOCK_LEVEL_ID}
          icon={<BlockIcon />}
          kind={
            <FormattedMessage
              {...levelMessages.kindBlock}
              values={{ unit: activeUnit }}
            />
          }
          title={
            <FormattedMessage
              {...levelMessages.noBlock}
              values={{ unit: activeUnit }}
            />
          }
          scope={
            <FormattedMessage
              {...levelMessages.noSelection}
              values={{ unit: activeUnit }}
            />
          }
        />
      )}
    </SettingsLevels>
    // Aquí hi havia el peu de la columna: «Aplica el meu estil» i «Desa com
    // a preferència». Els estils van en una sola direcció, de la configuració
    // cap al document (R10): el meu estil s'aplica des del menú «⋯» de la
    // pàgina i del bloc, i la pàgina dels documents nous es tria a la
    // configuració
  );

  return (
    <>
      <form onSubmit={(event) => event.preventDefault()}>
        {isWideScreen ? (
          <Stack
            ref={layoutRef}
            direction="row"
            flexWrap="nowrap"
            // Sense la columna al costat, el full va al mig de l'espai que queda
            justifyContent={settingsVisible ? "flex-start" : "center"}
          >
            {sheets}

            {/* La columna: empesa sempre a la vora dreta, amb els botons de la
                vista a dalt i, a sota, els ajustos (el verd), que fan tota
                l'alçada de la finestra i es desplacen per dins. Amagada, la
                columna continua muntada: així el botó hi pot apuntar i, en
                tornar, cada nivell és com s'havia deixat */}
            <Box
              ref={columnRef}
              sx={{
                marginLeft: "auto",
                display: "flex",
                gap: 3,
                alignItems: "stretch",
                flexShrink: 0,
                // Enganxada mentre es baixa per les pàgines (R5)
                position: "sticky",
                top: 0,
                alignSelf: "flex-start",
                height: columnHeight,
              }}
            >
              {settingsVisible && (
                <NotPrint>
                  <Divider orientation="vertical" />
                </NotPrint>
              )}
              <Stack sx={{ height: "100%", minHeight: 0 }}>
                <NotPrint>
                  <Stack direction="row" justifyContent="end">
                    {renderToolbar(!settingsOpen)}
                  </Stack>
                </NotPrint>
                <Box
                  id={SETTINGS_COLUMN_ID}
                  onKeyDown={clearOnEscape}
                  sx={{
                    display: settingsVisible ? "block" : "none",
                    flex: 1,
                    minHeight: 0,
                    overflowY: "auto",
                  }}
                >
                  <NotPrint>
                    <Stack
                      maxWidth={VIEW_SETTINGS_COLUMN_WIDTH}
                      flexShrink={0}
                      spacing={SETTINGS_ROW_GAP}
                      sx={{
                        // Zona de configuració: fons paper a tota la columna
                        // de controls, i com a mínim tota l'alçada que hi ha
                        backgroundColor: "background.paper",
                        borderRadius: 2,
                        padding: 1.5,
                        minHeight: "100%",
                        boxSizing: "border-box",
                      }}
                    >
                      {crumbsNode}
                      {settingsLevels}
                    </Stack>
                  </NotPrint>
                </Box>
              </Stack>
            </Box>
          </Stack>
        ) : (
          <>
            {/* Al mòbil la pàgina no es desplaça: el full ocupa l'espai entre
                la barra de dalt (que s'amaga quan el panell puja) i el panell
                de baix, i s'hi encongeix sencer (`docs/PLA-vista-mobil.md`).
                Sense scroll de pàgina, no hi ha res a perdre (§1) */}
            <GlobalStyles
              styles={{
                "@media screen": {
                  "html, body": {
                    overflow: "hidden",
                    overscrollBehavior: "none",
                  },
                },
              }}
            />
            {/* On comença la vista al flux: sota els bàners de l'app */}
            <Box ref={bannersRef} aria-hidden />
            <Box
              data-testid="view-mobile-stage"
              sx={(muiTheme) => ({
                position: "fixed",
                left: 0,
                right: 0,
                // Sota la barra i els bàners de l'app; amb el panell a mig o a
                // sencer, la barra s'amaga i el full en guanya l'alçada (els
                // bàners hi queden sota fins que el panell baixa)
                top: panelRaised ? 0 : Math.max(APP_BAR_HEIGHT, bannersBottom),
                bottom: MOBILE_STAGE_BOTTOM,
                display: "flex",
                flexDirection: "column",
                // Opac: quan puja per damunt dels bàners, no s'hi han de veure
                backgroundColor: "background.default",
                paddingInline: 0.5,
                paddingBottom: 1,
                transition: `top ${muiTheme.transitions.duration.standard}ms`,
                "@media print": { position: "static" },
              })}
            >
              {/* Les sortides del document, a dalt de tot (M4): s'amaguen
                  amb la barra de l'app quan el panell puja, i el full en
                  guanya l'alçada */}
              <Collapse
                in={!panelRaised}
                timeout={theme.transitions.duration.standard}
                sx={{ flexShrink: 0 }}
              >
                <NotPrint>
                  {/* Aire a sobre: sota la barra verda no hi ha de quedar enganxada */}
                  <Stack direction="row" justifyContent="end" sx={{ pt: 1.5 }}>
                    {renderToolbar(false, false)}
                  </Stack>
                </NotPrint>
              </Collapse>
              {sheets}
            </Box>

            <NotPrint>
              <AppBottomSheet
                snap={sheetSnap}
                onSnapChange={setSheetSnap}
                label={intl.formatMessage(messages.mobileSettings)}
                showLabel={intl.formatMessage(messages.mobileShowSettings)}
                hideLabel={intl.formatMessage(messages.mobileHideSettings)}
                returnLabel={intl.formatMessage(messages.mobileBackToSheet)}
                header={crumbsNode}
              >
                <Stack
                  id={SETTINGS_COLUMN_ID}
                  onKeyDown={clearOnEscape}
                  spacing={SETTINGS_ROW_GAP}
                  sx={{ paddingInline: 1, paddingBottom: 1.5 }}
                >
                  {settingsLevels}
                </Stack>
              </AppBottomSheet>
            </NotPrint>
          </>
        )}
      </form>

      {/* Al mòbil girat, la vista no es treballa (M6, N3) */}
      <RotatePhoneOverlay
        message={intl.formatMessage(messages.mobileRotatePhone)}
      />
      {beforePrintDialog}

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
          selectable: false,
        })}
      </Stack>
    </>
  );
};

/**
 * La vista amb la selecció i la pàgina activa (R5), que comparteixen el full i
 * la columna.
 */
const ViewSequencesSettings = (
  props: ViewSequencesSettingsProps,
): React.ReactElement => (
  <ViewSelectionProvider>
    <ViewSequencesSettingsContent {...props} />
  </ViewSelectionProvider>
);

export default ViewSequencesSettings;
