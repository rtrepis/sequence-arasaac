import React, { ChangeEvent, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Divider,
  Drawer,
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
  AiOutlineDownload,
  AiOutlineEdit,
  AiOutlineEye,
  AiOutlineFolderOpen,
  AiOutlineHome,
  AiOutlineRead,
  AiOutlineSafety,
  AiOutlineSetting,
  AiOutlineUser,
} from "react-icons/ai";
import { useIntl } from "react-intl";
import messages from "./AppNavigationDrawer.lang";
import navigationMessages from "@shared/messages/navigation.lang";
import authMessages from "@features/backend/auth/components/AuthModal.lang";
import DefaultSettingsDialog from "../../Modals/DefaultSettingsModal/DefaultSettingsDialog";
import ModalDownload from "../ButtonWithModalDownload/ModalDownload";
import AuthModal from "@features/backend/auth/components/AuthModal";
import LoadDocumentModal from "@features/backend/documents/components/LoadDocumentModal";
import SaveDocumentModal from "@features/backend/documents/components/SaveDocumentModal";
import documentMessages from "@features/backend/documents/components/DocumentModals.lang";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { RootState } from "@app/store";
import { startNewDocumentThunk } from "@features/sequence/store/documentSlice";
import {
  getDocumentDurability,
  isWorkAtRisk,
} from "@features/sequence/store/documentStatusSlice";
import { useOpenSaacFile } from "@features/sequence/hooks/useOpenSaacFile";
import {
  DOCUMENT_FILE_EXTENSION,
  STYLE_FILE_EXTENSION,
} from "@features/sequence/style/saacFile";
import PendingDefaultStyleDialog from "@features/sequence/components/DocumentStyle/PendingDefaultStyleDialog";
import ConfirmDialog from "@components/ConfirmDialog/ConfirmDialog";
import UserAvatar from "@components/UserAvatar/UserAvatar";
import { selectIsLoggedIn } from "@features/backend/auth/store/authSelectors";
import { ACCOUNTS_ENABLED } from "@/configs/accountsConfig";
import { logoutThunk } from "@features/backend/auth/store/authSlice";
import { useFeedback } from "../../context/FeedbackContext";

