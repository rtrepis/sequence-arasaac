import { Card, CardContent, CardMedia, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import useAraSaac from "../../hooks/useAraSaac";
import { PictSequence } from "../../types/sequence";
import { pictogram__card, pictogram__media } from "./PictogramCard.styled";
import messages from "./PictogramCart.lang";

interface PictogramCardProps {
  pictogram: PictSequence;
  view: "complete" | "header" | "footer" | "none";
  variant?: "plane";
}

const PictogramCard = ({
  pictogram: {
    indexSequence,
    img: {
      selectedId,
      settings: { skin },
      searched: { word },
    },
    settings: { border },
  },
  view,
  variant,
}: PictogramCardProps): JSX.Element => {
  const { toUrlPath: toUrlPathApiAraSaac } = useAraSaac();
  const intl = useIntl();

  return (
    <Card
      data-testid="card-pictogram"
      sx={() => pictogram__card(border, variant)}
    >
      {(view === "complete" || view === "header") && (
        <CardContent>
          <Typography variant="body1" component="h3">
            {indexSequence + 1}
          </Typography>
        </CardContent>
      )}
      <CardContent
        sx={{ display: "flex", padding: 0, justifyContent: "center" }}
      >
        <CardMedia
          component="img"
          image={toUrlPathApiAraSaac(selectedId, skin)}
          height={150}
          width={150}
          alt={intl.formatMessage({ ...messages.pictogram })}
          sx={() => pictogram__media(border, view)}
        />
      </CardContent>

      {(view === "complete" || view === "footer") && (
        <CardContent>
          <Typography variant="body1" component="h3">
            {word}
          </Typography>
        </CardContent>
      )}
    </Card>
  );
};

export default PictogramCard;
