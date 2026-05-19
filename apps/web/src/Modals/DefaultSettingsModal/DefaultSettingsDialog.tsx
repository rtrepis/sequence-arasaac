import Dialog from "@mui/material/Dialog";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import { Tab, Tabs } from "@mui/material";
import {
  AiOutlineClose,
  AiOutlineUser,
  AiOutlinePicture,
  AiOutlineBook,
} from "react-icons/ai";
import { forwardRef, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import messages from "./DefaultSettingsModal.lang";
import { tabsStyled } from "../../components/TabsEditView/TabsEditView.styled";
import { toggleButtonTypographyStyles } from "../../components/ToggleButtonEditViewPages/ToggleButtonEditViewPages.styled";
import { Container } from "@mui/system";
import DefaultSettingsPanel from "../../components/DefaultsForm/DefaultSettingsPanel";
import UserSettingsPanel from "./UserSettingsPanel";
import VocabularySettingsPanel from "./VocabularySettingsPanel";
import { Stack } from "@mui/material";
import React from "react";

type SettingsTab = "user" | "pictograms" | "vocabulary";

interface DefaultSettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="right" ref={ref} {...props} />;
});

const DefaultSettingsDialog = ({ open, onClose }: DefaultSettingsDialogProps): React.ReactElement => {
  const intl = useIntl();
  const [activeTab, setActiveTab] = useState<SettingsTab>("user");

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      slots={{ transition: Transition }}
    >
      <AppBar
        sx={{ position: { xs: "fixed", md: "relative" }, height: "42px" }}
        elevation={1}
      >
        <Toolbar style={{ minHeight: "50px" }} sx={{ minHeight: "50px" }}>
          <Typography sx={{ ml: 2, mr: 3 }} variant="h6" component="div">
            <FormattedMessage {...messages.settings} />
          </Typography>

          <Tabs
            value={activeTab}
            onChange={(_, value: SettingsTab) => setActiveTab(value)}
            textColor="secondary"
            indicatorColor="secondary"
            sx={{ ...tabsStyled, flex: 1 }}
          >
            <Tab
              value="user"
              icon={<AiOutlineUser />}
              iconPosition="start"
              label={
                <Typography variant="h6" component="span" fontWeight={600} sx={toggleButtonTypographyStyles}>
                  <FormattedMessage {...messages.tabUser} />
                </Typography>
              }
            />
            <Tab
              value="pictograms"
              icon={<AiOutlinePicture />}
              iconPosition="start"
              label={
                <Typography variant="h6" component="span" fontWeight={600} sx={toggleButtonTypographyStyles}>
                  <FormattedMessage {...messages.tabPictograms} />
                </Typography>
              }
            />
            <Tab
              value="vocabulary"
              icon={<AiOutlineBook />}
              iconPosition="start"
              label={
                <Typography variant="h6" component="span" fontWeight={600} sx={toggleButtonTypographyStyles}>
                  <FormattedMessage {...messages.tabVocabulary} />
                </Typography>
              }
            />
          </Tabs>

          <IconButton
            edge="end"
            color="secondary"
            onClick={onClose}
            aria-label={intl.formatMessage({ ...messages.close })}
          >
            <AiOutlineClose />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container sx={{ marginTop: 2 }}>
        <Stack sx={{ height: 40, display: { md: "none" } }} />

        {activeTab === "user" && <UserSettingsPanel />}

        {/* DefaultSettingsPanel sempre muntat per preservar el comportament de desar en tancar */}
        <div style={{ display: activeTab === "pictograms" ? "block" : "none" }}>
          <DefaultSettingsPanel submit={open} />
        </div>

        {activeTab === "vocabulary" && <VocabularySettingsPanel />}
      </Container>
    </Dialog>
  );
};

export default DefaultSettingsDialog;
