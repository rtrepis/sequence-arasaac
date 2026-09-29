import { List, Stack, Box, Button, Chip, Tooltip } from "@mui/material";
import PictogramCard from "../PictogramCard/PictogramCard";
import PictogramSearch from "../PictogramSearch/PictogramSearch";
import { PictogramCardDefaults, PictSequence } from "../../types/sequence";
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
import { undoableStyleChangeThunk } from "@features/sequence/store/styleSlice";
import { pictogramStyleOverride } from "@features/sequence/saac/serialize";
import {
  DEFAULT_FITZGERALD_CATEGORY_COLORS,
  categoryOf,
  colorForCategory,
} from "@features/sequence/saac/fitzgerald";
import { APP_TOUCH_TARGET_MIN } from "@/style/appShape";

interface PictEditFormProps {
  pictogram: PictSequence;
  submit: boolean;
}

const PictEditForm = ({
  pictogram,
  submit,
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

  // «Restableix» esborra els retocs del pictograma en desar-lo (fonament 03,
  // §5): la lletra, que aquest formulari no edita, també
  const [resetDone, setResetDone] = useState(false);

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

    const update = () => updatePictSequenceActionCreator(newPictogram);
    // Restablir es pot desfer, amb el mateix «Desfés» que els canvis d'estil
    if (resetDone) dispatch(undoableStyleChangeThunk(update, "reset"));
    else dispatch(update());
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

  // «Restableix»: el pictograma torna a l'estil del document. El Fitzgerald
  // torna al color de la seva categoria; la categoria, que és contingut, es
  // queda (fonament 03, «El color de Fitzgerald»)
  const handleReset = () => {
    setTextPosition(defaultTextPosition);
    setBorderIn(defaultBorderIn);
    setBorderOut(defaultBorderOut);
    setSkin(defaultSkin);
    setHair(defaultHair);
    setColor(defaultColor);
    setSearch((previous) => ({
      ...previous,
      fitzgerald: colorForCategory(
        previous.category ?? categoryOf(pictogram),
        documentStyle.fitzgeraldColors ?? DEFAULT_FITZGERALD_CATEGORY_COLORS,
        noCategoryColor,
      ),
    }));
    setResetDone(true);
  };

  // Té retocs propis respecte de l'estil del document?
  const isCustomized =
    pictogramStyleOverride(pictogramGuide, documentStyle) !== undefined;

  return (
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
          <PictogramCard
            pictogram={pictogramGuide}
            defaults={defaults}
            variant="plane"
            view="complete"
            size={{ scale: 0.8 }}
          />
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            flexWrap="wrap"
            gap={1}
            sx={{ mt: 1 }}
          >
            {/* L'indicador diu amb text (no només amb color) que el
                pictograma té retocs propis; la regió viva l'anuncia quan
                apareix o desapareix */}
            <Box role="status" aria-live="polite">
              {isCustomized && (
                <Chip
                  icon={<MdTune aria-hidden />}
                  label={intl.formatMessage(messages.customized)}
                  variant="outlined"
                  size="small"
                />
              )}
            </Box>
            <Tooltip
              title={intl.formatMessage(messages.tooltipReset)}
              describeChild
            >
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleReset}
                startIcon={<MdSettingsBackupRestore aria-hidden />}
                sx={{ minHeight: APP_TOUCH_TARGET_MIN }}
              >
                {intl.formatMessage(messages.reset)}
              </Button>
            </Tooltip>
          </Stack>
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
          title={`${intl.formatMessage({ ...messages.title })}`}
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
  );
};

export default PictEditForm;
