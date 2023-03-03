import { Card, CardContent, CardMedia, Typography } from "@mui/material";
import { BorderPictI } from "../../types/sequence";

interface PictogramCardProps {
  index: number;
  view: "complete" | "header" | "footer" | "none";
  borderIn?: BorderPictI;
  borderOut?: BorderPictI;
  variant?: "plane";
}

const PictogramCard = ({
  index,
  view,
  borderIn,
  borderOut,
  variant,
}: PictogramCardProps): JSX.Element => {
  return (
    <Card
      data-testid="card-pictogram"
      sx={{
        maxWidth: 200,
        textAlign: "center",
        paddingInline: 1.5,
        border: `${borderOut === undefined ? 2 : borderOut.size}px solid`,
        borderColor: "primary.main",
        borderRadius: `${borderOut === undefined ? 20 : borderOut.radius}px`,
        boxShadow: `${variant === undefined ? "" : "0px 0px 0px 0px #fff"}`,
        "&:hover": {
          boxShadow: "0px 0px 10px 3px #A6A6A6",
        },
      }}
    >
      {(view === "complete" || view === "header") && (
        <CardContent>
          <Typography variant="body1" component="h3">
            {index}
          </Typography>
        </CardContent>
      )}
      <CardContent
        sx={{ display: "flex", padding: 0, justifyContent: "center" }}
      >
        <CardMedia
          component="img"
          image={`https://api.arasaac.org/api/pictograms/2484`}
          alt="Pictogram"
          sx={{
            marginTop: `${view === "complete" ? 0 : 2}`,
            width: 150,
            border: `${borderIn === undefined ? 2 : borderIn.size}px solid`,
            borderColor: "primary.main",
            borderRadius: `${borderIn === undefined ? 20 : borderIn.radius}px`,
          }}
        />
      </CardContent>

      {(view === "complete" || view === "footer") && (
        <CardContent>
          <Typography variant="body1" component="h3">
            Pictogram Word
          </Typography>
        </CardContent>
      )}
    </Card>
  );
};

export default PictogramCard;
