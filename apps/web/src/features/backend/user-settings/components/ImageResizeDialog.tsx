// Canviar de mida una imatge del compte, sense perdre-la.
//
// És l'altra sortida de la llista d'imatges, i sovint la que toca. Esborrar
// recupera tot l'espai però deixa el pictograma sense imatge; qui l'imprimeix
// petita no necessita cap de les dues coses, perquè el que li sobra és
// resolució. Aquí es tria quanta se'n vol conservar dita en centímetres de
// paper, que és la unitat en què es decideix, amb el pes al costat.
//
// Les versions es codifiquen de veritat al navegador, amb el mateix codificador
// amb què es pugen les imatges: el pes objectiu d'un nivell és una fita, no una
// promesa, i el que aquí es promet és el que realment ocuparà. Per això primer
// es baixa la imatge i es prepara —això triga— i només després es tria.
import {
  Alert,
  Box,
  CircularProgress,
  DialogContentText,
  LinearProgress,
  Stack,
  ToggleButton,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import type { UserAsset } from "@sequence-arasaac/shared-types";
import type { ImageQuality } from "@/types/ui";
import { AppDialog, AppDialogActions } from "@components/AppDialog";
import StyledButton from "@/style/StyledButton";
import StyledToggleButtonGroup from "@/style/StyledToggleButtonGroup";
import {
  IMAGE_QUALITY_OPTIONS,
  qualityToggleSx,
} from "@components/SettingsCards/SettingCardImageQuality/imageQualityOptions";
import qualityMessages from "@components/SettingsCards/SettingCardImageQuality/SettingCardImageQuality.lang";
import {
  encodeSmallerVersions,
  fetchAsDataUrl,
  IMAGE_QUALITY_PRESETS,
  type ImageVersion,
} from "@/utils/imageToBase64";
import { classifyRequestFailure } from "@features/backend/api/requestFailure";
import { reportClientError } from "@features/backend/api/clientErrorReport";
import { resizeUserAsset } from "../services/settingsService";
import { useFormatBytes } from "../hooks/useFormatBytes";
import { useFormatPrintSize } from "../hooks/useFormatPrintSize";
import messages from "./AccountUsage.lang";

const TITLE_ID = "image-resize-dialog-title";
const BODY_ID = "image-resize-dialog-body";

interface ImageResizeDialogProps {
  /** La imatge que es canvia de mida; `null` amb el diàleg tancat. */
  asset: UserAsset | null;
  onCancel: () => void;
  /** La imatge nova, tal com ha quedat al núvol, i el pes que tenia abans. */
  onResized: (previous: UserAsset, next: UserAsset) => void;
}

const ImageResizeDialog = ({
  asset,
  onCancel,
  onResized,
}: ImageResizeDialogProps): React.ReactElement => {
  const intl = useIntl();
  const formatBytes = useFormatBytes();
  const formatPrintSize = useFormatPrintSize();

  const [isPreparing, setIsPreparing] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [versions, setVersions] = useState<ImageVersion[]>([]);
  const [selected, setSelected] = useState<ImageQuality | null>(null);
  // Píxels i pes reals del fitxer que hi ha al núvol: el registre en pot dir
  // zero (les imatges pujades abans que existís), i el que es baixa, mai
  const [longestSide, setLongestSide] = useState<number | null>(null);
  const [currentBytes, setCurrentBytes] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const prepare = useCallback(async (source: UserAsset) => {
    setIsPreparing(true);
    setErrorMessage(null);
    try {
      const dataUrl = await fetchAsDataUrl(source.url);
      const smaller = await encodeSmallerVersions(dataUrl);

      setLongestSide(smaller.longestSide);
      // El pes que mana és el que el compte té comptat: és el que es restarà del
      // comptador i el que diu la llista, i dues xifres diferents per a la
      // mateixa imatge no s'expliquen. El mesurat només val quan no n'hi ha cap
      // de comptada (les imatges pujades abans que existís el registre)
      if (source.bytes === 0) setCurrentBytes(smaller.bytes);
      setVersions(smaller.versions);
      // La menys agressiva de les que redueixen: qui obre el diàleg vol
      // recuperar espai, no perdre tota la qualitat que pugui
      setSelected(smaller.versions[0]?.quality ?? null);
      return true;
    } catch (error) {
      // Aquesta no ve de cap petició HTTP —és la baixada i la compressió al
      // navegador— però arriba igualment a l'usuari, i el que arriba es reporta
      void reportClientError("asset-resize", classifyRequestFailure(error));
      return false;
    } finally {
      setIsPreparing(false);
    }
  }, []);

  useEffect(() => {
    if (!asset) return;

    // Cada obertura parteix de zero: amb els resultats de la imatge anterior a
    // la pantalla, es triaria una mida que no és la d'aquesta
    let isCurrent = true;
    setVersions([]);
    setSelected(null);
    setLongestSide(null);
    setCurrentBytes(asset.bytes);
    setErrorMessage(null);

    void prepare(asset).then((ok) => {
      if (isCurrent && !ok) {
        setErrorMessage(intl.formatMessage(messages.resizeLoadError));
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [asset, prepare, intl]);

  const chosen = versions.find((version) => version.quality === selected);

  const storedSide = Math.max(asset?.width ?? 0, asset?.height ?? 0);
  const knownSide = longestSide ?? (storedSide > 0 ? storedSide : null);

  const handleConfirm = async () => {
    // Res de `disabled` per dir «s'està fent»: un botó desactivat surt de
    // l'ordre de tabulació i qui navega amb teclat el perd sense avís
    if (!asset || !chosen || isApplying) return;

    setIsApplying(true);
    setErrorMessage(null);
    try {
      const next = await resizeUserAsset(asset.publicId, chosen.dataUrl);
      onResized(asset, next);
    } catch (error) {
      const failure = classifyRequestFailure(error);
      setErrorMessage(
        intl.formatMessage(messages.resizeError, { code: failure.code }),
      );
      void reportClientError("asset-resize", failure);
    } finally {
      setIsApplying(false);
    }
  };

  const hasOptions = versions.length > 0;

  return (
    <AppDialog
      open={asset !== null}
      onClose={onCancel}
      title={intl.formatMessage(messages.resizeTitle)}
      titleId={TITLE_ID}
      describedById={BODY_ID}
      maxWidth="xs"
      statusSlot={
        <>
          {isApplying && (
            <Box sx={{ px: 3, pb: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {intl.formatMessage(messages.resizeApplying)}
              </Typography>
              <LinearProgress />
            </Box>
          )}

          {errorMessage && (
            <Box sx={{ px: 3, pb: 1 }}>
              <Alert severity="error" variant="outlined">
                {errorMessage}
              </Alert>
            </Box>
          )}
        </>
      }
      actions={
        <AppDialogActions>
          <StyledButton onClick={onCancel} color="inherit">
            {intl.formatMessage(messages.resizeCancel)}
          </StyledButton>
          {hasOptions && (
            <StyledButton
              onClick={() => void handleConfirm()}
              variant="contained"
              aria-disabled={isApplying || !chosen}
              aria-busy={isApplying}
            >
              {intl.formatMessage(messages.resizeConfirm)}
            </StyledButton>
          )}
        </AppDialogActions>
      }
    >
      <Stack gap={1.5}>
        {/* Els píxels són els de la imatge baixada; mentre no ha arribat, els
            que ha dit el servidor. Sense cap dels dos no s'inventa cap mida:
            una xifra falsa aquí és pitjor que no dir-ne cap. */}
        <DialogContentText id={BODY_ID}>
          {knownSide === null
            ? intl.formatMessage(messages.resizeCurrentUnknown, {
                size: formatBytes(currentBytes),
              })
            : intl.formatMessage(messages.resizeCurrent, {
                size: formatBytes(currentBytes),
                width: formatPrintSize(knownSide),
              })}
        </DialogContentText>

        {isPreparing && (
          <Stack direction="row" gap={1} alignItems="center">
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              {intl.formatMessage(messages.resizePreparing)}
            </Typography>
          </Stack>
        )}

        {!isPreparing && !hasOptions && !errorMessage && (
          <Typography variant="body2" color="text.secondary">
            {intl.formatMessage(messages.resizeNone)}
          </Typography>
        )}

        {hasOptions && (
          <StyledToggleButtonGroup
            value={selected}
            exclusive
            onChange={(_, value: ImageQuality | null) =>
              value && setSelected(value)
            }
            aria-label={intl.formatMessage(messages.resizeTitle)}
          >
            {IMAGE_QUALITY_OPTIONS.filter(({ value }) =>
              versions.some((version) => version.quality === value),
            ).map(({ value, icon, label }) => (
              <Tooltip
                key={value}
                describeChild
                title={intl.formatMessage(qualityMessages.optionHint, {
                  width: formatPrintSize(
                    IMAGE_QUALITY_PRESETS[value].maxSidePx,
                  ),
                })}
              >
                <ToggleButton
                  value={value}
                  aria-label={intl.formatMessage(label)}
                  selected={value === selected}
                  sx={qualityToggleSx}
                >
                  {icon}
                  {intl.formatMessage(label)}
                </ToggleButton>
              </Tooltip>
            ))}
          </StyledToggleButtonGroup>
        )}

        {chosen && (
          <Typography variant="caption" color="text.secondary">
            {intl.formatMessage(messages.resizeOption, {
              width: formatPrintSize(
                IMAGE_QUALITY_PRESETS[chosen.quality].maxSidePx,
              ),
              size: formatBytes(chosen.bytes),
              saved: formatBytes(Math.max(0, currentBytes - chosen.bytes)),
            })}
          </Typography>
        )}
      </Stack>
    </AppDialog>
  );
};

export default ImageResizeDialog;
