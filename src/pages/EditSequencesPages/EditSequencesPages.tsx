import { Stack } from "@mui/material";
import PictogramAmount from "../../components/PictogramAmount/PictogramAmount";
import MagicSearch from "../../components/MagicSearch/MagicSearch";
import PictEditList from "../../components/PictEditList/PictEditList";
import { useAppSelector } from "../../app/hooks";
import BarNavigation from "../../components/BarNavigation/BarNavigation";

const EditSequencesPages = (): JSX.Element => {
  const sequence = useAppSelector((state) => state.sequence);

  return (
    <BarNavigation title="edit">
      <>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          marginTop={2}
          justifyContent={"space-around"}
        >
          <PictogramAmount />
          <MagicSearch />
        </Stack>
        <PictEditList sequence={sequence} />
      </>
    </BarNavigation>
  );
};

export default EditSequencesPages;
