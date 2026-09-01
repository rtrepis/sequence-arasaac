// Què fer amb una imatge que no cap: la que passa del sostre per imatge o la
// que no cabria a l'espai que queda al compte.
//
// Arriba en el moment de pujar-la i no en desar al núvol perquè és quan encara
// es pot fer alguna cosa: aquí la imatge original encara existeix al dispositiu
// i es pot tornar a comprimir; mitja hora després, en desar, l'única sortida
// seria treure-la del document.
//
// **La pujada no es bloqueja mai.** L'app funciona sencera sense compte i sense
// xarxa: una imatge que no cabrà al núvol s'ha de poder posar igualment i
// imprimir-la des d'aquest dispositiu. Per això «Posa-la igualment» sempre hi és.
import React from "react";
import { DialogContentText } from "@mui/material";
import { useIntl } from "react-intl";
import type { ImageQuality } from "@/types/ui";
import { AppDialog, AppDialogActions } from "@components/AppDialog";
import StyledButton from "@/style/StyledButton";
import { useFormatBytes } from "@features/backend/user-settings/hooks/useFormatBytes";
import { useFormatPrintSize } from "@features/backend/user-settings/hooks/useFormatPrintSize";
import { IMAGE_QUALITY_PRESETS } from "@/utils/imageToBase64";
import messages from "./UploadImageButton.lang";

/** Per què no cap: pel sostre de cada imatge o per l'espai que queda al compte. */
export type ImageSizeReason = "perImage" | "quota";

export interface ImageSizeOffer {
  reason: ImageSizeReason;
  /** Pes de la imatge tal com ha quedat amb la qualitat triada. */
  bytes: number;
  /** El que hi cabria: el sostre per imatge o l'espai que queda. */
  availableBytes: number;
  /** Versió més petita que sí que hi cap, si n'hi ha cap. */
  smaller: { dataUrl: string; quality: ImageQuality; bytes: number } | null;
}

interface ImageSizeDialogProps {
  offer: ImageSizeOffer | null;
  /** Posa la versió reduïda (només quan n'hi ha). */
  onUseSmaller: () => void;
  /** Posa la imatge tal com és, encara que no càpiga al núvol. */
  onUseOriginal: () => void;
  onCancel: () => void;
}

const ImageSizeDialog = ({
  offer,
  onUseSmaller,
  onUseOriginal,
  onCancel,
}: ImageSizeDialogProps): React.ReactElement => {
  const intl = useIntl();
  const formatBytes = useFormatBytes();
  const formatPrintSize = useFormatPrintSize();

  const body = (): string => {
    if (!offer) return "";

    const values = {
      size: formatBytes(offer.bytes),
      available: formatBytes(offer.availableBytes),
      smallerSize: offer.smaller ? formatBytes(offer.smaller.bytes) : "",
      quality: offer.smaller
        ? intl.formatMessage(messages[offer.smaller.quality])
        : "",
      // Quant es perd de veritat en acceptar la reducció, dit en la unitat en
      // què es decideix: fins a quina mida es continuarà imprimint bé
      smallerWidth: offer.smaller
        ? formatPrintSize(
            IMAGE_QUALITY_PRESETS[offer.smaller.quality].maxSidePx,
          )
        : "",
    };

    if (offer.smaller) {
      return intl.formatMessage(
        offer.reason === "quota"
          ? messages.tooBigQuotaSmaller
          : messages.tooBigPerImageSmaller,
        values,
      );
    }

    return intl.formatMessage(
      offer.reason === "quota"
        ? messages.tooBigQuotaOnly
        : messages.tooBigPerImageOnly,
      values,
    );
  };

  return (
    <AppDialog
      open={offer !== null}
      onClose={onCancel}
      title={intl.formatMessage(messages.tooBigTitle)}
      titleId="image-size-dialog-title"
      describedById="image-size-dialog-body"
      maxWidth="xs"
      dividers={false}
      actions={
        <AppDialogActions
          // Ni acceptar ni cancel·lar: posar-la igualment és la sortida que no
          // arregla el pes però deixa continuar, i va sola a l'esquerra
          startAction={
            offer?.smaller ? (
              <StyledButton
                onClick={onUseOriginal}
                variant="outlined"
                color="inherit"
              >
                {intl.formatMessage(messages.useOriginal)}
              </StyledButton>
            ) : undefined
          }
        >
          <StyledButton onClick={onCancel} color="inherit">
            {intl.formatMessage(messages.cancelUpload)}
          </StyledButton>
          <StyledButton
            onClick={offer?.smaller ? onUseSmaller : onUseOriginal}
            variant="contained"
          >
            {intl.formatMessage(
              offer?.smaller ? messages.useSmaller : messages.useOriginal,
            )}
          </StyledButton>
        </AppDialogActions>
      }
    >
      <DialogContentText id="image-size-dialog-body">
        {body()}
      </DialogContentText>
    </AppDialog>
  );
};

export default ImageSizeDialog;
