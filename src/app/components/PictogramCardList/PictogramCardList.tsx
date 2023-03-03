import { Grid } from "@mui/material";
import { SequenceI } from "../../types/sequence";
import PictogramCard from "../PictogramCard/PictogramCard";

interface PictogramShowListProps {
  sequence: SequenceI;
}

const PictogramCardList = ({
  sequence,
}: PictogramShowListProps): JSX.Element => {
  return (
    <Grid
      container
      spacing={2}
      rowSpacing={1}
      alignContent={"center"}
      sx={{ margin: 2 }}
    >
      {sequence.map(({ index }) => (
        <Grid
          item
          xs={false}
          display={"flex"}
          justifyContent={"flex-start"}
          alignItems={"center"}
          key={`pict${index}`}
        >
          <PictogramCard index={index} view={"complete"} />
        </Grid>
      ))}
    </Grid>
  );
};

export default PictogramCardList;
