import { Button } from "@mui/material";
import { AiOutlineEdit, AiOutlineEye } from "react-icons/ai";
import { Link } from "react-router-dom";

interface ToggleButtonEditViewPagesProps {
  pageTitle: "edit" | "view";
}

const ToggleButtonEditViewPages = ({
  pageTitle,
}: ToggleButtonEditViewPagesProps): JSX.Element => {
  return (
    <>
      {pageTitle === "edit" && (
        <Link to={"../view-sequence"}>
          <Button
            aria-label={"view"}
            variant="text"
            color="secondary"
            sx={{ fontSize: "2rem" }}
          >
            <AiOutlineEye />
          </Button>
        </Link>
      )}
      {pageTitle === "view" && (
        <Link to={"../create-sequence"}>
          <Button
            aria-label={"edit"}
            variant="text"
            color="secondary"
            sx={{ fontSize: "2rem" }}
          >
            <AiOutlineEdit />
          </Button>
        </Link>
      )}
    </>
  );
};

export default ToggleButtonEditViewPages;
