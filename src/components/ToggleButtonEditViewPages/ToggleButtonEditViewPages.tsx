import { IconButton } from "@mui/material";
import { AiOutlineEdit, AiOutlineEye } from "react-icons/ai";
import { Link } from "react-router-dom";
import React from "react";

interface ToggleButtonEditViewPagesProps {
  pageTitle: "edit" | "view";
}

const ToggleButtonEditViewPages = ({
  pageTitle,
}: ToggleButtonEditViewPagesProps): React.ReactElement => {
  return (
    <>
      {pageTitle === "edit" && (
        <Link to={"../view-sequence"}>
          <IconButton aria-label={"view"} color="secondary">
            <AiOutlineEye />
          </IconButton>
        </Link>
      )}

      {pageTitle === "view" && (
        <Link to={"../create-sequence"}>
          <IconButton aria-label={"edit"} color="secondary">
            <AiOutlineEdit />
          </IconButton>
        </Link>
      )}
    </>
  );
};

export default ToggleButtonEditViewPages;
