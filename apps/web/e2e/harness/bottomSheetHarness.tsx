// Arnès de l'e2e d'`AppBottomSheet` (fase 3 de `docs/plans/fets/PLA-vista-mobil.md`): el
// panell sol, abans que la vista el munti, amb el botó d'estat de debò al
// costat per comprovar que s'hi posa damunt. No és part de l'app: el serveix
// el servidor de desenvolupament i el build no el veu.
import { ReactElement, StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { IntlProvider } from "react-intl";
import { BrowserRouter } from "react-router-dom";
import { Box, CssBaseline, ThemeProvider } from "@mui/material";
import { toMessages } from "@sequence-arasaac/i18n";
import caApp from "@sequence-arasaac/i18n/messages/app/ca.json";
import { createAppStore } from "@app/store";
import { buildTheme } from "@/style/themeMui";
import { FeedbackProvider } from "@/context/FeedbackContext";
import { AppBottomSheet, BottomSheetSnap } from "@components/AppBottomSheet";
import DocumentStatusFab from "@features/sequence/components/DocumentStatusFab/DocumentStatusFab";

const SETTINGS = Array.from({ length: 30 }, (_, index) => index + 1);

const Harness = (): ReactElement => {
  const [snap, setSnap] = useState<BottomSheetSnap>("collapsed");

  return (
    <>
      {/* El que hi ha a sota del panell: ocupa la pantalla i no es desplaça */}
      <Box
        data-testid="under"
        sx={{ position: "fixed", inset: 0, bgcolor: "background.default" }}
      >
        <button type="button">Al full</button>
      </Box>
      <DocumentStatusFab />
      <AppBottomSheet
        snap={snap}
        onSnapChange={setSnap}
        label="Ajustos"
        showLabel="Mostra els ajustos"
        hideLabel="Amaga els ajustos"
        returnLabel="Torna al full"
        header={<span>Document › Pàgina 1</span>}
      >
        <Box sx={{ p: 2 }}>
          {SETTINGS.map((setting) => (
            <Box key={setting} sx={{ py: 1.5 }}>
              <label>
                Ajust {setting} <input type="range" />
              </label>
            </Box>
          ))}
        </Box>
      </AppBottomSheet>
    </>
  );
};

const root = document.getElementById("root");
if (root)
  createRoot(root).render(
    <StrictMode>
      <Provider store={createAppStore()}>
        <ThemeProvider theme={buildTheme("light")}>
          <CssBaseline />
          <FeedbackProvider>
            <BrowserRouter>
              <IntlProvider
                locale="ca"
                defaultLocale="ca"
                messages={toMessages(caApp)}
              >
                <Harness />
              </IntlProvider>
            </BrowserRouter>
          </FeedbackProvider>
        </ThemeProvider>
      </Provider>
    </StrictMode>,
  );
