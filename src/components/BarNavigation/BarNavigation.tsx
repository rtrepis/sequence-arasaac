import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import DefaultSettings from "../../Modals/DefaultSettingsModal/DefaultSettingsModal";
import { FormattedMessage } from "react-intl";
import messages from "./BarNavigation.lang";
import { Box, Stack } from "@mui/material";
import NotPrint from "../utils/NotPrint/NotPrint";
import ToggleButtonEditViewPages from "../ToggleButtonEditViewPages/ToggleButtonEditViewPages";
import PictogramAmount from "../PictogramAmount/PictogramAmount";
import MagicSearch from "../MagicSearch/MagicSearch";
import HideOnScroll from "../utils/HiddenOnScroll/HiddenOnScroll";
import CopyRightSpeedDial from "../CopyRightSpeedDial/CopyRightSpeedDial";

interface BarProps {
  children: React.ReactElement;
  title?: "view" | "edit" | "welcome";
}

const BarNavigation = ({ children, title }: BarProps): JSX.Element => {
  return (
    <>
      <NotPrint>
        <HideOnScroll {...children}>
          <AppBar elevation={1}>
            <Toolbar
              sx={{
                fontSize: "1.75rem",
                justifyContent: "space-between",
              }}
            >
              <Stack direction={"row"} spacing={2}>
                <Box
                  sx={{
                    display: { xs: "block", sm: "block", md: "block" },
                  }}
                >
                  <img
                    src="../favicon.png"
                    alt="logo"
                    height={25}
                    width={34.16}
                  />
                </Box>
                <Typography
                  variant={"h5"}
                  component="h1"
                  fontWeight={800}
                  sx={{ display: { xs: "none", sm: "block", color: "white" } }}
                >
                  <FormattedMessage {...messages.title} />
                </Typography>
              </Stack>

              {title !== "welcome" && (
                <>
                  <Typography
                    variant={"h6"}
                    component="h2"
                    sx={{ color: "white" }}
                  >
                    {title && <FormattedMessage {...messages[title]} />}
                  </Typography>
                  <Stack direction={"row"}>
                    {title && <ToggleButtonEditViewPages pageTitle={title} />}
                    {!title && (
                      <Stack
                        display={{ xs: "none", lg: "flex" }}
                        direction={"row"}
                      >
                        <PictogramAmount variant="navBar" />
                        <MagicSearch variant="navBar" />
                      </Stack>
                    )}
                    <DefaultSettings />
                  </Stack>
                </>
              )}
            </Toolbar>
          </AppBar>
        </HideOnScroll>
        <Toolbar />
        <CopyRightSpeedDial />
      </NotPrint>
      <Container maxWidth={"xl"} sx={{ marginTop: 2 }}>
        {children}
      </Container>
    </>
  );
};

export default BarNavigation;