const selectDocumentStatus = (state: RootState) => state.documentStatus;

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
  const { showSnackbar } = useFeedback();
  const { openFile, announceOpenedDocument } = useOpenSaacFile();

  // Estat d'autenticació
  const { userEmail, isAdmin } = useAppSelector((state) => state.auth);
  const isLoggedIn = useAppSelector(selectIsLoggedIn);

  // Locale de la ruta; fallback a "ca" si no estem en una ruta amb paràmetre de locale
  const { locale = "ca" } = useParams<{ locale: string }>();

  // Estat dels diàlegs interns
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [saveDocModalOpen, setSaveDocModalOpen] = useState(false);
  const [loadDocModalOpen, setLoadDocModalOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  // Estat de durabilitat del document: tancar la sessió també el tanca, i el
  // que decideix si això s'ha de confirmar és si la feina té còpia enlloc
  const durability = getDocumentDurability(
    useAppSelector(selectDocumentStatus),
  );
  const isDocumentOpen = durability !== "pristine";

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

  // Desar passa pel diàleg de nom: el document s'ha de poder distingir al llistat
  const handleSaveToCloud = () => {
    onClose();
    setSaveDocModalOpen(true);
  };

  const handleLoadFromCloud = () => {
    onClose();
    setLoadDocModalOpen(true);
  };

  /**
   * Tancar la sessió tanca també el document.
   *
   * El vocabulari personal ja se n'anava en sortir, i pel mateix motiu: en AAC
   * el dispositiu es comparteix, i el que queda a pantalla —i a l'esborrany del
   * navegador, que sobreviu al refresc— és feina d'algú altre. A més, el
   * document desat al núvol se'n porta l'id del compte que l'ha desat: sense
   * tancar-lo, l'indicador d'estat continuava dient «Desat al núvol» a qui ja no
   * hi té sessió, i desar-lo des d'un altre compte hauria estat un PUT a un
   * document que no és seu.
   *
   * Només ho fa el tancament explícit. La sessió que caduca sola (`A11`) no hi
   * passa: allà l'usuari no ha demanat res i perdre-li la feina seria el pitjor
   * dels dos mals.
   */
  const closeSessionAndDocument = async () => {
    await dispatch(logoutThunk());

    if (isDocumentOpen) await dispatch(startNewDocumentThunk());

    showSnackbar({
      message: intl.formatMessage(
        isDocumentOpen ? messages.logoutDocumentClosed : authMessages.logout,
      ),
      severity: "info",
    });
  };

  const handleLogout = () => {
    onClose();

    // Amb còpia al núvol o al fitxer no es pregunta res: no hi ha res a perdre
    // i preguntar-ho cada vegada acabaria en gent que hi clica sense llegir
    if (isWorkAtRisk(durability)) {
      setLogoutConfirmOpen(true);
      return;
    }

    void closeSessionAndDocument();
  };

  const handleLogoutConfirm = () => {
    setLogoutConfirmOpen(false);
    void closeSessionAndDocument();
  };

  // La sortida que evita la pèrdua en comptes de consumar-la: encara hi ha
  // sessió, així que desar al núvol continua sent possible
  const handleSaveBeforeLogout = () => {
    setLogoutConfirmOpen(false);
    setSaveDocModalOpen(true);
  };

  const handleDocumentLoaded = (title: string) => {
    showSnackbar({
      message: title
        ? intl.formatMessage(documentMessages.documentLoadedNamed, { title })
        : intl.formatMessage(authMessages.documentLoaded),
      severity: "success",
    });
    // Un document del núvol s'obre igual que un fitxer: amb el seu estil, i
    // amb l'avís si és diferent de l'estil per defecte
    announceOpenedDocument();
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

  // Obrir un fitxer: què se'n fa segons el que porta és a `useOpenSaacFile`
  const handleFileLoad = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    // Netejar l'input per permetre carregar el mateix fitxer dues vegades
    input.value = "";
    if (file) void openFile(file, "open");
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
              <ListItemText
                primary={intl.formatMessage(navigationMessages.edit)}
              />
            </ListItemButton>

            <ListItemButton
              onClick={() => handleNavigate(`/${locale}/view-sequence`)}
            >
              <ListItemIcon>
                <AiOutlineEye />
              </ListItemIcon>
              <ListItemText
                primary={intl.formatMessage(navigationMessages.view)}
              />
            </ListItemButton>
          </List>

          <Divider />

          {/* Secció 2: Operacions de fitxer */}
          <List>
            <ListItemButton onClick={handleDownloadOpen}>
              <ListItemIcon>
                <AiOutlineDownload />
              </ListItemIcon>
              <ListItemText primary={intl.formatMessage(messages.download)} />
            </ListItemButton>

            <ListItemButton onClick={handleLoadClick}>
              <ListItemIcon>
                <AiOutlineFolderOpen />
              </ListItemIcon>
              <ListItemText primary={intl.formatMessage(messages.load)} />
            </ListItemButton>
          </List>

          <Divider />

          {/* Secció 3: Configuració */}
          <List>
            <Tooltip
              title={intl.formatMessage(messages.settings)}
              placement="right"
            >
              <ListItemButton
                onClick={() => {
                  onClose();
                  setSettingsOpen(true);
                }}
              >
                <ListItemIcon>
                  <AiOutlineSetting />
                </ListItemIcon>
                <ListItemText primary={intl.formatMessage(messages.settings)} />
              </ListItemButton>
            </Tooltip>
          </List>

          {/* Espai flexible: empeny autenticació al fons */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Amb les funcions de compte apagades no hi ha sessió ni porta
              per obrir-ne cap: la secció sencera no existeix */}
          {ACCOUNTS_ENABLED && (
            <>
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
                      <UserAvatar email={userEmail} />
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
                      <AiOutlineCloudUpload />
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

                  {/* Accés al panell d'administració. L'enllaç sí que es tradueix,
                    encara que la pàgina de darrere només existeixi en català
                    (excepció declarada al CLAUDE.md): el drawer és superfície
                    traduïda i una paraula catalana enmig d'una llista francesa no
                    es pot llegir */}
                  {isAdmin && (
                    <ListItemButton onClick={() => handleNavigate("/admin")}>
                      <ListItemIcon>
                        <AiOutlineSafety />
                      </ListItemIcon>
                      <ListItemText
                        primary={intl.formatMessage(messages.admin)}
                      />
                    </ListItemButton>
                  )}

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
            </>
          )}
        </Box>
      </Drawer>

      {/* Input ocult per carregar fitxers */}
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: "none" }}
        onChange={handleFileLoad}
        accept={`${DOCUMENT_FILE_EXTENSION},${STYLE_FILE_EXTENSION},text/plain,application/json`}
      />

      {/* La pregunta d'un fitxer d'estil obert sense cap document: és el menú
          qui obre fitxers, i el menú hi és a totes les pàgines */}
      <PendingDefaultStyleDialog />

      {/* Modal de configuració */}
      <DefaultSettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      {/* Modal de descàrrega */}
      {downloadOpen && (
        <ModalDownload
          open={downloadOpen}
          onClose={() => setDownloadOpen(false)}
        />
      )}

      {/* Modal per desar al núvol amb nom */}
      {saveDocModalOpen && (
        <SaveDocumentModal
          open={saveDocModalOpen}
          onClose={() => setSaveDocModalOpen(false)}
        />
      )}

      {/* Modal d'autenticació */}
      {ACCOUNTS_ENABLED && (
        <AuthModal
          open={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
        />
      )}

      {/* Confirmació abans de tancar la sessió amb feina sense còpia */}
      <ConfirmDialog
        open={logoutConfirmOpen}
        title={intl.formatMessage(messages.logoutConfirmTitle)}
        body={intl.formatMessage(messages.logoutConfirmBody)}
        // El mateix text que l'ítem del calaix que hi porta: la mateixa acció no
        // es pot dir de dues maneres segons on es llegeixi
        confirmLabel={intl.formatMessage(authMessages.logout)}
        onConfirm={handleLogoutConfirm}
        onCancel={() => setLogoutConfirmOpen(false)}
        alternative={{
          label: intl.formatMessage(messages.logoutSaveFirst),
          onClick: handleSaveBeforeLogout,
        }}
      />

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
