import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import DefaultSettings from "../../Modals/DefaultSettingsModal/DefaultSettingsModal";
import { FormattedMessage, useIntl } from "react-intl";
import messages from "./BarNavigation.lang";
import { Box, Stack } from "@mui/material";
import NotPrint from "../utils/NotPrint/NotPrint";
import HideOnScroll from "../utils/HiddenOnScroll/HiddenOnScroll";
import CopyRightSpeedDial from "../CopyRightSpeedDial/CopyRightSpeedDial";
import React, { useEffect, useState } from "react";
import TabsEditView from "../TabsEditView/TabsEditView";
import LogoMenu from "../LogoMenu/LogoMenu";
import { useLocation } from "react-router-dom";

interface BarProps {
  children: React.ReactElement;
}

const BarNavigation = ({ children }: BarProps): React.ReactElement => {
  const intl = useIntl();
  const location = useLocation();
  // Anunci per a lectors de pantalla quan canvia la ruta
  const [routeAnnouncement, setRouteAnnouncement] = useState("");

  useEffect(() => {
    const isView = location.pathname.includes("view-sequence");
    const isEdit = location.pathname.includes("create-sequence");

    let pageLabel = "";
    if (isView) {
      pageLabel = intl.formatMessage(messages.view);
    } else if (isEdit) {
      pageLabel = intl.formatMessage(messages.edit);
    }

    if (pageLabel) {
      // Actualitza el títol del document per a lectors de pantalla i barra del navegador
      document.title = `${pageLabel} — SequenciAAC`;
      // Actualitza l'anunci de canvi de ruta
      setRouteAnnouncement(pageLabel);
    }
  }, [location.pathname, intl]);

  return (
    <>
      {/* Regió aria-live per anunciar canvis de ruta als lectors de pantalla */}
      <Box
        aria-live="assertive"
        aria-atomic="true"
        sx={{
          position: "absolute",
          left: -9999,
          width: 1,
          height: 1,
          overflow: "hidden",
        }}
      >
        {routeAnnouncement}
      </Box>
      {/* Primer element focusable: salta al contingut principal */}
      <a href="#main-content" className="skip-link">
        <FormattedMessage {...messages.skipToContent} />
      </a>
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
              {/* Landmark de navegació principal */}
              <Stack
                component="nav"
                aria-label={intl.formatMessage(messages.mainNavigation)}
                direction={"row"}
                spacing={2}
                alignItems={"center"}
                height={"50px"}
              >
                <LogoMenu />
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
                <DefaultSettings />
              </Stack>
            </Toolbar>
          </AppBar>
        </HideOnScroll>
        <Toolbar />
      </NotPrint>
      {/* Contingut principal — destí del skip link */}
      <Container id="main-content" component="main" maxWidth={"xl"}>
        {children}
      </Container>
    </>
  );
};

export default BarNavigation;
