// Avís de sessió caiguda: l'únic lloc de l'app que se n'assabenta i l'únic que
// hi fa alguna cosa.
//
// Neteja l'estat d'autenticació —que fins ara es quedava amb el correu i el
// token d'una sessió morta— i ofereix la sortida. No bloqueja: l'editor funciona
// sencer sense compte, i enfosquir la pantalla per dir que ara mateix no es pot
// desar al núvol seria treure l'eina a qui encara pot treballar.
import { ReactElement, useEffect, useState } from "react";
import { Alert, AlertTitle, Button, IconButton, Snackbar } from "@mui/material";
import { AiOutlineClose } from "react-icons/ai";
import { useIntl } from "react-intl";
import { useAppDispatch, useAppSelector } from "@app/hooks";
import { RootState } from "@app/store";
import { clearAuthState } from "@features/backend/auth/store/authSlice";
import { clearExpiredSession } from "@features/backend/api/sessionExpiry";
import { useExpiredSessionCode } from "@features/backend/api/useSessionExpiry";
import AuthModal from "./AuthModal";
import authMessages from "./AuthModal.lang";
import messages from "./SessionExpiredNotice.lang";

const selectAccessToken = (state: RootState): string | null =>
  state.auth.accessToken;

/**
 * Codis amb què tornar a entrar no serviria de res: el formulari tornaria a dir
 * que no i, a sobre, diria una altra cosa. Convidar-hi seria fer perdre el temps
 * a qui menys s'ho mereix.
 */
const NO_WAY_BACK = new Set(["ACCOUNT_SUSPENDED", "USER_NOT_FOUND"]);

const titleFor = (code: string) => {
  switch (code) {
    case "REFRESH_TOKEN_MISSING":
      return messages.titleMissing;
    case "INVALID_REFRESH_TOKEN":
      return messages.titleInvalid;
    case "ACCOUNT_SUSPENDED":
      return messages.titleSuspended;
    case "USER_NOT_FOUND":
      return messages.titleGone;
    default:
      return messages.titleExpired;
  }
};

const SessionExpiredNotice = (): ReactElement | null => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const code = useExpiredSessionCode();
  const accessToken = useAppSelector(selectAccessToken);

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  // Estat i no `ref`: el render següent és el que ha de veure l'estat d'auth ja
  // net, i és el que permet distingir «acabo de netejar-ho» de «ha tornat a
  // entrar» a l'efecte de sota
  const [isAuthCleared, setIsAuthCleared] = useState(false);

  useEffect(() => {
    if (code === null) {
      setIsAuthCleared(false);
      return;
    }
    if (isAuthCleared) return;

    // `clearAuthState` existia, exportat i sense cap consumidor, des que es va
    // escriure el slice: aquest n'és el motiu
    dispatch(clearAuthState());
    setIsAuthCleared(true);
  }, [code, isAuthCleared, dispatch]);

  useEffect(() => {
    // Amb l'estat ja net, un token nou només pot voler dir que l'usuari ha
    // tornat a entrar: un avís de sessió caiguda amb la sessió oberta és pitjor
    // que no dir-ne res
    if (!isAuthCleared || accessToken === null) return;
    clearExpiredSession();
  }, [isAuthCleared, accessToken]);

  if (code === null) return null;

  const canReturn = !NO_WAY_BACK.has(code);
  const body = intl.formatMessage(authMessages.errorWithCode, {
    message: intl.formatMessage(
      canReturn ? messages.bodyCanReturn : messages.bodyNoReturn,
    ),
    code,
  });

  return (
    <>
      <Snackbar
        open
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        // Sense autoHideDuration: no és la confirmació d'una acció, és un canvi
        // d'estat del compte que l'usuari ha de poder llegir quan torni a mirar
      >
        <Alert
          severity="warning"
          variant="outlined"
          // L'outlined de MUI és transparent i, sobre el contingut, el text
          // quedaria il·legible
          sx={{ width: "100%", bgcolor: "background.paper" }}
          // Tot dins d'`action`: quan MUI en rep un, deixa de pintar el botó de
          // tancar de `onClose`, i un avís sense temporitzador que no es pot
          // treure de la pantalla és una trampa, sobretot en mòbil
          action={
            <>
              {canReturn && (
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => setIsAuthOpen(true)}
                >
                  {intl.formatMessage(messages.action)}
                </Button>
              )}
              <IconButton
                color="inherit"
                size="small"
                onClick={clearExpiredSession}
                aria-label={intl.formatMessage(messages.dismiss)}
              >
                <AiOutlineClose />
              </IconButton>
            </>
          }
        >
          <AlertTitle>{intl.formatMessage(titleFor(code))}</AlertTitle>
          {body}
        </Alert>
      </Snackbar>

      <AuthModal open={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
};

export default SessionExpiredNotice;
