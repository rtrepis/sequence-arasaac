import { Box, Card, CardContent, CardMedia, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import usePictogramUrl from "../../features/pictogram/hooks/usePictogramUrl";
import { Border, PictogramCardDefaults, PictSequence } from "../../types/sequence";
import {
  pictogram__card,
  pictogram__media,
  textContent,
} from "./PictogramCard.styled";
import messages from "./PictogramCart.lang";
import fitzgeraldToBorder from "../../utils/fitzgeraldToBorder";
import React from "react";

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

  const borderIn: Border = pictBorderIn
    ? fitzgeraldToBorder(fitzgerald, pictBorderIn)
    : fitzgeraldToBorder(fitzgerald, defaults.borderIn);

  const borderOut: Border = pictBorderOut
    ? fitzgeraldToBorder(fitzgerald, pictBorderOut)
    : fitzgeraldToBorder(fitzgerald, defaults.borderOut);

  const pictSize = size?.pictSize ?? 1;
  const printPageRatio = size?.scale ?? 1;
  const font = pictFont ?? defaults.font;
  // Tipografia dels números: per-pictograma → per defecte → tipografia del text
  const numberFont =
    pictNumberFont ?? defaults.numberFont ?? defaults.font;

  const textFontSize = 20 * font.size * printPageRatio * pictSize;
  const numberFontSize = 20 * numberFont.size * printPageRatio * pictSize;

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
              fontFamily={numberFont.family}
              color={numberFont.color}
              component="h3"
              sx={{ "@media print": { fontSize: 20 * pictSize } }}
            >
              {indexSequence + 1}
            </Typography>
          )}
          {textPosition === "top" && (
            <Typography
              fontSize={textFontSize}
              fontFamily={font.family}
              color={font.color}
              component="h3"
              sx={{ "@media print": { fontSize: 20 * pictSize } }}
            >
              {text}
            </Typography>
          )}
        </CardContent>
      )}
      <CardContent sx={{ padding: 0, position: "relative" }}>
        <CardMedia
          component="img"
          image={
            // Ignorem URLs blob (temporals) perquè no són vàlides després de recarregar
            url && !url.startsWith("blob:")
              ? url
              : buildPictogramUrl(selectedId, skin, hair, color)
          }
          height={150 * pictSize * printPageRatio}
          width={150 * pictSize * printPageRatio}
          alt={intl.formatMessage({ ...messages.pictogram })}
          sx={() => pictogram__media(borderIn, view, pictSize, printPageRatio)}
        />
        {cross && (
          <Box
            sx={{
              backgroundImage: `url(${"../img/settings/tachado_rojo.svg"})`,
              backgroundRepeat: "no-repeat",
              position: "absolute",
              height: `${300 * pictSize * printPageRatio}px`,
              width: `${210 * pictSize * printPageRatio}px`,
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -34%)",
            }}
          ></Box>
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
              fontFamily={font.family}
              color={font.color}
              component="h3"
              sx={{ "@media print": { fontSize: 20 * pictSize } }}
            >
              {text}
            </Typography>
          )}
          {textPosition === "top" && defaults.numbered && (
            <Typography
              fontSize={numberFontSize}
              fontFamily={numberFont.family}
              color={numberFont.color}
              component="h3"
              sx={{ "@media print": { fontSize: 20 * pictSize } }}
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
