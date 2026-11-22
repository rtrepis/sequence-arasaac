// La fila «Estil» del nivell «Bloc» de la columna de la vista (pla dels
// estils, pas 6; fonament 03, §5 i §6).
//
// - El nom de l'estil que pinta el bloc: el seu reassignat, o el de la
//   seqüència. Si algun pictograma de la seqüència té retocs, «Personalitzat»,
//   amb la mateixa marca que la targeta i una ajuda amb l'estil de base (D13).
// - Si el bloc té un estil **reassignat**, una marca de «reassignat» (una altra
//   forma) i el botó «Torna a l'estil de la seqüència» (D14). Totes dues marques
//   poden sortir alhora.
// - «Canvia…» obre la Galeria d'estils per a aquest bloc (D12): el mateix que
//   «Tria un estil…» del menú «⋯» del bloc.
//
// La columna no surt mai al paper ni a la pantalla completa: les marques
// tampoc.
import React, { useState } from "react";
import { Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { MdHelpOutline, MdOutlinePalette, MdTune } from "react-icons/md";
import { TbArrowBackUp } from "react-icons/tb";
import { useIntl } from "react-intl";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import type { SequencePlacement } from "@/types/document";
import { APP_TOUCH_TARGET_MIN } from "@/style/appShape";
import StyledButton from "@/style/StyledButton";
import { SettingRow } from "@/components/SettingsLayout";
import { namedStyleOf } from "@features/sequence/style/namedStyle";
import {
  chooseBlockStyleThunk,
  retouchedCountOf,
} from "@features/sequence/store/sequenceStyleThunks";
import {
  customizedMark,
  reassignedMark,
} from "@features/sequence/components/PictEdit/PictEditModal.styled";
import StyleGallery from "@features/sequence/components/StyleGallery/StyleGallery";
import galleryMessages from "@features/sequence/components/StyleGallery/StyleGallery.lang";
import headerMessages from "@features/sequence/components/SequenceHeader/SequenceHeader.lang";
import messages from "./ViewLevels.lang";

const LABEL_ID = "view-level-block-style";

interface BlockStyleRowProps {
  placement: SequencePlacement;
  /** El nom del bloc (el de la seqüència) */
  name: string;
}

const BlockStyleRow = ({
  placement,
  name,
}: BlockStyleRowProps): React.ReactElement => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const [galleryOpen, setGalleryOpen] = useState(false);

  const { sequenceKey } = placement;
  const styles = useAppSelector((state) => state.document.styles);
  const documentStyleName = useAppSelector((state) => state.document.styleName);
  const sequenceStyleName = useAppSelector(
    (state) =>
      namedStyleOf(
        state.document.styles,
        state.document.sequenceStyleIds?.[sequenceKey],
      )?.name,
  );
  const retouched = useAppSelector((state) =>
    retouchedCountOf(state.document, sequenceKey),
  );

  const reassigned = namedStyleOf(styles, placement.styleId);
  // L'estil de la seqüència: el seu, o el del document (que pot no tenir nom)
  const sequenceName =
    sequenceStyleName ??
    documentStyleName ??
    intl.formatMessage(galleryMessages.documentStyle);
  const baseName = reassigned?.name ?? sequenceName;
  const customized = retouched > 0;
  const customizedHelp = intl.formatMessage(headerMessages.customizedHelp, {
    name: baseName,
    count: retouched,
  });
  const reassignedLabel = intl.formatMessage(messages.blockStyleReassigned, {
    name: sequenceName,
  });

  const touchTarget = {
    minWidth: APP_TOUCH_TARGET_MIN,
    minHeight: APP_TOUCH_TARGET_MIN,
  };

  return (
    <SettingRow
      title={intl.formatMessage(messages.blockStyle)}
      labelId={`${LABEL_ID}-title`}
      control="block"
      helperId={`${LABEL_ID}-helper`}
      helper={reassigned ? reassignedLabel : undefined}
    >
      <Stack gap={1} aria-labelledby={`${LABEL_ID}-title`} role="group">
        <Stack direction="row" alignItems="center" gap={0.75} flexWrap="wrap">
          {/* El valor, no un títol: sense la negreta de la fila */}
          <Typography data-testid="block-style-name" fontWeight="normal">
            {customized
              ? intl.formatMessage(headerMessages.customized)
              : baseName}
          </Typography>
          {customized && (
            <>
              {/* La mateixa marca que la targeta (D13) */}
              <Box aria-hidden sx={customizedMark}>
                <MdTune />
              </Box>
              <Tooltip title={customizedHelp} enterTouchDelay={0}>
                <IconButton
                  aria-label={customizedHelp}
                  size="small"
                  sx={touchTarget}
                >
                  <MdHelpOutline aria-hidden />
                </IconButton>
              </Tooltip>
            </>
          )}
          {reassigned && (
            <Tooltip title={reassignedLabel} enterTouchDelay={0}>
              <Box
                role="img"
                aria-label={reassignedLabel}
                data-testid="reassigned-mark"
                sx={reassignedMark}
              >
                <MdOutlinePalette aria-hidden />
              </Box>
            </Tooltip>
          )}
        </Stack>
        <Stack direction="row" gap={1} flexWrap="wrap">
          <StyledButton
            variant="outlined"
            color="inherit"
            aria-haspopup="dialog"
            aria-describedby={reassigned ? `${LABEL_ID}-helper` : undefined}
            onClick={() => setGalleryOpen(true)}
            sx={{ minHeight: APP_TOUCH_TARGET_MIN }}
          >
            {intl.formatMessage(messages.blockStyleChange)}
          </StyledButton>
          {reassigned && (
            <StyledButton
              color="inherit"
              startIcon={<TbArrowBackUp aria-hidden />}
              onClick={() =>
                dispatch(
                  chooseBlockStyleThunk(placement.id, { name: sequenceName }),
                )
              }
              sx={{ minHeight: APP_TOUCH_TARGET_MIN }}
            >
              {intl.formatMessage(messages.blockStyleBackToSequence)}
            </StyledButton>
          )}
        </Stack>
      </Stack>

      {galleryOpen && (
        <StyleGallery
          open
          onClose={() => setGalleryOpen(false)}
          target={{
            kind: "block",
            placementId: placement.id,
            sequenceKey,
            name,
          }}
        />
      )}
    </SettingRow>
  );
};

export default BlockStyleRow;
