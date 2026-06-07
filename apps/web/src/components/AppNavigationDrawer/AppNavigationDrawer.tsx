import React, { ChangeEvent, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@mui/material";
import {
  AiOutlineCloudDownload,
  AiOutlineCloudUpload,
  AiOutlineClose,
  AiOutlineEdit,
  AiOutlineEye,
  AiOutlineHome,
  AiOutlineRead,
  AiOutlineSave,
  AiOutlineSetting,
  AiOutlineUser,
} from "react-icons/ai";
import { useIntl } from "react-intl";
import messages from "./AppNavigationDrawer.lang";
import authMessages from "@features/backend/auth/components/AuthModal.lang";
import DefaultSettingsDialog from "../../Modals/DefaultSettingsModal/DefaultSettingsDialog";
import ModalDownload from "../ButtonWithModalDownload/ModalDownload";
import AuthModal from "@features/backend/auth/components/AuthModal";
import LoadDocumentModal from "@features/backend/auth/components/LoadDocumentModal";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  addSequenceActionCreator,
  loadDocumentSaacActionCreator,
  saveDocumentThunk,
} from "@features/sequence/store/documentSlice";
import { updateDefaultSettingsActionCreator } from "@features/user-settings/store/uiSlice";
import { logoutThunk } from "@features/backend/auth/store/authSlice";
import { trackEvent } from "@shared/hooks/usePageTracking";
import { useFeedback } from "../../context/FeedbackContext";
import feedbackMessages from "../../context/FeedbackContext/FeedbackContext.lang";

interface AppNavigationDrawerProps {
  open: boolean;
  onClose: () => void;
}

