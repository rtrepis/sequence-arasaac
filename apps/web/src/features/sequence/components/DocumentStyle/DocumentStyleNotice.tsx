// Bàner d'estat del document que s'acaba d'obrir: té un estil propi, diferent
// de l'estil per defecte de qui l'obre, demana fonts que el dispositiu no té, o
// és d'una altra versió de l'app (més antiga i adaptada, o més nova).
//
// És **estat del document**, no la confirmació d'una acció, i per això és un
// bàner i no un snackbar (`docs/estandards/feedback-i-accions.md`): va dins del
// contingut, a dalt, com l'avís de verificar el correu; es queda fins que es
// tanca (creu, o Esc des de dins), no s'imprimeix, i el contenidor de la regió
// viva hi és sempre perquè el lector de pantalla l'anunciï quan hi aparegui
// (`aria-live="polite"`: no interromp). El botó porta al panell «Estil del
// document», que és on es canvia.
import React from "react";
import { Alert, Box, Stack } from "@mui/material";
import { useIntl } from "react-intl";
import StyledButton from "@/style/StyledButton";
import { APP_TOUCH_TARGET_MIN } from "@/style/appShape";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import NotPrint from "@components/utils/NotPrint/NotPrint";
import {
  styleNoticeClosedActionCreator,
  stylePanelRequestedActionCreator,
} from "@features/sequence/store/styleSlice";
import messages from "./DocumentStyle.lang";

const touchTarget = { minHeight: APP_TOUCH_TARGET_MIN };

const DocumentStyleNotice = (): React.ReactElement => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const notice = useAppSelector((state) => state.style.notice);
  const documentId = useAppSelector((state) => state.document.id);

  const visible = notice !== null && notice.documentId === documentId;
  const close = () => dispatch(styleNoticeClosedActionCreator());

  return (
    // Mai al paper: el bàner és de la pantalla, no del document
    <NotPrint>
      <Box role="status" aria-live="polite">
        {visible && (
          <Box sx={{ px: 2, pt: 1 }}>
            <Alert
              // Una versió més nova pot perdre canvis si es desa: és un avís
              severity={notice.newerVersion ? "warning" : "info"}
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
                <Box>
                  {notice.newerVersion && (
                    <div>{intl.formatMessage(messages.noticeNewerVersion)}</div>
                  )}
                  {notice.legacy && (
                    <div>
                      {intl.formatMessage(messages.noticeLegacy)}
                      {notice.withoutStyle &&
                        ` ${intl.formatMessage(messages.noticeWithoutStyle)}`}
                    </div>
                  )}
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
                </Box>
                <StyledButton
                  color="inherit"
                  sx={touchTarget}
                  onClick={() => dispatch(stylePanelRequestedActionCreator())}
                >
                  {intl.formatMessage(messages.panelTitle)}
                </StyledButton>
              </Stack>
            </Alert>
          </Box>
        )}
      </Box>
    </NotPrint>
  );
};

export default DocumentStyleNotice;
