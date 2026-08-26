import React from "react";
import {
  Avatar,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { AiOutlineDelete } from "react-icons/ai";
import { FormattedMessage, useIntl } from "react-intl";
import { SectionTitle } from "@components/SettingsLayout";
import { buildPictogramUrl } from "@features/pictogram/api/arasaacClient";
import { DEFAULT_WORD_PICT_ID, WordProfile } from "../model/WordProfile";
import messages from "./WordProfileList.lang";

interface WordProfileListProps {
  /** Paraules ja desades al vocabulari personal. */
  profiles: WordProfile[];
  /** Paraula que s'està editant ara mateix (marca l'element com a seleccionat). */
  editingWord?: string;
  /** Obre una paraula al formulari per editar-la. */
  onSelect: (profile: WordProfile) => void;
  /** Esborra una paraula del vocabulari. */
  onDelete: (word: string) => void;
}

// Miniatura del pictograma associat a la paraula: imatge pròpia si n'hi ha,
// si no la d'ARASAAC amb els seus overrides d'aparença
const buildThumbnailUrl = ({
  customImageUrl,
  selectedId,
  overrides,
}: WordProfile): string =>
  customImageUrl ??
  buildPictogramUrl(
    selectedId ?? DEFAULT_WORD_PICT_ID,
    overrides.skin,
    overrides.hair,
    overrides.color,
  );

/**
 * Llista de les paraules del vocabulari personal, amb la miniatura del seu
 * pictograma. Acompanya la previsualització a la columna esquerra: escollir-ne
 * una carrega el formulari de la dreta en mode edició.
 */
const WordProfileList = ({
  profiles,
  editingWord,
  onSelect,
  onDelete,
}: WordProfileListProps): React.ReactElement => {
  const intl = useIntl();

  return (
    <SectionTitle
      title={
        <FormattedMessage
          {...messages.title}
          values={{ count: profiles.length }}
        />
      }
    >
      {profiles.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          <FormattedMessage {...messages.empty} />
        </Typography>
      ) : (
        <List dense disablePadding>
          {profiles.map((profile) => {
            const isEditing =
              editingWord?.toLowerCase() === profile.word.toLowerCase();

            return (
              <ListItem
                key={profile.word}
                disablePadding
                secondaryAction={
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => onDelete(profile.word)}
                    aria-label={intl.formatMessage(messages.deleteLabel, {
                      word: profile.word,
                    })}
                  >
                    <AiOutlineDelete />
                  </IconButton>
                }
              >
                <ListItemButton
                  selected={isEditing}
                  onClick={() => onSelect(profile)}
                  aria-label={intl.formatMessage(messages.editLabel, {
                    word: profile.word,
                  })}
                  sx={{ borderRadius: 1 }}
                >
                  <ListItemAvatar sx={{ minWidth: 48 }}>
                    <Avatar
                      variant="rounded"
                      src={buildThumbnailUrl(profile)}
                      alt=""
                      sx={{ bgcolor: "background.default" }}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={profile.word}
                    primaryTypographyProps={{ noWrap: true }}
                    secondary={
                      isEditing ? (
                        <Chip
                          size="small"
                          color="primary"
                          label={
                            <FormattedMessage {...messages.editingBadge} />
                          }
                        />
                      ) : undefined
                    }
                    secondaryTypographyProps={{ component: "div" }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      )}
    </SectionTitle>
  );
};

export default WordProfileList;
