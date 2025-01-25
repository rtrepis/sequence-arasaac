import { ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { AiOutlineEdit, AiOutlineEye } from "react-icons/ai";
import { Link } from "react-router-dom";
import React from "react";
import {
  toggleButtonGroupStyles,
  toggleButtonTypographyStyles,
} from "./ToggleButtonEditViewPages.styled";

interface ToggleButtonEditViewPagesProps {
  pageTitle: "edit" | "view";
}

const ToggleButtonEditViewPages = ({
  pageTitle,
}: ToggleButtonEditViewPagesProps): React.ReactElement => {
  return (
    <ToggleButtonGroup
      value={pageTitle}
      exclusive
      aria-label="Toggle view/edit"
      sx={toggleButtonGroupStyles}
    >
      <ToggleButton value="edit" aria-label="edit" sx={{ paddingBlock: 0 }}>
        <Link
          to="../create-sequence"
          style={{ color: "inherit", textDecoration: "none" }}
        >
          <Typography
            variant={"h6"}
            component="h2"
            fontWeight={600}
            sx={toggleButtonTypographyStyles}
          >
            <AiOutlineEdit />
            Edit
          </Typography>
        </Link>
      </ToggleButton>
      <ToggleButton value="view" aria-label="view" sx={{ paddingBlock: 0 }}>
        <Link
          to="../view-sequence"
          style={{ color: "inherit", textDecoration: "none" }}
        >
          <Typography
            variant={"h6"}
            component="h2"
            fontWeight={600}
            sx={toggleButtonTypographyStyles}
          >
            View
            <AiOutlineEye />
          </Typography>
        </Link>
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export default ToggleButtonEditViewPages;
