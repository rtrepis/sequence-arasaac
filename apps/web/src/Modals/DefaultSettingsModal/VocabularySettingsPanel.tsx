import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  addWordProfileActionCreator,
  removeWordProfileActionCreator,
} from "@features/user-settings/store/uiSlice";
import {
  DEFAULT_WORD_PICT_ID,
  FREE_TIER_MAX_WORDS,
  WordProfile,
} from "@features/word-profile/model/WordProfile";
import WordProfileList from "@features/word-profile/components/WordProfileList";
import { useFeedback } from "@/context/FeedbackContext";
import PictogramCard from "../../components/PictogramCard/PictogramCard";
import SettingCard from "../../components/SettingsCards/SettingCard/SettingCard";
import {
  Hair,
  PictogramCardDefaults,
  PictSequence,
  Skin,
} from "../../types/sequence";
import PictogramSearchLocal, {
  PictogramSearchLocalResult,
} from "../../features/pictogram/components/PictogramSearchLocal";
import {
  SettingsPanelLayout,
  SettingsPreviewFrame,
  SectionTitle,
  SettingsPanelHint,
} from "../../components/SettingsLayout";
import AuthForm from "../../features/backend/auth/components/AuthForm";
import authMessages from "../../features/backend/auth/components/AuthModal.lang";
import messages from "./VocabularySettingsPanel.lang";

/** Amplada de la columna esquerra (mostra + llista de paraules) en escriptori. */
const VOCABULARY_ASIDE_WIDTH = 280;

