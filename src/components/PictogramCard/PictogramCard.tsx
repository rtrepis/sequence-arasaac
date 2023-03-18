import { Card, CardContent, CardMedia, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import { PictogramI } from "../../types/sequence";
import toUrlPathApiAraSaac from "../../utils/toUrlPathApiAraSaac";
import { pictogram__card, pictogram__media } from "./PictogramCard.styled";
import messages from "./PictogramCart.lang";

interface PictogramCardProps {
  pictogram: PictogramI;
  view: "complete" | "header" | "footer" | "none";
  variant?: "plane";
}

const PictogramCard = ({
  pictogram: { index, number, border, skin, word },
  view,
  variant,
}: PictogramCardProps): JSX.Element => {
  const intl = useIntl();

  return (
    <Card
      data-testid="card-pictogram"
      sx={() => pictogram__card(border, variant)}
    >
      {(view === "complete" || view === "header") && (
        <CardContent>
          <Typography variant="body1" component="h3">
            {index + 1}
          </Typography>
        </CardContent>
      )}
      <CardContent
        sx={{ display: "flex", padding: 0, justifyContent: "center" }}
      >
        <CardMedia
          component="img"
          image={toUrlPathApiAraSaac(number, skin)}
          alt={intl.formatMessage({ ...messages.pictogram })}
          sx={() => pictogram__media(border, view)}
        />
      </CardContent>

      {(view === "complete" || view === "footer") && (
        <CardContent>
          <Typography variant="body1" component="h3">
            {word.keyWord}
          </Typography>
        </CardContent>
      )}
    </Card>
  );
};

export default PictogramCard;
