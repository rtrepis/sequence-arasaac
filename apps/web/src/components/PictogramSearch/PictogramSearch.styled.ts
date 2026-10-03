import { SxProps, Theme } from "@mui/material";

/**
 * El «+» i el «−» de la fila de pictogrames trobats. Són icones i no imatges:
 * hereten la tinta del tema i per això es veuen tant sobre l'escriptori clar
 * com sobre el fosc.
 *
 * Són de Tabler, que les dibuixa amb traç i no amb farciment, i per això es
 * poden engruixir amb `strokeWidth` perquè no quedin primes al costat dels
 * pictogrames. Les de Material no servien: porten un rectangle invisible de
 * 24×24 (`fill="none"`) que, en donar-li traç, es pinta i fa un requadre.
 */
export const searchToggleIcon = {
  color: "text.primary",
  "& svg": { strokeWidth: 3 },
} satisfies SxProps<Theme>;