// Drawer de navegació compartit per LogoMenu (BarNavigation) i NewsNavBar
const AppNavigationDrawer = ({
  open,
  onClose,
}: AppNavigationDrawerProps): React.ReactElement => {
  const intl = useIntl();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showSnackbar, showBackdrop, hideBackdrop } = useFeedback();

  // Estat d'autenticació
  const { userEmail, accessToken } = useAppSelector((state) => state.auth);
  const isLoggedIn = Boolean(accessToken);

  // Document actual (per desar al núvol)
  const document = useAppSelector((state) => state.document);

  // Locale de la ruta; fallback a "ca" si no estem en una ruta amb paràmetre de locale
  const { locale = "ca" } = useParams<{ locale: string }>();

  // Estat dels diàlegs interns
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [loadDocModalOpen, setLoadDocModalOpen] = useState(false);

  // Ref per al input ocult de càrrega de fitxer
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handlers de navegació: tanquen el drawer i navegan
  const handleNavigate = (path: string) => {
    onClose();
    navigate(path);
  };

  // Handlers d'autenticació
  const handleAuthModalOpen = () => {
    onClose();
    setAuthModalOpen(true);
  };

  const handleSaveToCloud = async () => {
    onClose();
    showBackdrop({ message: intl.formatMessage(feedbackMessages.loading) });
    const result = await dispatch(saveDocumentThunk(document));
    hideBackdrop();
    if (result.meta.requestStatus === "fulfilled") {
      showSnackbar({
        message: intl.formatMessage(authMessages.documentSaved),
        severity: "success",
      });
    } else {
      showSnackbar({
        message: result.payload as string,
        severity: "error",
      });
    }
  };

  const handleLoadFromCloud = () => {
    onClose();
    setLoadDocModalOpen(true);
  };

  const handleLogout = async () => {
    onClose();
    await dispatch(logoutThunk());
    showSnackbar({
      message: intl.formatMessage(authMessages.logout),
      severity: "info",
    });
  };

  const handleDocumentLoaded = () => {
    showSnackbar({
      message: intl.formatMessage(authMessages.documentLoaded),
      severity: "success",
    });
  };

  // Obrir descàrrega: tanca el drawer i obre el modal
  const handleDownloadOpen = () => {
    onClose();
    setDownloadOpen(true);
  };

  // Obrir el selector de fitxer per carregar
  const handleLoadClick = () => {
    onClose();
    fileInputRef.current?.click();
  };

  // Lògica de càrrega de fitxer (mateixa que tenia LogoMenu)
  const handleFileLoad = (event: ChangeEvent<HTMLInputElement>) => {
    const valueTrackEvent: string[] = [];
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file) {
        showBackdrop({ message: intl.formatMessage(feedbackMessages.loading) });

        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const parsedJson = JSON.parse(e.target?.result as string);

            if ("sequence" in parsedJson) {
              dispatch(addSequenceActionCreator(parsedJson.sequence));
              valueTrackEvent.push("sequence");
            }
            if ("documentState" in parsedJson) {
              dispatch(loadDocumentSaacActionCreator(parsedJson.documentState));
              valueTrackEvent.push("documentState");
            }
            if ("defaultSettings" in parsedJson) {
              dispatch(
                updateDefaultSettingsActionCreator(parsedJson.defaultSettings),
              );
              valueTrackEvent.push("defaultSettings");
            }

            hideBackdrop();
            showSnackbar({
              message: intl.formatMessage(feedbackMessages.loadSuccess),
              severity: "success",
            });
          } catch (error) {
            console.error(error);
            hideBackdrop();
            showSnackbar({
              message: intl.formatMessage(feedbackMessages.loadError),
              severity: "error",
            });
          }
        };
        reader.readAsText(file);
      }
    }

    trackEvent({
      event: "load-event",
      event_category: "file",
      event_label: "load",
      value: valueTrackEvent.join(" "),
    });

    // Netejar l'input per permetre carregar el mateix fitxer dues vegades
    if (input) input.value = "";
  };

  return (
    <>
      {/* Drawer de navegació (des de l'esquerra) */}
      <Drawer
        anchor="left"
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
      >
        <Box
          sx={{
            width: 240,
            pt: 1,
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
          role="navigation"
        >
          {/* Secció 1: Navegació per pàgines */}
          <List>
            <ListItemButton component={Link} to="/" onClick={onClose}>
              <ListItemIcon>
                <AiOutlineHome />
              </ListItemIcon>
              <ListItemText primary={intl.formatMessage(messages.welcome)} />
            </ListItemButton>

            <ListItemButton
              component={Link}
              to={`/${locale}/news`}
              onClick={onClose}
            >
              <ListItemIcon>
                <AiOutlineRead />
              </ListItemIcon>
              <ListItemText primary={intl.formatMessage(messages.news)} />
            </ListItemButton>

            <ListItemButton
              onClick={() => handleNavigate(`/${locale}/create-sequence`)}
            >
              <ListItemIcon>
                <AiOutlineEdit />
              </ListItemIcon>
              <ListItemText primary={intl.formatMessage(messages.editView)} />
            </ListItemButton>

            <ListItemButton
              onClick={() => handleNavigate(`/${locale}/view-sequence`)}
            >
              <ListItemIcon>
                <AiOutlineEye />
              </ListItemIcon>
              <ListItemText
                primary={intl.formatMessage(messages.previewView)}
              />
            </ListItemButton>
          </List>

          <Divider />

          {/* Secció 2: Operacions de fitxer */}
          <List>
            <ListItemButton onClick={handleDownloadOpen}>
              <ListItemIcon>
                <AiOutlineCloudDownload />
              </ListItemIcon>
              <ListItemText primary={intl.formatMessage(messages.download)} />
            </ListItemButton>

            <ListItemButton onClick={handleLoadClick}>
              <ListItemIcon>
                <AiOutlineCloudUpload />
              </ListItemIcon>
              <ListItemText primary={intl.formatMessage(messages.load)} />
            </ListItemButton>
          </List>

          <Divider />

          {/* Secció 3: Configuració */}
          <List>
            <Tooltip title={intl.formatMessage(messages.settings)} placement="right">
              <ListItemButton onClick={() => { onClose(); setSettingsOpen(true); }}>
                <ListItemIcon>
                  <AiOutlineSetting />
                </ListItemIcon>
                <ListItemText primary={intl.formatMessage(messages.settings)} />
              </ListItemButton>
            </Tooltip>
          </List>

          {/* Espai flexible: empeny autenticació al fons */}
          <Box sx={{ flexGrow: 1 }} />

          <Divider />

          {/* Secció 3: Autenticació */}
          {!isLoggedIn ? (
            <List>
              <ListItemButton onClick={handleAuthModalOpen}>
                <ListItemIcon>
                  <AiOutlineUser />
                </ListItemIcon>
                <ListItemText
                  primary={intl.formatMessage(authMessages.loginItem)}
                />
              </ListItemButton>
            </List>
          ) : (
            <List>
              {/* Fila no interactiva: Avatar + email */}
              <ListItem>
                <ListItemIcon>
                  <Avatar
                    sx={{
                      width: 28,
                      height: 28,
                      fontSize: "0.75rem",
                      bgcolor: "primary.main",
                    }}
                  >
                    {userEmail ? userEmail.slice(0, 2).toUpperCase() : "?"}
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={userEmail ?? ""}
                  primaryTypographyProps={{
                    variant: "body2",
                    noWrap: true,
                    title: userEmail ?? "",
                  }}
                />
              </ListItem>

              <ListItemButton onClick={handleSaveToCloud}>
                <ListItemIcon>
                  <AiOutlineSave />
                </ListItemIcon>
                <ListItemText
                  primary={intl.formatMessage(authMessages.saveDocument)}
                />
              </ListItemButton>

              <ListItemButton onClick={handleLoadFromCloud}>
                <ListItemIcon>
                  <AiOutlineCloudDownload />
                </ListItemIcon>
                <ListItemText
                  primary={intl.formatMessage(authMessages.loadDocument)}
                />
              </ListItemButton>

              <ListItemButton onClick={handleLogout}>
                <ListItemIcon>
                  <AiOutlineClose />
                </ListItemIcon>
                <ListItemText
                  primary={intl.formatMessage(authMessages.logout)}
                />
              </ListItemButton>
            </List>
          )}
        </Box>
      </Drawer>

      {/* Input ocult per carregar fitxers */}
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: "none" }}
        onChange={handleFileLoad}
        accept="text/plain,.saac,application/json"
      />

      {/* Modal de configuració */}
      <DefaultSettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {/* Modal de descàrrega */}
      {downloadOpen && (
        <ModalDownload
          open={downloadOpen}
          onClose={() => setDownloadOpen(false)}
        />
      )}

      {/* Modal d'autenticació */}
      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* Modal de càrrega de documents del núvol */}
      <LoadDocumentModal
        open={loadDocModalOpen}
        onClose={() => setLoadDocModalOpen(false)}
        onLoaded={handleDocumentLoaded}
      />
    </>
  );
};

export default AppNavigationDrawer;
