import { Tabs } from "@mui/material";
import React from "react";
import { AiOutlineEdit, AiOutlineEye } from "react-icons/ai";
import { Link, useLocation } from "react-router-dom";
import { useIntl } from "react-intl";
import { AppTab, tabsStyled } from "../AppTabs";
import navigationMessages from "@shared/messages/navigation.lang";

const TabsEditView = () => {
  const intl = useIntl();
  const { pathname } = useLocation();
  // El tab actiu es deriva de la ruta, no d'estat local: si es recarrega la
  // pàgina de visualització, el tab marcat ha de ser el de visualització
  const value = pathname.includes("view-sequence") ? "view" : "edit";

  return (
    <Tabs value={value} sx={tabsStyled}>
      <AppTab
        value="edit"
        label={intl.formatMessage(navigationMessages.edit)}
        icon={<AiOutlineEdit />}
        component={Link}
        to={"create-sequence"}
      />

      <AppTab
        value="view"
        label={intl.formatMessage(navigationMessages.view)}
        icon={<AiOutlineEye />}
        component={Link}
        to={"view-sequence"}
      />
    </Tabs>
  );
};

export default TabsEditView;
