// Les imatges pròpies del compte, amb el lloc d'on pengen i el pes de cadascuna.
//
// És l'altra meitat del comptador d'espai: saber que en queden 900 KB no diu
// què s'ha de treure per recuperar-ne. Van ordenades de més pesada a menys,
// perquè qui obre la llista busca què esborrar, no un inventari.
//
// Es demana en obrir el tab i no en arrencar l'app: recórrer el contingut de
// tots els documents és barat però no és gratis, i el servidor de Render pot
// estar adormit quan ningú ha demanat res.
import {
  Alert,
  Box,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { AiOutlineDelete } from "react-icons/ai";
import type { UserAsset } from "@sequence-arasaac/shared-types";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import StyledButton from "@/style/StyledButton";
import StyledIconButton from "@/style/StyledIconButton";
import ConfirmDialog from "@components/ConfirmDialog/ConfirmDialog";
import { cloudinaryThumbnailUrl } from "@/utils/cloudinaryUrl";
import { useFeedback } from "@/context/FeedbackContext";
import { setWordProfilesActionCreator } from "@features/user-settings/store/uiSlice";
import { removeCloudImageActionCreator } from "@features/sequence/store/documentSlice";
import { deleteUserAsset, listUserAssets } from "../services/settingsService";
import { refreshQuotaThunk } from "../store/quotaSlice";
import { useFormatBytes } from "../hooks/useFormatBytes";
import messages from "./AccountUsage.lang";

/** Costat de la miniatura, el mateix que a la resta de llistats. */
const THUMBNAIL_SIZE = 40;

const AccountImagesList = (): React.ReactElement | null => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const formatBytes = useFormatBytes();
  const { showSnackbar } = useFeedback();

  const isAuthenticated = useAppSelector(
    (state) => state.auth.accessToken !== null,
  );
  const openDocumentId = useAppSelector((state) => state.document.id);
  const wordProfiles = useAppSelector((state) => state.ui.wordProfiles);

  const [assets, setAssets] = useState<UserAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<UserAsset | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      setAssets(await listUserAssets());
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    void load();
  }, [isAuthenticated, load]);

  if (!isAuthenticated) return null;

  const originOf = (asset: UserAsset): string => {
    if (asset.source === "vocabulary") {
      return intl.formatMessage(messages.inWord, { word: asset.word ?? "" });
    }
    return asset.documentTitle
      ? intl.formatMessage(messages.inDocument, { title: asset.documentTitle })
      : intl.formatMessage(messages.inUntitledDocument);
  };

  const handleDelete = async (asset: UserAsset) => {
    setPendingDelete(null);

    try {
      await deleteUserAsset(asset.publicId);
    } catch (error) {
      const code =
        (error as { response?: { data?: { errorCode?: string } } })?.response
          ?.data?.errorCode ?? "ASSET_DELETE_ERROR";
      showSnackbar({
        message: intl.formatMessage(messages.deleteError, { code }),
        severity: "error",
      });
      return;
    }

    // El que s'està editant s'ha de posar al dia: al núvol la imatge ja no hi
    // és, i deixar-hi la URL morta faria que el desat següent la tornés a desar
    if (asset.source === "vocabulary") {
      dispatch(
        setWordProfilesActionCreator(
          wordProfiles.map((profile) =>
            profile.customImageUrl === asset.url
              ? { ...profile, customImageUrl: undefined }
              : profile,
          ),
        ),
      );
    } else if (asset.documentId === openDocumentId) {
      dispatch(removeCloudImageActionCreator(asset.url));
    }

    setAssets((previous) =>
      previous.filter((candidate) => candidate.publicId !== asset.publicId),
    );
    void dispatch(refreshQuotaThunk());

    showSnackbar({
      message: intl.formatMessage(messages.deleted, {
        size: formatBytes(asset.bytes),
      }),
      severity: "success",
    });
  };

  return (
    <Stack gap={1}>
      <Typography sx={{ fontWeight: "bold" }}>
        {intl.formatMessage(messages.imagesTitle)}
      </Typography>

      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {hasError && !isLoading && (
        <Alert
          severity="error"
          variant="outlined"
          action={
            <StyledButton
              color="inherit"
              size="small"
              onClick={() => void load()}
            >
              {intl.formatMessage(messages.reload)}
            </StyledButton>
          }
        >
          {intl.formatMessage(messages.imagesLoadError)}
        </Alert>
      )}

      {!isLoading && !hasError && assets.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          {intl.formatMessage(messages.imagesEmpty)}
        </Typography>
      )}

      {!isLoading && !hasError && assets.length > 0 && (
        <List disablePadding>
          {assets.map((asset, index) => (
            <React.Fragment key={asset.publicId}>
              {index > 0 && <Divider component="li" />}
              <ListItem
                disableGutters
                secondaryAction={
                  <Tooltip title={intl.formatMessage(messages.deleteImage)}>
                    <StyledIconButton
                      color="inherit"
                      aria-label={intl.formatMessage(messages.deleteImage)}
                      onClick={() => setPendingDelete(asset)}
                    >
                      <AiOutlineDelete />
                    </StyledIconButton>
                  </Tooltip>
                }
              >
                <ListItemAvatar>
                  {/* A la mida en què es pinta: la imatge desada és de mida
                      d'impressió i aquí n'hi ha prou amb un quadradet */}
                  <Box
                    component="img"
                    src={cloudinaryThumbnailUrl(asset.url, THUMBNAIL_SIZE)}
                    alt={intl.formatMessage(messages.thumbnailAlt)}
                    width={THUMBNAIL_SIZE}
                    height={THUMBNAIL_SIZE}
                    sx={{ objectFit: "contain", display: "block" }}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={formatBytes(asset.bytes)}
                  secondary={originOf(asset)}
                  primaryTypographyProps={{ variant: "body2" }}
                  secondaryTypographyProps={{ variant: "caption" }}
                />
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title={intl.formatMessage(messages.deleteTitle)}
        body={
          pendingDelete
            ? intl.formatMessage(
                pendingDelete.source === "vocabulary"
                  ? messages.deleteBodyWord
                  : messages.deleteBodyDocument,
                { size: formatBytes(pendingDelete.bytes) },
              )
            : ""
        }
        confirmLabel={intl.formatMessage(messages.deleteConfirm)}
        onConfirm={() => pendingDelete && void handleDelete(pendingDelete)}
        onCancel={() => setPendingDelete(null)}
      />
    </Stack>
  );
};

export default AccountImagesList;
