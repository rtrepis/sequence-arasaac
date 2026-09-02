// Closca única de les tres pàgines d'autenticació: creació de compte,
// recuperació de contrasenya i establiment de contrasenya.
//
// Dues columnes en escriptori (marca i arguments a l'esquerra, targeta del
// formulari a la dreta) i una de sola per sota de `AUTH_LAYOUT_BREAKPOINT`.
// En una sola columna l'ordre no és el mateix que apilar les dues: la marca es
// queda a dalt, però els arguments passen **sota** la targeta. Amb el text de
// suport a sobre, en un telèfon el primer camp del formulari cauria fora de la
// pantalla, i el que s'ha vingut a fer aquí és omplir el formulari.
import React, { ReactNode, useEffect } from "react";
import { Box, Paper, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { APP_CORNER_RADIUS } from "@/style/appShape";
import {
  AUTH_ASIDE_WIDTH,
  AUTH_CARD_WIDTH,
  AUTH_LAYOUT_BREAKPOINT,
  AUTH_MAX_WIDTH,
  AUTH_ZONE_GAP,
} from "./authLayout.styled";

interface AuthLayoutProps {
  /** Títol de la pàgina: és l'`h1` de la targeta i el títol del document. */
  title: string;
  /** Una línia sota el títol que diu què passarà. Opcional. */
  subtitle?: ReactNode;
  /** Contingut de la columna de suport: arguments, avisos, què cal saber. */
  aside?: ReactNode;
  /** El formulari o el missatge de resultat. */
  children: ReactNode;
}

const AuthLayout = ({
  title,
  subtitle,
  aside,
  children,
}: AuthLayoutProps): React.ReactElement => {
  // Cada pàgina d'auth diu on ets també a la pestanya del navegador: aquí s'hi
  // arriba des d'un correu, sovint amb l'app oberta en una altra pestanya.
  useEffect(() => {
    document.title = `${title} · SequenciAAC`;
  }, [title]);

  return (
    <Box
      component="main"
      id="main-content"
      sx={{
        minHeight: "100vh",
        // Als navegadors mòbils el 100vh compta la barra d'adreces que després
        // s'amaga, i la pàgina queda sempre una mica més alta que la finestra
        "@supports (min-height: 100dvh)": { minHeight: "100dvh" },
        backgroundColor: "background.default",
        display: "flex",
        // Centrat vertical només quan hi cap: amb el teclat obert en un telèfon
        // la pàgina és més alta que la finestra i el centrat amagaria el títol
        alignItems: { xs: "flex-start", [AUTH_LAYOUT_BREAKPOINT]: "center" },
        justifyContent: "center",
        px: 2,
        py: { xs: 3, [AUTH_LAYOUT_BREAKPOINT]: 6 },
      }}
    >
      <Box
        sx={{
          width: "100%",
          // Sense columna de suport no hi ha res a l'esquerra i la targeta es
          // queda centrada: amb l'amplada de dues columnes quedaria arrambada a
          // la dreta amb mig escriptori buit al costat (és el cas de la pàgina
          // de contrasenya, que té una sola feina i cap argument a fer)
          maxWidth: {
            xs: AUTH_CARD_WIDTH,
            [AUTH_LAYOUT_BREAKPOINT]: aside ? AUTH_MAX_WIDTH : AUTH_CARD_WIDTH,
          },
          display: "grid",
          gap: AUTH_ZONE_GAP,
          gridTemplateAreas: {
            xs: `"brand" "card" "aside"`,
            [AUTH_LAYOUT_BREAKPOINT]: aside
              ? `"brand card" "aside card"`
              : `"brand" "card"`,
          },
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            [AUTH_LAYOUT_BREAKPOINT]: aside
              ? `minmax(0, ${AUTH_ASIDE_WIDTH}px) minmax(0, ${AUTH_CARD_WIDTH}px)`
              : "minmax(0, 1fr)",
          },
          // La segona fila s'estira i la targeta hi cap sencera; la marca fa
          // només el que ocupa
          gridTemplateRows: {
            [AUTH_LAYOUT_BREAKPOINT]: aside ? "auto 1fr" : "auto auto",
          },
          // Sense això, en mòbil el gap de 48 px entre marca i targeta seria el
          // mateix que entre targeta i arguments, i la marca semblaria d'una
          // altra pàgina
          rowGap: { xs: 3, [AUTH_LAYOUT_BREAKPOINT]: AUTH_ZONE_GAP },
        }}
      >
        {/* La marca és també la sortida: en aquestes pàgines no hi ha barra de
            navegació, i qui hi arriba per error ha de poder tornar a l'inici */}
        <Stack
          component={RouterLink}
          to="/"
          direction="row"
          alignItems="center"
          spacing={1.5}
          sx={{
            gridArea: "brand",
            textDecoration: "none",
            color: "inherit",
            justifySelf: {
              xs: "center",
              [AUTH_LAYOUT_BREAKPOINT]: aside ? "start" : "center",
            },
          }}
        >
          <Box
            component="img"
            src="/favicon.png"
            alt=""
            sx={{ width: 44, height: 32 }}
          />
          <Typography variant="h6" component="span" fontWeight={800}>
            SequenciAAC
          </Typography>
        </Stack>

        <Paper
          sx={{
            gridArea: "card",
            p: { xs: 3, sm: 4 },
            display: "flex",
            flexDirection: "column",
            gap: 2,
            borderRadius: `${APP_CORNER_RADIUS}px`,
            // Igual que un diàleg, la targeta sura sobre l'escriptori
            boxShadow: 3,
          }}
        >
          <Box>
            <Typography variant="h5" component="h1" fontWeight={700}>
              {title}
            </Typography>
            {subtitle && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>

          {children}
        </Paper>

        {aside && <Box sx={{ gridArea: "aside" }}>{aside}</Box>}
      </Box>
    </Box>
  );
};

export default AuthLayout;
