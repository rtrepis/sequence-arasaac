import {
  Alert,
  Box,
  List,
  Slide,
  Snackbar,
  Stack,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import PictogramCard from "../PictogramCard/PictogramCard";
import PictogramSearch from "../PictogramSearch/PictogramSearch";
import {
  Border,
  Hair,
  PictogramCardDefaults,
  PictSequence,
  Skin,
  TextPosition,
} from "../../types/sequence";
import SettingAccordion from "../SettingAccordion/SettingAccordion";
import messages from "./PictEditForm.lang";
import SettingCard from "../SettingsCards/SettingCard/SettingCard";
import { useIntl } from "react-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { updatePictSequenceActionCreator } from "@features/sequence/store/documentSlice";
import SettingCadTextFiled from "../SettingsCards/SettingCardTextFiled/SettingCardTextFiled";
import SettingCardBoolean from "../SettingsCards/SettingCardBoolean/SettingCardBoolean";
import React from "react";
import SettingCardBorder from "../SettingsCards/SettingCardBorder/SettingCardBorder";
import { MdSettingsBackupRestore, MdTune } from "react-icons/md";
import {
  selectDocumentPictStyle,
  selectDocumentStyle,
} from "@features/sequence/style/styleSelectors";
import {
  isPictogramCustomized,
  resetPictogramStyle,
} from "@features/sequence/style/pictogramStyle";
import { APP_TOUCH_TARGET_MIN } from "@/style/appShape";
import {
  floatingNoticeSx,
  floatingSnackbarSx,
} from "@components/FloatingLayer";
import StyledButton from "@/style/StyledButton";
import StyledIconButton from "@/style/StyledIconButton";
import { SETTINGS_MOBILE_BREAKPOINT } from "@components/SettingsLayout";
import { Theme } from "@mui/material/styles";
import ScaleToFit from "@components/SettingsLayout/ScaleToFit";

interface PictEditFormProps {
  pictogram: PictSequence;
  submit: boolean;
  /** Avisa si el pictograma que s'edita té retocs propis (el menú del diàleg) */
  onCustomizedChange?: (customized: boolean) => void;
  /**
   * Cada canvi d'aquest número demana «Restableix» des de fora del formulari:
   * el menú «Més accions» del diàleg, que és l'única via a iOS
   */
  resetRequest?: number;
}

/** Prou temps per llegir-lo i arribar a «Desfés» amb el teclat */
const RESET_SNACKBAR_DURATION_MS = 10000;

/**
 * La còpia fixa de la previsualització baixa des de dalt en entrar i hi torna
 * en marxar, amb el mateix temps i la mateixa corba, perquè cap dels dos
 * moviments no sembli de cop. Mai amb moviment reduït.
 */
const PREVIEW_COPY_MS = 220;
const PREVIEW_COPY_EASING = "cubic-bezier(0.4, 0, 0.2, 1)";

/**
 * Quina part de la previsualització original pot quedar a la vista quan ja
 * surt la còpia: així entra una mica abans que l'original acabi de marxar
 */
const PREVIEW_COPY_VISIBLE_RATIO = 0.35;

/** Els valors d'estil que «Restableix» canvia al formulari, per poder-los desfer */
interface StyleSnapshot {
  textPosition: TextPosition;
  borderIn: Border;
  borderOut: Border;
  skin: Skin;
  hair: Hair;
  color: boolean;
  fitzgerald: string | undefined;
  resetDone: boolean;
}

const PictEditForm = ({
  pictogram,
  submit,
  onCustomizedChange,
  resetRequest,
}: PictEditFormProps): React.ReactElement => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const {
    pictSequence: {
      textPosition: defaultTextPosition,
      borderIn: defaultBorderIn,
      borderOut: defaultBorderOut,
      numbered: defaultNumbered,
      font: defaultFont,
      numberFont: defaultNumberFont,
    },
    pictApiAra: {
      skin: defaultSkin,
      hair: defaultHair,
      color: defaultColor,
      fitzgerald: noCategoryColor,
    },
    // L'estil del document, no les preferències de qui l'edita
  } = useAppSelector(selectDocumentPictStyle);
  const documentStyle = useAppSelector(selectDocumentStyle);

  // «Restableix» és una edició més del formulari: es desa en tancar-lo, com
  // tota la resta (fonament 03, §5). També treu la lletra, que el formulari no
  // edita. El snackbar ofereix «Desfés», que torna l'estil d'abans al formulari
  const [resetDone, setResetDone] = useState(false);
  const [resetUndo, setResetUndo] = useState<StyleSnapshot | null>(null);
  const [resetNotice, setResetNotice] = useState(0);
  // On va el focus quan «Restableix» desapareix: el botó de la capçalera
  const summaryRef = useRef<HTMLButtonElement>(null);

  const initialTextPosition =
    pictogram.settings.textPosition ?? defaultTextPosition;
  const [textPosition, setTextPosition] = useState(initialTextPosition);
  const [text, setText] = useState(pictogram.text);

  const initialSkin = pictogram.img.settings.skin ?? defaultSkin;
  const [skin, setSkin] = useState(initialSkin);

  const initialHair = pictogram.img.settings.hair ?? defaultHair;
  const [hair, setHair] = useState(initialHair);

  const initialSearch = {
    selectedId: pictogram.img.selectedId,
    fitzgerald: pictogram.img.settings.fitzgerald,
    url: pictogram.img.url,
    color: pictogram.img.settings.color,
    hair: pictogram.img.settings.hair,
    skin: pictogram.img.settings.skin,
    category: pictogram.img.category,
  };
  const [search, setSearch] = useState(initialSearch);
  const { fitzgerald, selectedId, url, category } = search;

  // El pictograma admet configuració de color quan la propietat existeix.
  // `false` és un valor vàlid (pictograma en blanc i negre), no absència.
  const isColorizable = search.color !== undefined;

  const [cross, setCross] = useState(pictogram.cross);

  const initialColor = pictogram.img.settings.color ?? defaultColor;
  const [color, setColor] = useState(initialColor);

  const initialBorderIn = pictogram.settings.borderIn ?? defaultBorderIn;
  const [borderIn, setBorderIn] = useState(initialBorderIn);

  const initialBorderOut = pictogram.settings.borderOut ?? defaultBorderOut;
  const [borderOut, setBorderOut] = useState(initialBorderOut);

  // Valors per defecte globals per al fallback de PictogramCard
  const defaults: PictogramCardDefaults = {
    numbered: defaultNumbered,
    fitzgerald: noCategoryColor,
    font: defaultFont,
    numberFont: defaultNumberFont,
    borderIn,
    borderOut,
  };

  // Pell, cabell i color només si el pictograma els admet: ARASAAC no en dona
  // a tots, i el que no admet no s'ha d'escriure
  const variantSettings = {
    fitzgerald,
    ...(search.skin !== undefined && { skin }),
    ...(search.hair !== undefined && { hair }),
    ...(search.color !== undefined && { color }),
  };

  // Els retocs que es desen: després de «Restableix», només el que s'ha tornat
  // a tocar aquí; si no, també els que el formulari no edita
  const resetSettings = (settings: PictSequence["settings"]) =>
    resetDone
      ? { textPosition, borderIn, borderOut }
      : { ...settings, textPosition, borderIn, borderOut };

  const pictogramGuide: PictSequence = {
    ...pictogram,
    img: {
      ...pictogram.img,
      url,
      selectedId,
      settings: variantSettings,
      category,
    },
    settings: resetSettings(pictogram.settings),
    text,
    cross,
  };

  // El pictograma tal com és ara, per a l'hora de desar. En una ref i no a les
  // dependències: desar-lo el canvia, i tornaria a disparar el desat
  const pictogramRef = useRef(pictogram);
  pictogramRef.current = pictogram;

  const handlerSubmit = useCallback(() => {
    const pictogram = pictogramRef.current;
    // Canviar un pictograma només en canvia el que s'ha tocat: l'identificador,
    // els camps del fitxer i els retocs que aquest formulari no edita (la
    // lletra) es conserven
    const newPictogram: PictSequence = {
      ...pictogram,
      indexSequence: pictogram.indexSequence,
      img: {
        ...pictogram.img,
        searched: pictogram.img.searched,
        url,
        selectedId,
        settings: variantSettings,
        category,
      },
      settings: resetSettings(pictogram.settings),
      text,
      cross,
    };

    dispatch(updatePictSequenceActionCreator(newPictogram));
    // `variantSettings` i `resetSettings` es tornen a crear a cada render: les
    // dependències són els valors de què surten
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    category,
    resetDone,
    search.skin,
    search.hair,
    search.color,
    selectedId,
    fitzgerald,
    skin,
    hair,
    color,
    textPosition,
    text,
    cross,
    dispatch,
    url,
    borderIn,
    borderOut,
  ]);

  useEffect(() => {
    if (submit) handlerSubmit();
  }, [submit, handlerSubmit]);

  // Té retocs propis respecte de l'estil del document?
  const isCustomized = isPictogramCustomized(pictogramGuide, documentStyle);
  useEffect(() => {
    onCustomizedChange?.(isCustomized);
  }, [isCustomized, onCustomizedChange]);

  // «Restableix»: el pictograma torna a l'estil del document. El Fitzgerald
  // torna al color de la seva categoria; la categoria, que és contingut, es
  // queda (fonament 03, «El color de Fitzgerald»)
  const handleReset = () => {
    setResetUndo({
      textPosition,
      borderIn,
      borderOut,
      skin,
      hair,
      color,
      fitzgerald,
      resetDone,
    });
    const reset = resetPictogramStyle(pictogramGuide, documentStyle);
    setTextPosition(reset.settings.textPosition ?? defaultTextPosition);
    setBorderIn(reset.settings.borderIn ?? defaultBorderIn);
    setBorderOut(reset.settings.borderOut ?? defaultBorderOut);
    setSkin(defaultSkin);
    setHair(defaultHair);
    setColor(defaultColor);
    setSearch((previous) => ({
      ...previous,
      fitzgerald: reset.img.settings.fitzgerald,
    }));
    setResetDone(true);
    setResetNotice((notice) => notice + 1);
    // «Restableix» desapareix: el focus no s'ha de perdre
    summaryRef.current?.focus();
  };

  // «Desfés»: l'estil d'abans torna al formulari; la resta d'edicions no es toca
  const handleUndoReset = () => {
    if (!resetUndo) return;
    setTextPosition(resetUndo.textPosition);
    setBorderIn(resetUndo.borderIn);
    setBorderOut(resetUndo.borderOut);
    setSkin(resetUndo.skin);
    setHair(resetUndo.hair);
    setColor(resetUndo.color);
    setSearch((previous) => ({
      ...previous,
      fitzgerald: resetUndo.fitzgerald,
    }));
    setResetDone(resetUndo.resetDone);
    setResetUndo(null);
    summaryRef.current?.focus();
  };

  // «Restableix l'estil» des del menú «Més accions» del diàleg
  const handleResetRef = useRef(handleReset);
  handleResetRef.current = handleReset;
  useEffect(() => {
    if (resetRequest) handleResetRef.current();
  }, [resetRequest]);

  // L'acordió es controla des d'aquí
  const [settingsOpen, setSettingsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // La previsualització original es queda on és. Quan surt de la vista per
  // dalt, en surt una còpia compacta fixa a dalt de la zona que es desplaça;
  // quan l'original torna a la vista, la còpia desapareix
  const previewRef = useRef<HTMLDivElement>(null);
  const [previewAway, setPreviewAway] = useState(false);
  const [copyFrame, setCopyFrame] = useState<HTMLDivElement | null>(null);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  useEffect(() => {
    const preview = previewRef.current;
    const scroller = rootRef.current?.closest(".MuiDialogContent-root");
    if (!preview || !scroller) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const top = entry.rootBounds?.top ?? 0;
        // Marxa per dalt i ja se'n veu menys d'una part: la còpia entra
        setPreviewAway(
          entry.boundingClientRect.top < top &&
            entry.intersectionRatio < PREVIEW_COPY_VISIBLE_RATIO,
        );
      },
      {
        root: scroller,
        threshold: [0, PREVIEW_COPY_VISIBLE_RATIO, 1],
      },
    );
    observer.observe(preview);
    return () => observer.disconnect();
  }, []);

  // La còpia és només per a la vista: el lector i el teclat la salten
  const previewCopyRef = useCallback((element: HTMLDivElement | null) => {
    element?.setAttribute("inert", "");
  }, []);

  // «Restableix», a la capçalera de la configuració. Per sota de `sm` només hi
  // va la icona: amb el text, el títol de la capçalera es partiria en dues
  // línies justament quan apareix, i el que s'edita a sota es mouria
  const compact = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down(SETTINGS_MOBILE_BREAKPOINT),
  );
  const resetLabel = intl.formatMessage(messages.reset);
  const resetAction = compact ? (
    <Tooltip title={resetLabel}>
      <StyledIconButton
        color="inherit"
        onClick={handleReset}
        aria-label={resetLabel}
      >
        <MdSettingsBackupRestore />
      </StyledIconButton>
    </Tooltip>
  ) : (
    <Tooltip title={intl.formatMessage(messages.tooltipReset)} describeChild>
      <StyledButton
        variant="outlined"
        color="inherit"
        onClick={handleReset}
        startIcon={<MdSettingsBackupRestore aria-hidden />}
        sx={{ minHeight: APP_TOUCH_TARGET_MIN, flexShrink: 0 }}
      >
        {resetLabel}
      </StyledButton>
    </Tooltip>
  );

  const card = (
    <PictogramCard
      pictogram={pictogramGuide}
      defaults={defaults}
      variant="plane"
      view="complete"
      size={{ scale: 0.8 }}
    />
  );

  return (
    // Contenidor invisible: el marc de la còpia fixa, que ha de fer tota
    // l'alçada del formulari. La graella de sota és la de sempre
    <Box ref={rootRef} sx={{ overflowAnchor: "none" }}>
      {/* Alçada zero: no mou res; la còpia hi penja per sobre, i en entrar
          baixa des de dalt de la zona que es desplaça, que la retalla */}
      <Box
        ref={setCopyFrame}
        aria-hidden="true"
        sx={{ position: "sticky", top: 0, height: 0, zIndex: 6 }}
      >
        <Slide
          in={previewAway}
          direction="down"
          container={copyFrame}
          mountOnEnter
          unmountOnExit
          timeout={reducedMotion ? 0 : PREVIEW_COPY_MS}
          easing={PREVIEW_COPY_EASING}
        >
          <Box
            data-testid="pict-edit-preview-copy"
            aria-hidden="true"
            ref={previewCopyRef}
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              padding: 1,
              backgroundColor: "background.default",
              borderBottom: 1,
              borderColor: "divider",
              boxShadow: 2,
            }}
          >
            <ScaleToFit maxHeight="min(30vh, 200px)">{card}</ScaleToFit>
          </Box>
        </Slide>
      </Box>

      <Box
        display="grid"
        gridTemplateColumns={{ xs: "1fr", md: "0.5fr 1.5fr" }}
        gap={{ xs: 3, sm: 2 }}
        sx={{ minHeight: 0 }}
      >
        {/* Zona de treball: mostra del pictograma + cerca, amb fons default
            (negre en fosc). El collapse de sota és zona de configuració (paper). */}
        <Box
          gridColumn={{ xs: "1", md: "1 / -1" }}
          display="grid"
          gridTemplateColumns={{ xs: "1fr", md: "0.5fr 1.5fr" }}
          gap={{ xs: 3, sm: 2 }}
          sx={{
            minHeight: 0,
            backgroundColor: "background.default",
            borderRadius: 2,
            padding: 1,
          }}
        >
          <Box
            ref={previewRef}
            data-testid="pict-edit-preview"
            sx={{
              alignSelf: "start",
              justifyItems: "center",
              width: { xs: "100%", md: "auto" },
              position: "sticky",
              top: 0,
              zIndex: 5,
              // Fons opac perquè els resultats de cerca no es vegin per sota en fer scroll
              backgroundColor: "background.default",
              borderRadius: 2,
              paddingBlock: { xs: 1 },
            }}
          >
            {card}
          </Box>
          <Box paddingBlock={1} sx={{ minHeight: 0 }}>
            <PictogramSearch
              indexPict={pictogram.indexSequence}
              state={search}
              setState={setSearch}
            />
          </Box>
        </Box>

        <Box gridColumn={{ xs: "1", md: "1 / -1" }} sx={{ minHeight: 0 }}>
          <SettingAccordion
            title={intl.formatMessage(messages.styleSection)}
            subtitle={intl.formatMessage(messages.styleSectionSubtitle)}
            // La mateixa icona que marca la targeta personalitzada a la
            // graella (`customizedMark`): així es relacionen d'una ullada
            icon={<MdTune />}
            action={isCustomized ? resetAction : undefined}
            expanded={settingsOpen}
            onChange={setSettingsOpen}
            summaryRef={summaryRef}
          >
            <List>
              <li>
                <SettingCadTextFiled
                  setting="customText"
                  state={text}
                  setState={setText}
                />
              </li>

              {isColorizable && pictogram.settings.textPosition && (
                <li>
                  <SettingCard
                    setting="textPosition"
                    state={textPosition}
                    setState={setTextPosition}
                  />
                </li>
              )}

              <Stack
                display={"flex"}
                direction={"row"}
                flexWrap={"wrap"}
                marginTop={1}
                rowGap={2}
                columnGap={2}
              >
                {!isColorizable && pictogram.settings.textPosition && (
                  <li>
                    <SettingCard
                      setting="textPosition"
                      state={textPosition}
                      setState={setTextPosition}
                    />
                  </li>
                )}

                {isColorizable && (
                  <>
                    <li>
                      <SettingCardBoolean
                        setting="color"
                        state={color}
                        setState={setColor}
                      />
                    </li>
                    <li>
                      <SettingCardBoolean
                        setting="corss"
                        state={cross}
                        setState={setCross}
                      />
                    </li>
                  </>
                )}
              </Stack>
              {isColorizable && search.skin && (
                <li>
                  <SettingCard setting="skin" state={skin} setState={setSkin} />
                </li>
              )}
              {isColorizable && search.hair && (
                <li>
                  <SettingCard setting="hair" state={hair} setState={setHair} />
                </li>
              )}
              <li>
                <SettingCardBorder
                  border="borderIn"
                  state={borderIn}
                  setState={setBorderIn}
                />
              </li>
              <li>
                <SettingCardBorder
                  border="borderOut"
                  state={borderOut}
                  setState={setBorderOut}
                />
              </li>
            </List>
          </SettingAccordion>
        </Box>
      </Box>

      {/* Dins del diàleg, que atrapa el focus: un snackbar de fora no s'hi
          podria fer servir amb el teclat. L'`Alert` n'és la regió viva */}
      <Snackbar
        key={resetNotice}
        open={resetNotice > 0 && resetUndo !== null}
        autoHideDuration={RESET_SNACKBAR_DURATION_MS}
        onClose={(_, reason) => {
          if (reason !== "clickaway") setResetUndo(null);
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={floatingSnackbarSx}
      >
        <Alert
          severity="success"
          variant="outlined"
          sx={floatingNoticeSx}
          action={
            <StyledButton
              color="inherit"
              onClick={handleUndoReset}
              sx={{ minHeight: APP_TOUCH_TARGET_MIN }}
            >
              {intl.formatMessage(messages.undo)}
            </StyledButton>
          }
        >
          {intl.formatMessage(messages.resetDone)}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PictEditForm;
