import { Stack } from "@mui/material";
import PictogramAmount from "../../components/PictogramAmount/PictogramAmount";
import MagicSearch from "../../components/MagicSearch/MagicSearch";
import { useAppSelector } from "../../app/hooks";
import BarNavigation from "../../components/BarNavigation/BarNavigation";
import PictEditModalList from "../../Modals/PictEditModalList/PictEditModalList";

const EditSequencesPage = (): JSX.Element => {
  const sequence = useAppSelector((state) => state.sequence);

  return (
    <BarNavigation title="edit">
      <>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent={"space-around"}
        >
          <PictogramAmount />
          <MagicSearch />
        </Stack>
        <PictEditModalList sequence={sequence} />
      </>
    </BarNavigation>
  );
};

export default EditSequencesPage;
