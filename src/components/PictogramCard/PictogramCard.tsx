import { Box, Card, CardContent, CardMedia, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import { useAppSelector } from "../../app/hooks";
import useAraSaac from "../../hooks/useAraSaac";
import { Border, PictSequence } from "../../types/sequence";
import {
  pictogram__card,
  pictogram__media,
  textContent,
} from "./PictogramCard.styled";
import messages from "./PictogramCart.lang";
import fitzgeraldToBorder from "../../utils/fitzgeraldToBorder";

interface PictogramCardProps {
  pictogram: PictSequence;
  view: "complete" | "header" | "footer" | "none";
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
    },
    settings: {
      font: pictFont,
      textPosition,
      borderIn: pictBorderIn,
      borderOut: pictBorderOut,
    },
    text: customText,
    cross,
  },
  view,
  variant,
  size,
}: PictogramCardProps): JSX.Element => {
  const {
    borderIn: borderInDefaultSetting,
    borderOut: borderOutDefaultSetting,
    numbered,
    font: fontDefaultSetting,
  } = useAppSelector((state) => state.ui.defaultSettings.pictSequence);
  const { toUrlPath: toUrlPathApiAraSaac } = useAraSaac();
  const intl = useIntl();

  const text = customText ? customText : word;

  const borderIn: Border = pictBorderIn
    ? fitzgeraldToBorder(fitzgerald, pictBorderIn)
    : fitzgeraldToBorder(fitzgerald, borderInDefaultSetting);

  const borderOut: Border = pictBorderOut
    ? fitzgeraldToBorder(fitzgerald, pictBorderOut)
    : fitzgeraldToBorder(fitzgerald, borderOutDefaultSetting);

  const pictSize = size?.pictSize ?? 1;
  const printPageRatio = size?.scale ?? 1;
  const font = pictFont ?? fontDefaultSetting;

  const textFontSize = 20 * font.size * printPageRatio * pictSize;

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
              numbered,
              borderOut.size,
              pictSize,
              printPageRatio
            )
          }
        >
          <Typography
            fontSize={textFontSize}
            fontFamily={font.family}
            color={font.color}
            component="h3"
            sx={{ "@media print": { fontSize: 20 * pictSize } }}
          >
            {textPosition !== "top" && numbered && indexSequence + 1}
            {textPosition === "top" && text}
          </Typography>
        </CardContent>
      )}
      <CardContent sx={{ padding: 0, position: "relative" }}>
        <CardMedia
          component="img"
          image={toUrlPathApiAraSaac(selectedId, skin, hair, color)}
          height={150 * pictSize * printPageRatio}
          width={150 * pictSize * printPageRatio}
          alt={intl.formatMessage({ ...messages.pictogram })}
          sx={() => pictogram__media(borderIn, view, pictSize, printPageRatio)}
        />
        {cross && (
          <Box
            sx={{
              backgroundImage: `url(${"img/settings/tachado_rojo.svg"})`,
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
              numbered,
              borderIn.size,
              pictSize,
              printPageRatio
            )
          }
        >
          <Typography
            fontSize={textFontSize}
            fontFamily={font.family}
            color={font.color}
            component="h3"
            sx={{ "@media print": { fontSize: 20 * pictSize } }}
          >
            {textPosition === "bottom" && text}
            {textPosition === "top" && numbered && indexSequence + 1}
          </Typography>
        </CardContent>
      )}
    </Card>
  );
};

export default PictogramCard;