const VocabularySettingsPanel = (): React.ReactElement => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { showSnackbar } = useFeedback();

  const wordProfiles = useAppSelector((state) => state.ui.wordProfiles);
  const defaultSettings = useAppSelector((state) => state.ui.defaultSettings);
  const tier = useAppSelector((state) => state.ui.tier);
  const isAuthenticated = useAppSelector(
    (state) => state.auth.accessToken !== null,
  );

  const [word, setWord] = useState("");
  const [editingWord, setEditingWord] = useState<string | undefined>();

  // Estat del pictograma seleccionat (skin/hair/color/selectedId/url)
  const [pictState, setPictState] = useState<PictogramSearchLocalResult>({
    selectedId: DEFAULT_WORD_PICT_ID,
    fitzgerald: "#CC00BB",
    url: undefined,
    color: defaultSettings.pictApiAra.color,
    hair: defaultSettings.pictApiAra.hair as Hair,
    skin: defaultSettings.pictApiAra.skin as Skin,
  });

  const trimmedWord = word.trim();
  const existingProfile = wordProfiles.find(
    (profile) => profile.word.toLowerCase() === trimmedWord.toLowerCase(),
  );

  const isEditing = editingWord !== undefined;
  // Editar i canviar el text de la paraula equival a reanomenar-la
  const isRenaming =
    isEditing && trimmedWord.toLowerCase() !== editingWord.toLowerCase();
  // Afegir una paraula que ja existeix la sobreescriu, no en crea una de nova
  const willOverwrite = !isEditing && existingProfile !== undefined;
  // El nou nom d'una paraula reanomenada xoca amb una altra de ja desada
  const hasNameCollision = isRenaming && existingProfile !== undefined;

  const consumesQuota = !isEditing && !willOverwrite;
  const atFreeLimit =
    consumesQuota &&
    tier === "free" &&
    wordProfiles.length >= FREE_TIER_MAX_WORDS;

  const isUpdate = isEditing || willOverwrite;
  const canSave = trimmedWord !== "" && !hasNameCollision && !atFreeLimit;

  const resetForm = () => {
    setWord("");
    setEditingWord(undefined);
    setPictState({
      selectedId: DEFAULT_WORD_PICT_ID,
      fitzgerald: "#CC00BB",
      url: undefined,
      color: defaultSettings.pictApiAra.color,
      hair: defaultSettings.pictApiAra.hair as Hair,
      skin: defaultSettings.pictApiAra.skin as Skin,
    });
  };

  const loadProfile = (profile: WordProfile) => {
    setWord(profile.word);
    setEditingWord(profile.word);
    setPictState({
      selectedId: profile.selectedId ?? DEFAULT_WORD_PICT_ID,
      fitzgerald: profile.overrides.fitzgerald ?? "#CC00BB",
      url: profile.customImageUrl,
      color: profile.overrides.color ?? defaultSettings.pictApiAra.color,
      hair: (profile.overrides.hair ?? defaultSettings.pictApiAra.hair) as Hair,
      skin: (profile.overrides.skin ?? defaultSettings.pictApiAra.skin) as Skin,
    });
  };

  const handleSave = () => {
    if (!canSave) return;

    const overrides: WordProfile["overrides"] = {
      color: pictState.color,
      ...(pictState.color && pictState.skin ? { skin: pictState.skin } : {}),
      ...(pictState.color && pictState.hair ? { hair: pictState.hair } : {}),
      ...(pictState.fitzgerald ? { fitzgerald: pictState.fitzgerald } : {}),
    };

    // En reanomenar, la paraula antiga desapareix: primer esborrem, després desem
    if (isRenaming) dispatch(removeWordProfileActionCreator(editingWord));

    dispatch(
      addWordProfileActionCreator({
        word: trimmedWord,
        overrides,
        selectedId:
          pictState.selectedId !== DEFAULT_WORD_PICT_ID
            ? pictState.selectedId
            : undefined,
        customImageUrl: pictState.url,
      }),
    );

    showSnackbar({
      message: intl.formatMessage(
        isUpdate ? messages.wordUpdated : messages.wordAdded,
        { word: trimmedWord },
      ),
      severity: "success",
    });
    resetForm();
  };

  const handleDelete = (profileWord: string) => {
    dispatch(removeWordProfileActionCreator(profileWord));
    if (editingWord?.toLowerCase() === profileWord.toLowerCase()) resetForm();

    showSnackbar({
      message: intl.formatMessage(messages.wordRemoved, { word: profileWord }),
      severity: "info",
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSave();
    }
  };

  const defaults: PictogramCardDefaults = {
    numbered: defaultSettings.pictSequence.numbered,
    font: defaultSettings.pictSequence.font,
    numberFont: defaultSettings.pictSequence.numberFont,
    borderIn: defaultSettings.pictSequence.borderIn,
    borderOut: defaultSettings.pictSequence.borderOut,
  };

  const pictogramGuide: PictSequence = {
    indexSequence: 0,
    img: {
      searched: {
        word: trimmedWord || intl.formatMessage(messages.previewLabel),
        bestIdPicts: [],
      },
      selectedId: pictState.selectedId,
      settings: {
        fitzgerald: pictState.fitzgerald ?? "#CC00BB",
        skin: pictState.skin,
        hair: pictState.hair,
        color: pictState.color,
      },
      url: pictState.url,
    },
    settings: { textPosition: defaultSettings.pictSequence.textPosition },
    cross: false,
  };

  // Sense sessió, el panell mostra directament el formulari d'autenticació:
  // el vocabulari personal es desa al compte de l'usuari.
  if (!isAuthenticated) {
    return (
      <Stack
        direction="column"
        gap={1}
        sx={{ pt: 1, maxWidth: 500, mx: "auto", width: "100%" }}
      >
        <SectionTitle title={<FormattedMessage {...authMessages.loginTitle} />}>
          <Typography variant="body2" color="text.secondary">
            <FormattedMessage {...messages.loginRequired} />
          </Typography>
          <AuthForm />
        </SectionTitle>
      </Stack>
    );
  }

  return (
    <SettingsPanelLayout
      preview={
        <SettingsPreviewFrame
          background="paper"
          sx={{
            padding: 1,
            width: { md: VOCABULARY_ASIDE_WIDTH },
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <PictogramCard
            pictogram={pictogramGuide}
            defaults={defaults}
            view="complete"
            variant="plane"
          />
        </SettingsPreviewFrame>
      }
      previewAside={
        <Box sx={{ width: { xs: "100%", md: VOCABULARY_ASIDE_WIDTH } }}>
          <WordProfileList
            profiles={wordProfiles}
            editingWord={editingWord}
            onSelect={loadProfile}
            onDelete={handleDelete}
          />
        </Box>
      }
    >
      {/* Guia: diu en tot moment si s'està creant una paraula o editant-ne una */}
      <SettingsPanelHint>
        {isEditing ? (
          <FormattedMessage
            {...messages.formHintEditing}
            values={{ word: editingWord }}
          />
        ) : (
          <FormattedMessage {...messages.formHintNew} />
        )}
      </SettingsPanelHint>

      <SectionTitle title={<FormattedMessage {...messages.sectionWord} />}>
        <TextField
          label={intl.formatMessage(messages.wordInputLabel)}
          placeholder={intl.formatMessage(messages.wordInputPlaceholder)}
          value={word}
          onChange={(event) => setWord(event.target.value)}
          onKeyDown={handleKeyDown}
          error={hasNameCollision}
          size="small"
          fullWidth
        />

        {hasNameCollision && (
          <Alert severity="error">
            <FormattedMessage
              {...messages.nameCollision}
              values={{ word: trimmedWord }}
            />
          </Alert>
        )}

        {willOverwrite && (
          <Alert severity="info">
            <FormattedMessage {...messages.duplicateWarning} />
          </Alert>
        )}

        {atFreeLimit && (
          <Alert severity="warning">
            <FormattedMessage
              {...messages.freeLimitReached}
              values={{ max: FREE_TIER_MAX_WORDS }}
            />
          </Alert>
        )}
      </SectionTitle>

      <SectionTitle title={<FormattedMessage {...messages.sectionPictogram} />}>
        <PictogramSearchLocal
          selectedId={pictState.selectedId}
          imageUrl={pictState.url}
          onSelect={setPictState}
        />

        {pictState.color && pictState.skin && (
          <SettingCard
            setting="skin"
            state={pictState.skin}
            setState={(skin) =>
              setPictState((prev) => ({ ...prev, skin: skin as Skin }))
            }
          />
        )}
        {pictState.color && pictState.hair && (
          <SettingCard
            setting="hair"
            state={pictState.hair}
            setState={(hair) =>
              setPictState((prev) => ({ ...prev, hair: hair as Hair }))
            }
          />
        )}
      </SectionTitle>

      {/* Accions del formulari: sempre al final i a la dreta */}
      <Stack direction="row" justifyContent="flex-end" gap={1}>
        {isEditing && (
          <Button variant="outlined" onClick={resetForm}>
            <FormattedMessage {...messages.cancelButton} />
          </Button>
        )}
        <Button variant="contained" onClick={handleSave} disabled={!canSave}>
          <FormattedMessage
            {...(isUpdate ? messages.updateButton : messages.addButton)}
          />
        </Button>
      </Stack>
    </SettingsPanelLayout>
  );
};

export default VocabularySettingsPanel;
