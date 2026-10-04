import { Box, Card, CardContent, CardMedia, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import usePictogramUrl from "../../features/pictogram/hooks/usePictogramUrl";
import {
  Border,
  PictogramCardDefaults,
  PictSequence,
} from "../../types/sequence";
import {
  pictogram__card,
  pictogram__media,
  textContent,
} from "./PictogramCard.styled";
import messages from "./PictogramCart.lang";
import fitzgeraldToBorder from "../../utils/fitzgeraldToBorder";
import React, { useState } from "react";
import { EMPTY_PICTOGRAM_URL } from "@features/pictogram/api/arasaacClient";
// Amb reserva: si el dispositiu no té la font del document, sans-serif i no
// la serif per defecte del navegador (vegeu `fontAvailability.ts`)
import { fontStack } from "@features/sequence/style/styleModel";
import { mergeDeep } from "@features/sequence/saac/cascade";

interface PictogramCardProps {
  pictogram: PictSequence;
  view: "complete" | "header" | "footer" | "none";
  defaults: PictogramCardDefaults;
  variant?: "plane";
  size?: { pictSize?: number; scale?: number };
}

const PictogramCard = ({
  pictogram: {
    indexSequence,
    img: {
      selectedId,
      settings: { skin, fitzgerald, hair, color },
      searched: { word },
      url,
    },
    settings: {
      font: pictFont,
      numberFont: pictNumberFont,
      textPosition,
      borderIn: pictBorderIn,
      borderOut: pictBorderOut,
    },
    text: customText,
    cross,
  },
  view,
  defaults,
  variant,
  size,
}: PictogramCardProps): React.ReactElement => {
  const { buildPictogramUrl } = usePictogramUrl();
  const intl = useIntl();

  const text = customText ? customText : word;

  // La cascada (`features/sequence/saac/cascade.ts`): el que retoca el
  // pictograma, propietat a propietat, sobre l'estil del document. Un
  // pictograma sense Fitzgerald pren el dels que no tenen categoria (C11)
  const fitzgeraldColor = fitzgerald ?? defaults.fitzgerald;

  const borderIn: Border = fitzgeraldToBorder(
    fitzgeraldColor,
    mergeDeep(defaults.borderIn, pictBorderIn),
  );

  const borderOut: Border = fitzgeraldToBorder(
    fitzgeraldColor,
    mergeDeep(defaults.borderOut, pictBorderOut),
  );

  const pictSize = size?.pictSize ?? 1;
  const printPageRatio = size?.scale ?? 1;
  const font = mergeDeep(defaults.font, pictFont);
  // Tipografia dels números: per-pictograma → per defecte → tipografia del text
  const numberFont = mergeDeep(
    defaults.numberFont ?? defaults.font,
    pictNumberFont,
  );

  // Imatge personalitzada de l'usuari (les URLs blob són temporals i s'ignoren)
  const customImageUrl = url && !url.startsWith("blob:") ? url : undefined;

  // Si la imatge no arriba —sense xarxa, una adreça que l'API ja no serveix,
  // una imatge pujada que s'ha esborrat—, la targeta es queda en blanc. La
  // icona de trencat del navegador també sortiria a la impressió i al PDF, i
  // allà no hi ha res a reintentar. Es desa quina adreça ha fallat, i no un
  // booleà, perquè en canviar-la (un altre pictograma, un altre color) es
  // torni a provar
  const imageUrl =
    customImageUrl ?? buildPictogramUrl(selectedId, skin, hair, color);
  const [failedUrl, setFailedUrl] = useState<string | undefined>(undefined);

  const textFontSize = 20 * font.size * printPageRatio * pictSize;
  const numberFontSize = 20 * numberFont.size * printPageRatio * pictSize;
  // A la impressió es treu l'escala de pantalla (`printPageRatio`), però no la
  // mida triada: sense, el paper sortia sempre a la mida 1 i no coincidia amb
  // la pantalla ni amb el PDF (B32)
  const printTextFontSize = 20 * font.size * pictSize;
  const printNumberFontSize = 20 * numberFont.size * pictSize;

  return (
    <Card
      data-testid="card-pictogram"
      sx={() => pictogram__card(borderOut, variant, pictSize, printPageRatio)}
    >
      {(view === "complete" || view === "header") && (
        <CardContent
          sx={() =>
            textContent(
              textPosition,
              defaults.numbered,
              borderOut.size,
              pictSize,
              printPageRatio,
            )
          }
        >
          {textPosition !== "top" && defaults.numbered && (
            <Typography
              fontSize={numberFontSize}
              fontFamily={fontStack(numberFont.family)}
              component="h3"
              sx={{
                color: numberFont.color,
                "@media print": { fontSize: printNumberFontSize },
              }}
            >
              {indexSequence + 1}
            </Typography>
          )}
          {textPosition === "top" && (
            <Typography
              fontSize={textFontSize}
              fontFamily={fontStack(font.family)}
              component="h3"
              // A la graella d'edició, un clic aquí edita el text a la targeta
              data-card-text
              sx={{
                color: font.color,
                "@media print": { fontSize: printTextFontSize },
              }}
            >
              {text}
            </Typography>
          )}
        </CardContent>
      )}
      <CardContent sx={{ padding: 0, position: "relative" }}>
        <CardMedia
          component="img"
          image={failedUrl === imageUrl ? EMPTY_PICTOGRAM_URL : imageUrl}
          onError={() => setFailedUrl(imageUrl)}
          height={150 * pictSize * printPageRatio}
          width={150 * pictSize * printPageRatio}
          alt={intl.formatMessage({ ...messages.pictogram })}
          sx={() => pictogram__media(borderIn, view, pictSize, printPageRatio)}
        />
        {cross && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
            }}
          >
            <svg
              viewBox="-55 147 500 500"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: "100%", height: "100%", display: "block" }}
            >
              <polygon
                fill="#FF0000"
                fillOpacity={0.7}
                points="419.8,147.1 445,147.1 445,173.5 220.9,398.4 445,623 445,646.9 416.8,646.9 195,424.3 -26.8,646.9 -55,646.9 -55,623 169.1,398.4 -55,173.5 -55,147.1 -29.8,147.1 195,372.5"
              />
            </svg>
          </Box>
        )}
      </CardContent>

      {(view === "complete" || view === "footer") && (
        <CardContent
          sx={() =>
            textContent(
              textPosition,
              defaults.numbered,
              borderIn.size,
              pictSize,
              printPageRatio,
            )
          }
        >
          {textPosition === "bottom" && (
            <Typography
              fontSize={textFontSize}
              fontFamily={fontStack(font.family)}
              component="h3"
              // A la graella d'edició, un clic aquí edita el text a la targeta
              data-card-text
              sx={{
                color: font.color,
                "@media print": { fontSize: printTextFontSize },
              }}
            >
              {text}
            </Typography>
          )}
          {textPosition === "top" && defaults.numbered && (
            <Typography
              fontSize={numberFontSize}
              fontFamily={fontStack(numberFont.family)}
              component="h3"
              sx={{
                color: numberFont.color,
                "@media print": { fontSize: printNumberFontSize },
              }}
            >
              {indexSequence + 1}
            </Typography>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default PictogramCard;
