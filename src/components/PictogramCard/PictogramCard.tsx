import { Card, CardContent, CardMedia, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import { useAppSelector } from "../../app/hooks";
import useAraSaac from "../../hooks/useAraSaac";
import { Border, PictSequence } from "../../types/sequence";
import { pictogram__card, pictogram__media } from "./PictogramCard.styled";
import messages from "./PictogramCart.lang";

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
      searched: { word: text },
    },
    settings: {
      textPosition,
      fontSize,
      borderIn: pictBorderIn,
      borderOut: pictBorderOut,
    },
  },
  view,
  variant,
  size,
}: PictogramCardProps): JSX.Element => {
  const {
    borderIn: {
      color: defaultSettingsBorderInColor,
      radius: defaultSettingsBorderInRadius,
      size: defaultSettingsBorderInSize,
    },
    borderOut: {
      color: defaultSettingsBorderOutColor,
      radius: defaultSettingsBorderOutRadius,
      size: defaultSettingsBorderOutSize,
    },
    numbered,
  } = useAppSelector((state) => state.ui.defaultSettings.pictSequence);
  const { toUrlPath: toUrlPathApiAraSaac } = useAraSaac();
  const intl = useIntl();

  const colorInFitzgerald = fitzgerald ? fitzgerald : "#067c3d";
  const colorOutFitzgerald = fitzgerald ? fitzgerald : "#999999";

  const colorBorderIn =
    defaultSettingsBorderInColor === "fitzgerald"
      ? colorInFitzgerald
      : defaultSettingsBorderInColor;
  const colorBorderOut =
    defaultSettingsBorderOutColor === "fitzgerald"
      ? colorOutFitzgerald
      : defaultSettingsBorderOutColor;

  const borderIn: Border = pictBorderIn
    ? pictBorderIn
    : {
        color: colorBorderIn,
        size: defaultSettingsBorderInSize,
        radius: defaultSettingsBorderInRadius,
      };

  const borderOut: Border = pictBorderOut
    ? pictBorderOut
    : {
        color: colorBorderOut,
        size: defaultSettingsBorderOutSize,
        radius: defaultSettingsBorderOutRadius,
      };

  const textFontSize = size ? size * 20 * fontSize! : 20 * fontSize!;

  return (
    <Card
      data-testid="card-pictogram"
      sx={() => pictogram__card(borderOut, variant)}
    >
      {(view === "complete" || view === "header") && (
        <CardContent
          sx={{
            ":first-of-type": {
              paddingBlock:
                textPosition !== "top" && !numbered && borderOut.size === 0
                  ? 0
                  : 1,
            },
          }}
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
          sx={{
            width: size ? size * 150 : 150,
            paddingInline: 0,
            ":last-child": {
              paddingBlock:
                textPosition !== "bottom" && !numbered && borderOut!.size === 0
                  ? 0
                  : 1,
            },
          }}
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
