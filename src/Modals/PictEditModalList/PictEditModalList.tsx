import { Grid } from "@mui/material";
import { PictSequence, Sequence } from "../../types/sequence";
import PictEditModal from "../PictEditModal/PictEditModal";
import { useState } from "react";
import useNewPictogram from "../../hooks/useNewPictogram";
import React from "react";

interface PictEditModalProps {
  sequence: Sequence;
}

const PictEditModalList = ({
  sequence,
}: PictEditModalProps): React.ReactElement => {
  const { getPictogramEmptyWithDefaultSettings: pictogramEmpty } =
    useNewPictogram();

  const initialCopyPictogram: PictSequence = pictogramEmpty(-1);
  const [copyPictogram, setPictogram] = useState(initialCopyPictogram);

  return (
    <Grid container sx={{ marginBlockStart: 2 }}>
      {sequence.map((pictogram) => (
        <Grid
          item
          xs={false}
          display={"flex"}
          justifyContent={"flex-start"}
          alignItems={"start"}
          key={`pict${pictogram.indexSequence}`}
        >
          <PictEditModal
            pictogram={pictogram}
            copy={
              copyPictogram.indexSequence === -1 ? undefined : copyPictogram
            }
            setCopy={setPictogram}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default PictEditModalList;
