// Avís de la graella d'edició: el text de la targeta no hi cap i es talla (B28).
//
// La marca diu què passa amb el ratolí a sobre (tooltip) i, amb un clic o un
// toc, obre les opcions: en tauleta no hi ha hover, i qui prepara el document
// és qui sap si li convé reduir la lletra o canviar el text. Per això l'app no
// ho decideix.
import React, { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import {
  Box,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Popover,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  MdOutlineTextDecrease,
  MdOutlineTextFields,
  MdPriorityHigh,
  MdTune,
} from "react-icons/md";
import messages from "./PictEdit.lang";
import { textOverflowHitArea, textOverflowMark } from "./PictEditModal.styled";

interface TextOverflowWarningProps {
  /** Número del pictograma, per al nom accessible de la marca */
  number: number;
  /** Mida amb què el text hi cabria, o `null` si no hi cap ni amb la mínima */
  fittingSize: number | null;
  /**
   * Es pot reduir la lletra de tot el document? Només si el pictograma no té
   * mida pròpia: si en té, canviar la del document no el tocaria.
   */
  canFitDocument: boolean;
  onFitPictogram: (size: number) => void;
  onFitDocument: (size: number) => void;
  /** Editar el text a la targeta; sense, no s'ofereix */
  onEditText?: () => void;
}

const TextOverflowWarning = ({
  number,
  fittingSize,
  canFitDocument,
  onFitPictogram,
  onFitDocument,
  onEditText,
}: TextOverflowWarningProps): React.ReactElement => {
  const intl = useIntl();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  // L'editor del text surt quan el quadre ja s'ha tancat: en tancar-se torna
  // el focus a la marca, i l'editor el perdria i es tancaria
  const [editOnExited, setEditOnExited] = useState(false);

  const popoverId = `text-overflow-${number}`;
  const titleId = `${popoverId}-title`;
  const label = intl.formatMessage(messages.textOverflowMark, { number });
  const size =
    fittingSize === null
      ? ""
      : intl.formatNumber(fittingSize, { maximumFractionDigits: 1 });

  const close = () => setAnchorEl(null);

  const choose = (action: () => void) => () => {
    close();
    action();
  };

  const handleExited = () => {
    if (!editOnExited) return;
    setEditOnExited(false);
    onEditText?.();
  };

  return (
    <>
      <Tooltip title={intl.formatMessage(messages.textOverflowTooltip)}>
        <IconButton
          aria-label={label}
          aria-haspopup="dialog"
          aria-expanded={Boolean(anchorEl)}
          aria-controls={anchorEl ? popoverId : undefined}
          onClick={(event) => setAnchorEl(event.currentTarget)}
          sx={textOverflowHitArea}
        >
          <Box component="span" sx={textOverflowMark}>
            <MdPriorityHigh aria-hidden />
          </Box>
        </IconButton>
      </Tooltip>
      <Popover
        id={popoverId}
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={close}
        // Sota la marca i cap a la dreta, perquè es vegi el tall tant com es pugui
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        TransitionProps={{ onExited: handleExited }}
        slotProps={{
          paper: {
            role: "dialog",
            "aria-labelledby": titleId,
            sx: { maxWidth: 360 },
          },
        }}
      >
        <Box sx={{ paddingInline: 2, paddingBlockStart: 2 }}>
          <Typography
            id={titleId}
            component="h2"
            variant="subtitle1"
            sx={{ fontWeight: "bold" }}
          >
            <FormattedMessage {...messages.textOverflowTitle} />
          </Typography>
          <Typography variant="body2" sx={{ marginBlockStart: 0.5 }}>
            <FormattedMessage {...messages.textOverflowExplanation} />
          </Typography>
          {fittingSize === null && (
            <Typography variant="body2" sx={{ marginBlockStart: 1 }}>
              <FormattedMessage {...messages.textOverflowTooLong} />
            </Typography>
          )}
        </Box>
        <List aria-labelledby={titleId}>
          {fittingSize !== null && canFitDocument && (
            <ListItemButton onClick={choose(() => onFitDocument(fittingSize))}>
              <ListItemIcon>
                <MdOutlineTextDecrease />
              </ListItemIcon>
              <ListItemText
                primary={intl.formatMessage(messages.textOverflowFitDocument, {
                  size,
                })}
              />
            </ListItemButton>
          )}
          {fittingSize !== null && (
            <ListItemButton onClick={choose(() => onFitPictogram(fittingSize))}>
              {/* La icona de «personalitzat»: és el que quedarà */}
              <ListItemIcon>
                <MdTune />
              </ListItemIcon>
              <ListItemText
                primary={intl.formatMessage(messages.textOverflowFitPictogram, {
                  size,
                })}
              />
            </ListItemButton>
          )}
          {onEditText && (
            <ListItemButton onClick={choose(() => setEditOnExited(true))}>
              <ListItemIcon>
                <MdOutlineTextFields />
              </ListItemIcon>
              <ListItemText
                primary={intl.formatMessage(messages.textOverflowEditText)}
              />
            </ListItemButton>
          )}
        </List>
      </Popover>
    </>
  );
};

export default TextOverflowWarning;
