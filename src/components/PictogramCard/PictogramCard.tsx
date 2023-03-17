import { Card, CardContent, CardMedia, Typography } from "@mui/material";
import { PictogramI } from "../../types/sequence";
import toUrlPathApiAraSaac from "../../utils/toUrlPathApiAraSaac";

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
  return (
    <Card
      data-testid="card-pictogram"
      sx={{
        minWidth: 200,
        maxWidth: 200,
        textAlign: "center",
        paddingInline: 1.5,
        border: `${border?.out === undefined ? 2 : border.out.size}px solid`,
        borderColor: border?.out?.color,
        borderRadius: `${
          border?.out === undefined ? 20 : border?.out.radius
        }px`,
        boxShadow: `${variant === undefined ? "" : "none"}`,
        "&:hover": {
          boxShadow: `${
            variant === undefined ? "0px 0px 10px 3px #A6A6A6" : "none"
          }`,
        },
      }}
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
          alt="Pictogram"
          sx={{
            marginTop: `${view === "complete" ? 0 : 2}`,
            width: 150,
            border: `${border?.in === undefined ? 2 : border?.in.size}px solid`,
            borderColor: border?.in?.color,
            borderRadius: `${
              border?.in === undefined ? 20 : border?.in.radius
            }px`,
          }}
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
