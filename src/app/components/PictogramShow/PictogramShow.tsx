import { Card, CardContent, CardMedia, Typography } from "@mui/material";
import { borderPict } from "../../types/pictograms";

interface PictogramShowProps {
  index: number;
  view: "complete" | "header" | "footer" | "none";
  borderIn?: borderPict;
  borderOut?: borderPict;
  variant?: "plane";
}

const PictogramShow = ({
  index,
  view,
  borderIn,
  borderOut,
  variant,
}: PictogramShowProps): JSX.Element => {
  return (
    <Card
      data-testid="card-pictogram"
      sx={{
        maxWidth: 225,
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
        <CardContent sx={{ paddingBlock: 1 }}>
          <Typography variant="body1" component="h3">
            {index}
          </Typography>
        </CardContent>
      )}

      <CardMedia
        component="img"
        image={`https://api.arasaac.org/api/pictograms/2484`}
        alt="Pictogram"
        sx={{
          marginTop: `${view === "complete" ? 0 : 2}`,
          height: 175,
          border: `${borderIn === undefined ? 2 : borderIn.size}px solid`,
          borderColor: "primary.main",
          borderRadius: `${borderIn === undefined ? 20 : borderIn.radius}px`,
        }}
      />

      {(view === "complete" || view === "footer") && (
        <CardContent sx={{ paddingBlock: 1 }}>
          <Typography variant="body1" component="h3">
            Pictogram Word
          </Typography>
        </CardContent>
      )}
    </Card>
  );
};

export default PictogramShow;
