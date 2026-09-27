// Avís discret, no bloquejant, sobre l'estil de la seqüència oberta:
//
// - En obrir-ne una amb estil propi: «Aquesta seqüència té el seu propi estil»,
//   amb «Canvia l'estil» a mà. I si demana fonts que el dispositiu no té, ho diu.
// - Després de canviar-ne l'estil: què s'ha aplicat, amb «Desfés» i, si l'estil
//   venia d'un fitxer, «Desa com a estil per defecte».
//
// Va dins del contingut, a dalt, com l'avís de verificació del correu, i no
// flotant: així no tapa ni el full ni la confirmació de «Fitxer carregat», que
// surt alhora. El contenidor de la regió viva hi és sempre, perquè el lector de
// pantalla anunciï l'avís quan hi aparegui (`aria-live="polite"`: no
// interromp). Es tanca amb la creu o amb Esc des de dins.
import React from "react";
import { Alert, Box, Stack } from "@mui/material";
import { useIntl } from "react-intl";
import StyledButton from "@/style/StyledButton";
import { APP_TOUCH_TARGET_MIN } from "@/style/appShape";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { useFeedback } from "@/context/FeedbackContext";
import SettingsSaveErrorDialog from "@/Modals/DefaultSettingsModal/SettingsSaveErrorDialog";
import NotPrint from "@components/utils/NotPrint/NotPrint";
import {
  changeStyleOpenedActionCreator,
  selectCanUndoStyle,
  styleNoticeClosedActionCreator,
  undoStyleChangeThunk,
} from "@features/sequence/store/styleSlice";
import { useSetDefaultStyle } from "@features/sequence/hooks/useSetDefaultStyle";
import messages from "./ChangeStyle.lang";

const touchTarget = { minHeight: APP_TOUCH_TARGET_MIN };

const DocumentStyleNotice = (): React.ReactElement => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { showSnackbar } = useFeedback();
  const notice = useAppSelector((state) => state.style.notice);
  const documentId = useAppSelector((state) => state.document.id);
  const canUndo = useAppSelector(selectCanUndoStyle);
  const { setAsDefault, retry, failure, isRetrying, dismissError } =
    useSetDefaultStyle();

  // L'avís és d'un document concret; el d'un canvi d'estil, a més, només té
  // sentit mentre es pugui desfer
  const visible =
    notice !== null &&
    notice.documentId === documentId &&
    (notice.kind === "opened" || canUndo);

  const close = () => dispatch(styleNoticeClosedActionCreator());

  const handleUndo = () => {
    dispatch(undoStyleChangeThunk());
    showSnackbar({
      message: intl.formatMessage(messages.undone),
      severity: "success",
    });
  };

  const renderContent = (): {
    text: React.ReactNode;
    actions: React.ReactNode;
  } | null => {
    if (!visible || notice === null) return null;

    if (notice.kind === "opened") {
      return {
        text: (
          <>
            {notice.ownStyle && (
              <div>{intl.formatMessage(messages.noticeOwnStyle)}</div>
            )}
            {notice.unavailableFonts.length > 0 && (
              <div>
                {intl.formatMessage(messages.noticeUnavailableFonts, {
                  fonts: intl.formatList(notice.unavailableFonts, {
                    type: "conjunction",
                  }),
                })}
              </div>
            )}
          </>
        ),
        actions: (
          <StyledButton
            color="inherit"
            sx={touchTarget}
            onClick={() => dispatch(changeStyleOpenedActionCreator())}
          >
            {intl.formatMessage(messages.changeStyle)}
          </StyledButton>
        ),
      };
    }

    const { fileStyle } = notice;
    return {
      text: intl.formatMessage(
        notice.source === "file"
          ? messages.noticeChangedFile
          : messages.noticeChangedUserDefault,
      ),
      actions: (
        <>
          <StyledButton color="inherit" sx={touchTarget} onClick={handleUndo}>
            {intl.formatMessage(messages.undo)}
          </StyledButton>
          {fileStyle && (
            <StyledButton
              color="inherit"
              sx={touchTarget}
              onClick={() => setAsDefault(fileStyle)}
            >
              {intl.formatMessage(messages.setAsDefault)}
            </StyledButton>
          )}
        </>
      ),
    };
  };

  const content = renderContent();

  return (
    <>
      {/* Mai al paper: l'avís és de la pantalla, no de la seqüència */}
      <NotPrint>
        <Box role="status" aria-live="polite">
          {content && (
            <Box sx={{ px: 2, pt: 1 }}>
              <Alert
                severity="info"
                variant="outlined"
                // La regió viva és el contenidor: l'Alert no ha de tornar a ser
                // un `role="alert"`, que interromp el que s'estigui llegint
                role="presentation"
                onClose={close}
                closeText={intl.formatMessage(messages.closeNotice)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") close();
                }}
                slotProps={{
                  closeButton: {
                    sx: { ...touchTarget, minWidth: APP_TOUCH_TARGET_MIN },
                  },
                }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  gap={1}
                  flexWrap="wrap"
                >
                  <Box>{content.text}</Box>
                  <Stack direction="row" gap={1} flexWrap="wrap">
                    {content.actions}
                  </Stack>
                </Stack>
              </Alert>
            </Box>
          )}
        </Box>
      </NotPrint>
      <SettingsSaveErrorDialog
        failure={failure}
        isRetrying={isRetrying}
        onRetry={retry}
        onDismiss={dismissError}
      />
    </>
  );
};

export default DocumentStyleNotice;
