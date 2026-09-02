// Llista d'arguments de la columna de suport de les pàgines d'autenticació.
//
// Cada punt és una icona, un titular curt i una explicació d'una línia. És el
// patró de qualsevol pàgina de registre: qui encara no té compte necessita
// saber què hi guanya abans d'escriure el seu correu.
import React, { ReactNode } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { APP_FIELD_RADIUS } from "@/style/appShape";

export interface AuthHighlight {
  /** Clau estable de la llista: no es dibuixa enlloc. */
  id: string;
  icon: ReactNode;
  title: string;
  description: string;
}

interface AuthHighlightsProps {
  /** Encapçalament de la llista. Va en gris i en majúscules, com el d'una
      secció de configuració: és context, no una acció. */
  title?: string;
  items: AuthHighlight[];
}

const AuthHighlights = ({
  title,
  items,
}: AuthHighlightsProps): React.ReactElement => (
  <Stack spacing={2.5}>
    {title && (
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ fontWeight: 700, lineHeight: 1.6 }}
      >
        {title}
      </Typography>
    )}

    <Stack component="ul" spacing={2.5} sx={{ m: 0, p: 0, listStyle: "none" }}>
      {items.map(({ id, icon, title: itemTitle, description }) => (
        <Stack
          key={id}
          component="li"
          direction="row"
          spacing={2}
          alignItems="flex-start"
        >
          {/* La icona va sobre una superfície verda amb la tinta fosca de la
              casa: el verd com a color d'icona sobre l'escriptori es quedaria a
              2,1:1, i el mínim per a una icona és 3:1 */}
          <Box
            aria-hidden
            sx={{
              flexShrink: 0,
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: `${APP_FIELD_RADIUS}px`,
              backgroundColor: "primary.main",
              color: "primary.contrastText",
              fontSize: "1.35rem",
            }}
          >
            {icon}
          </Box>

          <Box>
            <Typography variant="subtitle2" fontWeight={700}>
              {itemTitle}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </Box>
        </Stack>
      ))}
    </Stack>
  </Stack>
);

export default AuthHighlights;
