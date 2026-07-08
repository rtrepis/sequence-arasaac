import React, { useState } from "react";
import {
  Box,
  Stack,
  TextField,
  Button,
  Chip,
  Typography,
  Alert,
  Divider,
} from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { useAppDispatch, useAppSelector } from "@/app/hooks";

const FREE_TIER_MAX_WORDS = 3;
import {
  addWordProfileActionCreator,
  removeWordProfileActionCreator,
} from "@features/user-settings/store/uiSlice";
import { WordProfile } from "@features/word-profile/model/WordProfile";
import PictogramCard from "../../components/PictogramCard/PictogramCard";
import SettingCard from "../../components/SettingsCards/SettingCard/SettingCard";
import { Hair, PictogramCardDefaults, PictSequence, Skin } from "../../types/sequence";
import PictogramSearchLocal, {
  PictogramSearchLocalResult,
} from "../../features/pictogram/components/PictogramSearchLocal";
import messages from "./VocabularySettingsPanel.lang";

const DEFAULT_PICT_ID = 6009;

const VocabularySettingsPanel = (): React.ReactElement => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const wordProfiles = useAppSelector((state) => state.ui.wordProfiles);
  const defaultSettings = useAppSelector((state) => state.ui.defaultSettings);
  const tier = useAppSelector((state) => state.ui.tier);
  const isAuthenticated = useAppSelector((state) => state.auth.accessToken !== null);

  const atFreeLimit = tier === "free" && wordProfiles.length >= FREE_TIER_MAX_WORDS;

  const [word, setWord] = useState("");
  const [editingWord, setEditingWord] = useState<string | undefined>();

  // Estat del pictograma seleccionat (skin/hair/color/selectedId/url)
  const [pictState, setPictState] = useState<PictogramSearchLocalResult>({
    selectedId: DEFAULT_PICT_ID,
    fitzgerald: "#CC00BB",
    url: undefined,
    color: defaultSettings.pictApiAra.color,
    hair: defaultSettings.pictApiAra.hair as Hair,
    skin: defaultSettings.pictApiAra.skin as Skin,
  });

  const isEditing = editingWord !== undefined;

  const loadProfile = (profile: WordProfile) => {
    setWord(profile.word);
    setEditingWord(profile.word);
    setPictState({
      selectedId: profile.selectedId ?? DEFAULT_PICT_ID,
      fitzgerald: profile.overrides.fitzgerald ?? "#CC00BB",
      url: profile.customImageUrl,
      color: profile.overrides.color ?? defaultSettings.pictApiAra.color,
      hair: (profile.overrides.hair ?? defaultSettings.pictApiAra.hair) as Hair,
      skin: (profile.overrides.skin ?? defaultSettings.pictApiAra.skin) as Skin,
    });
  };

  const handleSave = () => {
    const trimmed = word.trim();
    if (!trimmed) return;

    const overrides: WordProfile["overrides"] = {
      color: pictState.color,
      ...(pictState.color && pictState.skin ? { skin: pictState.skin } : {}),
      ...(pictState.color && pictState.hair ? { hair: pictState.hair } : {}),
      ...(pictState.fitzgerald ? { fitzgerald: pictState.fitzgerald } : {}),
    };

    dispatch(
      addWordProfileActionCreator({
        word: trimmed,
        overrides,
        selectedId: pictState.selectedId !== DEFAULT_PICT_ID ? pictState.selectedId : undefined,
        customImageUrl: pictState.url,
      }),
    );
    handleClear();
  };

  const handleClear = () => {
    setWord("");
    setEditingWord(undefined);
    setPictState({
      selectedId: DEFAULT_PICT_ID,
      fitzgerald: "#CC00BB",
      url: undefined,
      color: defaultSettings.pictApiAra.color,
      hair: defaultSettings.pictApiAra.hair as Hair,
      skin: defaultSettings.pictApiAra.skin as Skin,
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
        word: word.trim() || intl.formatMessage(messages.previewLabel),
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

  if (!isAuthenticated) {
    return (
      <Box sx={{ pt: 4, textAlign: "center" }}>
        <Typography variant="body1" color="text.secondary">
          <FormattedMessage {...messages.loginRequired} />
        </Typography>
      </Box>
    );
  }

  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      gap={3}
      sx={{ pt: 2, alignItems: "flex-start" }}
    >
      {/* Columna esquerra: llista i formulari */}
      <Stack gap={2} sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" gap={1} alignItems="flex-start">
          <TextField
            label={intl.formatMessage(messages.wordInputLabel)}
            placeholder={intl.formatMessage(messages.wordInputPlaceholder)}
            value={word}
            onChange={(e) => {
              setWord(e.target.value);
              if (editingWord && e.target.value.trim() !== editingWord) {
                setEditingWord(undefined);
              }
            }}
            onKeyDown={handleKeyDown}
            size="small"
            sx={{ flex: 1 }}
          />
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!word.trim() || (atFreeLimit && !isEditing)}
            sx={{ whiteSpace: "nowrap", mt: 0.25 }}
          >
            {isEditing ? (
              <FormattedMessage {...messages.updateButton} />
            ) : (
              <FormattedMessage {...messages.addButton} />
            )}
          </Button>
        </Stack>

        {isEditing && (
          <Alert severity="info" sx={{ py: 0 }}>
            <FormattedMessage {...messages.duplicateWarning} />
          </Alert>
        )}

        {atFreeLimit && !isEditing && (
          <Alert severity="warning" sx={{ py: 0 }}>
            <FormattedMessage
              {...messages.freeLimitReached}
              values={{ max: FREE_TIER_MAX_WORDS }}
            />
          </Alert>
        )}

        <Divider />

        {wordProfiles.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            <FormattedMessage {...messages.emptyList} />
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {wordProfiles.map((profile) => (
              <Chip
                key={profile.word}
                label={profile.word}
                onDelete={() => {
                  dispatch(removeWordProfileActionCreator(profile.word));
                  if (editingWord === profile.word) handleClear();
                }}
                onClick={() => loadProfile(profile)}
                variant={editingWord === profile.word ? "filled" : "outlined"}
                color={editingWord === profile.word ? "primary" : "default"}
                size="small"
              />
            ))}
          </Box>
        )}
      </Stack>

      {/* Columna dreta: preview + cerca de pictograma + skin/hair */}
      <Stack gap={2} sx={{ flex: 1, alignItems: "flex-start" }}>
        <PictogramCard
          pictogram={pictogramGuide}
          defaults={defaults}
          view="complete"
          variant="plane"
        />

        <PictogramSearchLocal
          selectedId={pictState.selectedId}
          onSelect={setPictState}
        />

        {pictState.color && pictState.skin && (
          <SettingCard
            setting="skin"
            state={pictState.skin}
            setState={(skin) => setPictState((prev) => ({ ...prev, skin: skin as Skin }))}
          />
        )}
        {pictState.color && pictState.hair && (
          <SettingCard
            setting="hair"
            state={pictState.hair}
            setState={(hair) => setPictState((prev) => ({ ...prev, hair: hair as Hair }))}
          />
        )}
      </Stack>
    </Stack>
  );
};

export default VocabularySettingsPanel;
