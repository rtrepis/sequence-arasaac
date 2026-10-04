import { AiOutlineUser, AiOutlinePicture, AiOutlineBook } from "react-icons/ai";
import { MdGridView } from "react-icons/md";
import { useEffect, useRef } from "react";
import { MessageDescriptor, useIntl } from "react-intl";
import { Container } from "@mui/system";
import React from "react";
import messages from "./SettingsDialog.lang";
import {
  AppFullScreenDialog,
  AppFullScreenDialogTab,
} from "@components/AppFullScreenDialog";
import { SETTINGS_CONTENT_TOP_GAP } from "@components/SettingsLayout";
import DefaultSettingsPanel, {
  DefaultSettingsPanelHandle,
} from "./panels/DefaultSettingsPanel/DefaultSettingsPanel";
import UserSettingsPanel from "./panels/UserSettingsPanel/UserSettingsPanel";
import ViewSettingsPanel from "./panels/ViewSettingsPanel/ViewSettingsPanel";
import VocabularySettingsPanel from "./panels/VocabularySettingsPanel/VocabularySettingsPanel";
import { useAppDispatch, useAppSelector } from "@app/hooks";
import { useSaveUiSettings } from "@features/backend/user-settings/hooks/useSaveUiSettings";
import SettingsSaveErrorDialog from "@features/backend/user-settings/components/SettingsSaveErrorDialog";
import { SettingsTab } from "@/types/ui";
import { updateSettingsActiveTabActionCreator } from "@features/user-settings/store/uiSlice";
import { settingsDialogOpenChangedActionCreator } from "@features/sequence/store/styleSlice";
import { ACCOUNTS_ENABLED } from "@/configs/accountsConfig";

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

interface SettingsTabDefinition {
  value: SettingsTab;
  icon: React.ReactElement;
  message: MessageDescriptor;
}

/** Tabs del diàleg de configuració, en ordre de presentació. */
const SETTINGS_TABS: SettingsTabDefinition[] = [
  { value: "user", icon: <AiOutlineUser />, message: messages.tabUser },
  {
    value: "pictograms",
    icon: <AiOutlinePicture />,
    message: messages.tabPictograms,
  },
  { value: "view", icon: <MdGridView />, message: messages.tabView },
  {
    value: "vocabulary",
    icon: <AiOutlineBook />,
    message: messages.tabVocabulary,
  },
];

/**
 * Els tabs que es pinten de debò.
 *
 * El vocabulari personal viu al compte —s'hi desa i se sincronitza entre
 * dispositius—, de manera que amb les funcions de compte apagades el tab només
 * podria oferir la porta d'entrada a un compte que aquella compilació no té.
 */
const VISIBLE_SETTINGS_TABS: SettingsTabDefinition[] = ACCOUNTS_ENABLED
  ? SETTINGS_TABS
  : SETTINGS_TABS.filter(({ value }) => value !== "vocabulary");

const SettingsDialog = ({
  open,
  onClose,
}: SettingsDialogProps): React.ReactElement => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector((state) => state.ui.settingsActiveTab);
  const { saveInBackground, retry, failure, isRetrying, dismissError } =
    useSaveUiSettings();

  const pictPanelRef = useRef<DefaultSettingsPanelHandle>(null);
  const viewPanelRef = useRef<DefaultSettingsPanelHandle>(null);

  // Mentre és obert, el snackbar de desfer l'estil es pinta dins del panell i no
  // al layout: el diàleg atrapa el focus (vegeu `StyleUndoSnackbar`)
  useEffect(() => {
    if (!open) return;
    dispatch(settingsDialogOpenChangedActionCreator(true));
    return () => {
      dispatch(settingsDialogOpenChangedActionCreator(false));
    };
  }, [open, dispatch]);

  const tabs: AppFullScreenDialogTab<SettingsTab>[] = VISIBLE_SETTINGS_TABS.map(
    ({ value, icon, message }) => ({
      value,
      icon,
      label: intl.formatMessage(message),
    }),
  );

  const handleTabChange = (value: SettingsTab) => {
    dispatch(updateSettingsActiveTabActionCreator(value));
  };

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
      <AppFullScreenDialog
        open={open}
        onClose={handleClose}
        title={intl.formatMessage(messages.settings)}
        closeLabel={intl.formatMessage(messages.close)}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      >
        {/* `xl` i no el `lg` per defecte: el panell a tres columnes fa
            SETTINGS_WIDE_MAX_WIDTH i el contenidor no l'ha d'escanyar. L'amplada
            del panell la posa el propi SettingsPanelLayout, que se centra sol */}
        <Container maxWidth="xl" sx={{ paddingTop: SETTINGS_CONTENT_TOP_GAP }}>
          {activeTab === "user" && <UserSettingsPanel />}

          <div
            style={{ display: activeTab === "pictograms" ? "block" : "none" }}
          >
            <DefaultSettingsPanel ref={pictPanelRef} />
          </div>

          {activeTab === "view" && <ViewSettingsPanel ref={viewPanelRef} />}

          {ACCOUNTS_ENABLED && activeTab === "vocabulary" && (
            <VocabularySettingsPanel />
          )}
        </Container>
      </AppFullScreenDialog>

      {/* Fora del diàleg: MUI desmunta els fills en tancar-lo, i aquest avís neix
          justament quan el diàleg ja s'ha tancat. Viu aquí i no al pare perquè els dos
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

export default SettingsDialog;
