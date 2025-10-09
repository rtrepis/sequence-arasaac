import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import DefaultSettings from "../../Modals/DefaultSettingsModal/DefaultSettingsModal";
import { FormattedMessage } from "react-intl";
import messages from "./BarNavigation.lang";
import { Box, Stack } from "@mui/material";
import NotPrint from "../utils/NotPrint/NotPrint";
import HideOnScroll from "../utils/HiddenOnScroll/HiddenOnScroll";
import CopyRightSpeedDial from "../CopyRightSpeedDial/CopyRightSpeedDial";
import React from "react";
import ButtonWithFileLoad from "../ButtonWithFileLoad/ButtonWithFileLoad";
import TabsEditView from "../TabsEditView/TabsEditView";
import ButtonWithModalDownload from "../ButtonWithModalDownload/ButtonWithModalDonwload";

interface BarProps {
  children: React.ReactElement;
}

const BarNavigation = ({ children }: BarProps): React.ReactElement => {
  return (
    <>
      <NotPrint>
        <HideOnScroll {...children}>
          <AppBar elevation={1} sx={{ height: "42px" }}>
            <Toolbar
              style={{ minHeight: "50px" }}
              sx={{
                fontSize: "1.75rem",
                justifyContent: "space-between",
                minHeight: "50px",
              }}
            >
              <Stack
                direction={"row"}
                spacing={2}
                alignItems={"center"}
                height={"50px"}
              >
                <Box
                  sx={{
                    display: { xs: "block", sm: "block", md: "block" },
                  }}
                >
                  <img
                    src="/favicon.png"
                    alt="logo"
                    height={25}
                    width={34.16}
                  />
                </Box>
                <Typography
                  variant={"h5"}
                  component="h1"
                  fontWeight={800}
                  sx={{
                    display: { xs: "none", sm: "block", color: "whitesmoke" },
                    lineHeight: 0,
                  }}
                >
                  <FormattedMessage {...messages.title} />
                </Typography>
                <TabsEditView />
              </Stack>

              <Stack direction={"row"} alignItems={"center"}>
                <ButtonWithModalDownload />
                <ButtonWithFileLoad />
                <DefaultSettings />
              </Stack>
            </Toolbar>
          </AppBar>
        </HideOnScroll>
        <Toolbar />
        <CopyRightSpeedDial />
      </NotPrint>
      <Container maxWidth={"xl"}>{children}</Container>
    </>
  );
};

export default BarNavigation;
