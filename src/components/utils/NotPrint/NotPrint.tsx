import { Stack } from "@mui/material";
import React from "react";

interface PropsNotPrint {
  children: React.ReactElement | React.ReactElement[];
}

const NotPrint = ({ children }: PropsNotPrint): React.ReactElement => {
  return <Stack sx={{ "@media print": { display: "none" } }}>{children}</Stack>;
};

export default NotPrint;
