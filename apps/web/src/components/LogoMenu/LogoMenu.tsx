import React, { useState } from "react";
import { IconButton } from "@mui/material";
import { useIntl } from "react-intl";
import messages from "./LogoMenu.lang";
import AppNavigationDrawer from "../AppNavigationDrawer/AppNavigationDrawer";

// Botó de logotip que obre el drawer de navegació principal
const LogoMenu = (): React.ReactElement => {
  const intl = useIntl();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <IconButton
        onClick={() => setDrawerOpen(true)}
        aria-label={intl.formatMessage(messages.menuAriaLabel)}
        aria-haspopup="true"
        sx={{ padding: 0 }}
      >
        <img src="/favicon.png" alt="logo" height={25} width={34.16} />
      </IconButton>

      <AppNavigationDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
};

export default LogoMenu;
