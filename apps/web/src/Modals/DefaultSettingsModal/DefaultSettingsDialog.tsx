import Dialog from "@mui/material/Dialog";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import { Tabs } from "@mui/material";
import {
  AiOutlineClose,
  AiOutlineUser,
  AiOutlinePicture,
  AiOutlineBook,
} from "react-icons/ai";
import { MdGridView } from "react-icons/md";
import { forwardRef, useRef } from "react";
import { FormattedMessage, MessageDescriptor, useIntl } from "react-intl";
import messages from "./DefaultSettingsModal.lang";
import { AppTab, APP_TAB_LABEL_BREAKPOINT, tabsStyled } from "../../components/AppTabs";
import { Container } from "@mui/system";
import DefaultSettingsPanel, { DefaultSettingsPanelHandle } from "../../components/DefaultsForm/DefaultSettingsPanel";
import UserSettingsPanel from "./UserSettingsPanel";
import ViewSettingsPanel from "./ViewSettingsPanel";
import VocabularySettingsPanel from "./VocabularySettingsPanel";
import { Stack } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useSaveUiSettings } from "../../features/backend/user-settings/hooks/useSaveUiSettings";
import SettingsSaveErrorDialog from "./SettingsSaveErrorDialog";
import React from "react";

import { SettingsTab } from "../../types/ui";
import { updateSettingsActiveTabActionCreator } from "@features/user-settings/store/uiSlice";

interface DefaultSettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

interface SettingsTabDefinition {
  value: SettingsTab;
  icon: React.ReactElement;
  message: MessageDescriptor;
}

/** Tabs del modal de configuracions, en ordre de presentació. */
const SETTINGS_TABS: SettingsTabDefinition[] = [
  { value: "user", icon: <AiOutlineUser />, message: messages.tabUser },
  { value: "pictograms", icon: <AiOutlinePicture />, message: messages.tabPictograms },
  { value: "view", icon: <MdGridView />, message: messages.tabView },
  { value: "vocabulary", icon: <AiOutlineBook />, message: messages.tabVocabulary },
];

const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="right" ref={ref} {...props} />;
});

const DefaultSettingsDialog = ({ open, onClose }: DefaultSettingsDialogProps): React.ReactElement => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector((state) => state.ui.settingsActiveTab);
  const { saveInBackground, retry, failure, isRetrying, dismissError } =
    useSaveUiSettings();

  const handleTabChange = (_: React.SyntheticEvent, value: SettingsTab) => {
    dispatch(updateSettingsActiveTabActionCreator(value));
  };
  const pictPanelRef = useRef<DefaultSettingsPanelHandle>(null);
  const viewPanelRef = useRef<DefaultSettingsPanelHandle>(null);

  const handleClose = () => {
    // Sincronitza l'estat local dels formularis al Redux (dispatch síncron)
    pictPanelRef.current?.syncToRedux();
    viewPanelRef.current?.syncToRedux();
    // El modal es tanca a l'instant: el que l'usuari veu ja surt de Redux i no depèn
    // de la xarxa. Amb el servidor de Render adormit, esperar el desat aquí deixava
    // la creu sense resposta fins a mig minut, sense cap explicació.
    onClose();
    // Una sola crida amb tota la configuració de l'usuari, ja en segon pla
    saveInBackground();
  };

  return (
    <>
      <Dialog
      fullScreen
      open={open}
      onClose={handleClose}
      aria-label={intl.formatMessage(messages.settings)}
      slots={{ transition: Transition }}
    >
      <AppBar
        sx={{ position: { xs: "fixed", md: "relative" }, height: "42px" }}
        elevation={1}
      >
        <Toolbar style={{ minHeight: "50px" }} sx={{ minHeight: "50px" }}>
          {/* En mòbil el títol cedeix l'amplada als tabs; el nom del diàleg
              es manté a l'aria-label i el del tab actiu, al propi tab seleccionat */}
          <Typography
            sx={{
              ml: 2,
              mr: 3,
              display: { xs: "none", [APP_TAB_LABEL_BREAKPOINT]: "block" },
            }}
            variant="h6"
            component="div"
            fontWeight={800}
          >
            <FormattedMessage {...messages.settings} />
          </Typography>

          {/* Scrollable perquè en mòbil el tab seleccionat amb text no desbordi la barra */}
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ ...tabsStyled, flex: 1 }}
          >
            {SETTINGS_TABS.map(({ value, icon, message }) => (
              <AppTab
                key={value}
                value={value}
                icon={icon}
                label={intl.formatMessage(message)}
              />
            ))}
          </Tabs>

          <IconButton
            edge="end"
            color="inherit"
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

      {/* Fora del Dialog: MUI desmunta els fills en tancar-lo, i aquest avís neix
          justament quan el modal ja s'ha tancat. Viu aquí i no al pare perquè els dos
          punts de muntatge (engranatge de la barra i menú lateral) el comparteixin. */}
      <SettingsSaveErrorDialog
        failure={failure}
        isRetrying={isRetrying}
        onRetry={retry}
        onDismiss={dismissError}
      />
    </>
  );
};

export default DefaultSettingsDialog;
