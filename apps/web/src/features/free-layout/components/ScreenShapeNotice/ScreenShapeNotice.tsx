// La pregunta de la pantalla sencera en una pantalla d'una altra forma (PS2 de
// `docs/plans/fets/PLA-mode-lliure.md`, §13, «La pantalla sencera amb blocs»).
//
// El full de pantalla sencera és la pantalla on es va encendre. En una altra
// forma el full es veu sencer, amb vores, i aquí es pregunta si s'adapta a la
// d'ara. És **estat del document que es mira**, no la confirmació d'una acció:
// un bàner com el de l'estil propi (`DocumentStyleNotice`), dins del contingut i
// mai al paper. Si es tanca, no torna fins que el document es torna a obrir:
// la resposta és estat de la pantalla, no va enlloc.
import React, { useEffect, useState } from "react";
import { Alert, Box, Button, Stack } from "@mui/material";
import { useIntl } from "react-intl";
import { APP_TOUCH_TARGET_MIN } from "@/style/appShape";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import NotPrint from "@components/utils/NotPrint/NotPrint";
import {
  ScreenSize,
  currentScreen,
  differentShape,
} from "@features/print/utils/pageFormat";
import styleMessages from "@features/sequence/components/DocumentStyle/DocumentStyle.lang";
import { adaptToScreenThunk } from "../../store/freeLayoutThunks";
import messages from "./ScreenShapeNotice.lang";

const touchTarget = { minHeight: APP_TOUCH_TARGET_MIN };

/** La pantalla d'ara, que canvia si la finestra passa a una altra pantalla. */
const useCurrentScreen = (): ScreenSize => {
  const [screen, setScreen] = useState(currentScreen);
  useEffect(() => {
    const update = () =>
      setScreen((previous) => {
        const next = currentScreen();
        return previous.width === next.width && previous.height === next.height
          ? previous
          : next;
      });
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return screen;
};

const ScreenShapeNotice = (): React.ReactElement => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const layout = useAppSelector((state) => state.document.layout);
  const documentId = useAppSelector((state) => state.document.id);
  const screen = useCurrentScreen();
  // El document per al qual s'ha tancat: un altre torna a preguntar
  const [closedFor, setClosedFor] = useState<string | null>(null);

  const visible =
    layout?.pageSize === "FULLSCREEN" &&
    layout.screen !== undefined &&
    differentShape(layout.screen, screen) &&
    closedFor !== documentId;
  const close = () => setClosedFor(documentId);

  return (
    // Mai al paper: el bàner és de la pantalla, no del document
    <NotPrint>
      <Box role="status" aria-live="polite">
        {visible && (
          <Box sx={{ px: 2, pt: 1 }}>
            <Alert
              severity="info"
              variant="outlined"
              // La regió viva és el contenidor: l'Alert no ha de tornar a ser
              // un `role="alert"`, que interromp el que s'estigui llegint
              role="presentation"
              onClose={close}
              closeText={intl.formatMessage(styleMessages.closeNotice)}
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
                <Box>{intl.formatMessage(messages.notice)}</Box>
                {/* El canvi es diu amb el snackbar de sempre, amb «Desfés» */}
                <Button
                  size="small"
                  variant="outlined"
                  color="inherit"
                  sx={touchTarget}
                  onClick={() => dispatch(adaptToScreenThunk())}
                >
                  {intl.formatMessage(messages.adapt)}
                </Button>
              </Stack>
            </Alert>
          </Box>
        )}
      </Box>
    </NotPrint>
  );
};

export default ScreenShapeNotice;
