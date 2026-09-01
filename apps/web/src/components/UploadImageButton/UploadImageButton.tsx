import { CircularProgress, ToggleButton, Tooltip } from "@mui/material";
import { styled } from "@mui/material/styles";
import React, { useRef, useState } from "react";
import { useIntl } from "react-intl";
import { MdOutlineDriveFolderUpload } from "react-icons/md";
import { AiOutlineDelete } from "react-icons/ai";
import {
  encodeToFit,
  fileToBase64,
  getBase64SizeInBytes,
  isValidImageUrl,
  MAX_UPLOAD_IMAGE_BYTES,
} from "@/utils/imageToBase64";
import { useFeedback } from "@/context/FeedbackContext";
import { useAppSelector } from "@/app/hooks";
import { useAccountQuota } from "@features/backend/user-settings/hooks/useAccountQuota";
import ImageSizeDialog, { type ImageSizeOffer } from "./ImageSizeDialog";
import messages from "./UploadImageButton.lang";

/** Mida de la icona dins del botó de 55×55 de StyledToggleButtonGroup. */
const ICON_SIZE = 28;

/** Mida de la miniatura, la mateixa que la dels pictogrames del grup. */
const THUMBNAIL_SIZE = 40;

// Input visualment ocult però accessible per a lectors de pantalla (diferent de hidden)
const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

interface UploadImageButtonProps {
  /** Data URL de la imatge pujada, si n'hi ha. Determina la miniatura i l'estat seleccionat. */
  imageUrl?: string;
  /** Rep el data URL de la imatge convertida i comprimida. */
  onUpload: (dataUrl: string) => void;
  /** Si es passa, apareix el botó de treure quan hi ha imatge pujada. */
  onRemove?: () => void;
}

/**
 * Botó de pujada d'imatge pròpia per al cercador de pictogrames.
 * Viu dins d'un StyledToggleButtonGroup, al costat dels resultats de cerca:
 * els estils del grup arriben als ToggleButton per context de MUI.
 */
const UploadImageButton = ({
  imageUrl,
  onUpload,
  onRemove,
}: UploadImageButtonProps): React.ReactElement => {
  const intl = useIntl();
  const { showSnackbar } = useFeedback();
  const imageQuality = useAppSelector((state) => state.ui.imageQuality);
  const quota = useAccountQuota();
  const [isLoading, setIsLoading] = useState(false);
  // Imatge convertida que no cap: espera que l'usuari decideixi què en fa
  const [offer, setOffer] = useState<ImageSizeOffer | null>(null);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasImage = isValidImageUrl(imageUrl);

  const uploadLabel = intl.formatMessage(
    hasImage ? messages.replace : messages.upload,
  );
  const removeLabel = intl.formatMessage({ ...messages.remove });
  const loadingLabel = intl.formatMessage({ ...messages.loading });

  const applyImage = (dataUrl: string) => {
    onUpload(dataUrl);
    showSnackbar({
      message: intl.formatMessage({ ...messages.uploaded }),
      severity: "success",
    });
  };

  const closeOffer = () => {
    setOffer(null);
    setPendingUrl(null);
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const input = event.target;
    const file = input.files?.[0];
    // Buidem l'input perquè tornar a triar el mateix fitxer dispari l'esdeveniment
    input.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showSnackbar({
        message: intl.formatMessage({ ...messages.errorNotImage }),
        severity: "error",
      });
      return;
    }

    setIsLoading(true);
    try {
      // La conversió comprimeix les imatges grans, per això pot trigar
      const base64Url = await fileToBase64(file, imageQuality);
      const bytes = getBase64SizeInBytes(base64Url);

      // Dos sostres: el pes màxim per imatge, que el servidor fa complir sempre,
      // i l'espai que queda al compte, que només existeix amb sessió. Mana el més
      // estret dels dos: reduir la imatge només fins a l'altre la deixaria igual
      // de fora, i hauríem fet perdre qualitat per res.
      const quotaAvailable = quota.hasQuota
        ? quota.remainingBytes
        : Number.POSITIVE_INFINITY;
      const availableBytes = Math.min(MAX_UPLOAD_IMAGE_BYTES, quotaAvailable);

      if (bytes > availableBytes) {
        setPendingUrl(base64Url);
        setOffer({
          reason:
            quotaAvailable < MAX_UPLOAD_IMAGE_BYTES ? "quota" : "perImage",
          bytes,
          availableBytes,
          smaller: await encodeToFit(base64Url, availableBytes, imageQuality),
        });
        return;
      }

      applyImage(base64Url);
    } catch (error) {
      console.error("Error carregant imatge:", error);
      showSnackbar({
        message: intl.formatMessage({ ...messages.errorLoading }),
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Un <label> no reenvia l'activació per teclat a l'input que conté:
  // sense això, el botó només s'obriria amb el ratolí
  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    inputRef.current?.click();
  };

  const handleRemove = () => {
    onRemove?.();
    showSnackbar({
      message: intl.formatMessage({ ...messages.removed }),
      severity: "info",
    });
  };

  return (
    <>
      <Tooltip title={isLoading ? loadingLabel : uploadLabel}>
        <ToggleButton
          value="upload"
          aria-label={isLoading ? loadingLabel : uploadLabel}
          aria-busy={isLoading}
          component="label"
          selected={hasImage}
          onKeyDown={handleKeyDown}
        >
          {isLoading && <CircularProgress size={ICON_SIZE} color="inherit" />}

          {!isLoading && hasImage && (
            <img
              src={imageUrl}
              alt={uploadLabel}
              width={THUMBNAIL_SIZE}
              height={THUMBNAIL_SIZE}
              style={{ objectFit: "contain" }}
            />
          )}

          {!isLoading && !hasImage && (
            <MdOutlineDriveFolderUpload size={ICON_SIZE} />
          )}

          {/* Mentre es processa no hi ha input: el botó deixa d'obrir el selector
              sense necessitat de `disabled`, que trencaria el Tooltip.
              L'input queda fora de l'arbre d'accessibilitat perquè el nom i el
              focus siguin només del botó: dins del label, l'input n'heretaria
              l'aria-label i el lector de pantalla anunciaria el mateix dos cops. */}
          {!isLoading && (
            <VisuallyHiddenInput
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              tabIndex={-1}
              aria-hidden="true"
            />
          )}
        </ToggleButton>
      </Tooltip>

      <ImageSizeDialog
        offer={offer}
        onUseSmaller={() => {
          if (offer?.smaller) applyImage(offer.smaller.dataUrl);
          closeOffer();
        }}
        onUseOriginal={() => {
          if (pendingUrl) applyImage(pendingUrl);
          closeOffer();
        }}
        onCancel={closeOffer}
      />

      {hasImage && onRemove && (
        <Tooltip title={removeLabel}>
          <ToggleButton
            value="removeUpload"
            aria-label={removeLabel}
            onClick={handleRemove}
          >
            <AiOutlineDelete size={ICON_SIZE} />
          </ToggleButton>
        </Tooltip>
      )}
    </>
  );
};

export default UploadImageButton;
