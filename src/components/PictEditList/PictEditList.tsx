import { Grid } from "@mui/material";
import { Sequence } from "../../types/sequence";
import PictEdit from "../PictEdit/PictEdit";

interface PictEditModalProps {
  sequence: Sequence;
}

const PictEditList = ({ sequence }: PictEditModalProps): JSX.Element => {
  return (
    <Grid container sx={{ marginBlockStart: 2 }}>
      {sequence.map((pictogram, index) => (
        <Grid
          item
          xs={false}
          display={"flex"}
          justifyContent={"flex-start"}
          alignItems={"center"}
          key={`pict${pictogram.indexSequence}`}
        >
          <PictEdit pictogram={pictogram} />
        </Grid>
      ))}
    </Grid>
  );
};

export default PictEditList;
