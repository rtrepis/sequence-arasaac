import { Stack } from "@mui/material";

interface PropsNotPrint {
  children: JSX.Element | JSX.Element[];
}

const NotPrint = ({ children }: PropsNotPrint): JSX.Element => {
  return <Stack sx={{ "@media print": { display: "none" } }}>{children}</Stack>;
};

export default NotPrint;
