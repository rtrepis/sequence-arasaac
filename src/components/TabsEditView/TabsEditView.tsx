import { Tabs, Tab, Typography } from "@mui/material";
import React, { useState } from "react";
import { AiOutlineEdit, AiOutlineEye } from "react-icons/ai";
import { Link } from "react-router-dom";
import { toggleButtonTypographyStyles } from "../ToggleButtonEditViewPages/ToggleButtonEditViewPages.styled";
import { tabsStyled } from "./TabsEditView.styled";
import { FormattedMessage } from "react-intl";
import messages from "./TabsEditView.lang";

const TabsEditView = () => {
  const [value, setValue] = useState<string>("edit");

  return (
    <Tabs
      value={value}
      textColor="secondary"
      indicatorColor="secondary"
      onChange={(_, value) => setValue(value)}
      sx={tabsStyled}
    >
      <Tab
        value="edit"
        label={
          <Typography
            variant={"h6"}
            component="h2"
            fontWeight={600}
            sx={toggleButtonTypographyStyles}
          >
            <FormattedMessage {...messages.edit} />
          </Typography>
        }
        icon={<AiOutlineEdit />}
        iconPosition="start"
        component={Link}
        to={"create-sequence"}
      />

      <Tab
        value="view"
        label={
          <Typography
            variant={"h6"}
            component="h2"
            fontWeight={600}
            sx={toggleButtonTypographyStyles}
          >
            <FormattedMessage {...messages.view} />
          </Typography>
        }
        icon={<AiOutlineEye />}
        iconPosition="start"
        component={Link}
        to={"view-sequence"}
      />
    </Tabs>
  );
};

export default TabsEditView;
