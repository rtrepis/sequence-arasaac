import { Card, CardContent, CardMedia, Typography } from "@mui/material";
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
  size?: number;
}

const PictogramCard = ({
  pictogram: {
    indexSequence,
    img: {
      selectedId,
      settings: { skin, fitzgerald, hair },
      searched: { word },
    },
    settings: {
      textPosition,
      fontSize,
      borderIn: pictBorderIn,
      borderOut: pictBorderOut,
    },
    text: customText,
  },
  view,
  variant,
  size,
}: PictogramCardProps): JSX.Element => {
  const {
    borderIn: borderInDefaultSetting,
    borderOut: borderOutDefaultSetting,
    numbered,
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

  const textFontSize = size ? size * 20 * fontSize! : 20 * fontSize!;

  return (
    <Card
      data-testid="card-pictogram"
      sx={() => pictogram__card(borderOut, variant)}
    >
      {(view === "complete" || view === "header") && (
        <CardContent
          sx={() => textContent(size, textPosition, numbered, borderOut.size)}
        >
          <Typography fontSize={textFontSize} component="h3">
            {textPosition !== "top" && numbered && indexSequence + 1}
            {textPosition === "top" && text}
          </Typography>
        </CardContent>
      )}
      <CardContent sx={{ padding: 0 }}>
        <CardMedia
          component="img"
          image={toUrlPathApiAraSaac(selectedId, skin, hair)}
          height={size ? size * 150 : 150}
          width={size ? size * 150 : 150}
          alt={intl.formatMessage({ ...messages.pictogram })}
          sx={() => pictogram__media(borderIn, view)}
        />
      </CardContent>

      {(view === "complete" || view === "footer") && (
        <CardContent
          sx={() => textContent(size, textPosition, numbered, borderIn.size)}
        >
          <Typography fontSize={textFontSize} component="h3">
            {textPosition === "bottom" && text}
            {textPosition === "top" && numbered && indexSequence + 1}
          </Typography>
        </CardContent>
      )}
    </Card>
  );
};

export default PictogramCard;
