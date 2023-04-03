import { Button } from "@mui/material";
import { styled } from "@mui/system";

const StyledButton = styled(Button)(() => ({
  borderRadius: "20px",
  textTransform: "none",
  fontWeight: "bold",
  maxWidth: "130px",
}));

export default StyledButton;
