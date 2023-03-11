import { Card, CardContent, CardMedia, Typography } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { pictEditModalActionCreator } from "../../app/slice/uiSlice";
import { PictogramI } from "../../types/sequence";
import { PictEditI } from "../../types/ui";

interface PictogramCardProps {
  pictogram: PictogramI;
  view: "complete" | "header" | "footer" | "none";
  variant?: "plane";
}

const PictogramCard = ({
  pictogram: { index, number, border, skin },
  view,
  variant,
}: PictogramCardProps): JSX.Element => {
  const { isOpen } = useAppSelector((state) => state.ui.modal.pictEdit);
  const dispatch = useAppDispatch();

  const openPictEdit: PictEditI = { isOpen: !isOpen, indexPict: index - 1 };
  const handlePictEdit = () =>
    dispatch(pictEditModalActionCreator(openPictEdit));

  return (
    <Card
      data-testid="card-pictogram"
      onClick={handlePictEdit}
      sx={{
        maxWidth: 200,
        textAlign: "center",
        paddingInline: 1.5,
        border: `${border?.out === undefined ? 2 : border.out.size}px solid`,
        borderColor: border?.out?.color,
        borderRadius: `${
          border?.out === undefined ? 20 : border?.out.radius
        }px`,
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
          image={`https://api.arasaac.org/api/pictograms/${number}?${
            skin !== "default" && `skin=${skin === "asian" ? "assian" : skin}` // asia n corrected api arasaac
          }`}
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
            Pictogram Word
          </Typography>
        </CardContent>
      )}
    </Card>
  );
};

export default PictogramCard;
