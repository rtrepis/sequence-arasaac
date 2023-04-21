import { Grid } from "@mui/material";
import { Sequence } from "../../types/sequence";
import PictEditModal from "../PictEditModal/PictEditModal";

interface PictEditModalProps {
  sequence: Sequence;
}

const PictEditModalList = ({ sequence }: PictEditModalProps): JSX.Element => {
  return (
    <Grid container sx={{ marginBlockStart: 2 }}>
      {sequence.map((pictogram, index) => (
        <Grid
          item
          xs={false}
          display={"flex"}
          justifyContent={"flex-start"}
          alignItems={"start"}
          key={`pict${pictogram.indexSequence}`}
        >
          <PictEditModal pictogram={pictogram} />
        </Grid>
      ))}
    </Grid>
  );
};

export default PictEditModalList;
