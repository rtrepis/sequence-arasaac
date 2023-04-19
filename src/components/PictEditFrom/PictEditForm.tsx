import { Stack } from "@mui/material";
import PictogramCard from "../PictogramCard/PictogramCard";
import PictogramSearch from "../PictogramSearch/PictogramSearch";
import PictEditSettings from "../PictEditSettings/PictEditSettings";
import { PictSequence } from "../../types/sequence";

interface PictEditFormProps {
  pictogram: PictSequence;
}

const PictEditForm = ({ pictogram }: PictEditFormProps): JSX.Element => {
  return (
    <>
      <Stack
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"start"}
        direction={{ xs: "column", sm: "row" }}
        spacing={{ xs: 3, sm: 2 }}
      >
        <PictogramCard pictogram={pictogram} variant="plane" view="complete" />

        <PictogramSearch indexPict={pictogram.indexSequence} />
      </Stack>

      <PictEditSettings
        indexPict={pictogram.indexSequence}
        pictSequenceSettings={pictogram.settings}
        pictApiAraSettings={pictogram.img.settings}
      />
    </>
  );
};

export default PictEditForm;
