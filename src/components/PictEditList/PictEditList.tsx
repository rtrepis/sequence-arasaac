import { Grid } from "@mui/material";
import { SequenceI } from "../../types/sequence";
import PictEdit from "../PictEdit/PictEdit";

interface PictEditModalProps {
  sequence: SequenceI;
}

const PictEditList = ({ sequence }: PictEditModalProps): JSX.Element => {
  return (
    <Grid
      container
      spacing={2}
      rowSpacing={1}
      alignContent={"center"}
      sx={{ marginBlockStart: 2 }}
    >
      {sequence.map((pictogram, index) => (
        <Grid
          item
          xs={false}
          display={"flex"}
          justifyContent={"flex-start"}
          alignItems={"center"}
          key={`pict${pictogram.index}`}
        >
          <PictEdit pictogram={pictogram} />
        </Grid>
      ))}
    </Grid>
  );
};

export default PictEditList;
