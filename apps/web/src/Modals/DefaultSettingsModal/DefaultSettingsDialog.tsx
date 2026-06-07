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
import { MdGridView } from "react-icons/md";
import { forwardRef, useRef } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import messages from "./DefaultSettingsModal.lang";
import { tabsStyled } from "../../components/TabsEditView/TabsEditView.styled";
import { toggleButtonTypographyStyles } from "../../components/ToggleButtonEditViewPages/ToggleButtonEditViewPages.styled";
import { Container } from "@mui/system";
import DefaultSettingsPanel, { DefaultSettingsPanelHandle } from "../../components/DefaultsForm/DefaultSettingsPanel";
import UserSettingsPanel from "./UserSettingsPanel";
import ViewSettingsPanel from "./ViewSettingsPanel";
import VocabularySettingsPanel from "./VocabularySettingsPanel";
import { Stack } from "@mui/material";
import { useAppDispatch } from "../../app/hooks";
import { saveUserUiThunk } from "../../features/backend/user-settings/store/settingsThunks";
import { useFeedback } from "../../context/FeedbackContext/FeedbackContext";
import messagesUser from "./UserSettingsPanel.lang";
import React from "react";

import { SettingsTab } from "../../types/ui";
import { updateSettingsActiveTabActionCreator } from "@features/user-settings/store/uiSlice";

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
  const dispatch = useAppDispatch();
  const { showSnackbar } = useFeedback();
  const activeTab = useAppSelector((state) => state.ui.settingsActiveTab);

  const handleTabChange = (_: React.SyntheticEvent, value: SettingsTab) => {
    dispatch(updateSettingsActiveTabActionCreator(value));
  };
  const pictPanelRef = useRef<DefaultSettingsPanelHandle>(null);
  const viewPanelRef = useRef<DefaultSettingsPanelHandle>(null);

  const handleClose = async () => {
    // Sincronitza l'estat local dels formularis al Redux (dispatch síncron)
    pictPanelRef.current?.syncToRedux();
    viewPanelRef.current?.syncToRedux();
    // Una sola crida amb tota la configuració de l'usuari
    const result = await dispatch(saveUserUiThunk());
    if (saveUserUiThunk.fulfilled.match(result)) {
      showSnackbar({ message: intl.formatMessage(messagesUser.saveSuccess), severity: "success" });
    } else {
      showSnackbar({ message: intl.formatMessage(messagesUser.saveError), severity: "error" });
    }
    onClose();
  };

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={handleClose}
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
            onChange={handleTabChange}
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
              value="view"
              icon={<MdGridView />}
              iconPosition="start"
              label={
                <Typography variant="h6" component="span" fontWeight={600} sx={toggleButtonTypographyStyles}>
                  <FormattedMessage {...messages.tabView} />
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
            onClick={handleClose}
            aria-label={intl.formatMessage({ ...messages.close })}
          >
            <AiOutlineClose />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container sx={{ marginTop: 2 }}>
        <Stack sx={{ height: 40, display: { md: "none" } }} />

        {activeTab === "user" && <UserSettingsPanel />}

        <div style={{ display: activeTab === "pictograms" ? "block" : "none" }}>
          <DefaultSettingsPanel ref={pictPanelRef} />
        </div>

        {activeTab === "view" && <ViewSettingsPanel ref={viewPanelRef} />}

        {activeTab === "vocabulary" && <VocabularySettingsPanel />}
      </Container>
    </Dialog>
  );
};

export default DefaultSettingsDialog;
