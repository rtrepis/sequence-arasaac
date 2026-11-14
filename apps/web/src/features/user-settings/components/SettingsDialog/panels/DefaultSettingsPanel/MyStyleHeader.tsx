// Capçalera del panell «El meu estil»: títol, ajuda i les dues accions de
// fitxer, que són la manera d'exportar i importar el meu estil
// (`docs/fonaments/03-model-contingut-estil.md`):
//
//   1. Carrega un estil des d'un fitxer…
//   2. Desa el meu estil en un fitxer…
//
// No hi ha cap acció sobre el document obert: el meu estil s'hi aplica des del
// menú «⋯» de la pàgina i del bloc, a la vista (R10).
//
// Ocupa el lloc de la guia del tab (`SettingsPanelHint`), que és la columna
// lateral en escriptori. En escriptori i tauleta les accions són botons; per
// sota de `md`, on el panell passa a una sola columna, van a un menú «⋯» a la
// capçalera, amb l'etiqueta accessible «Accions del meu estil».
import React, { ChangeEvent, useId, useRef, useState } from "react";
import {
  Alert,
  AlertTitle,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  useMediaQuery,
} from "@mui/material";
import { Theme } from "@mui/material/styles";
import {
  MdMoreHoriz,
  MdOutlineFileDownload,
  MdOutlineFileOpen,
} from "react-icons/md";
import { useIntl } from "react-intl";
import StyledButton from "@/style/StyledButton";
import StyledIconButton from "@/style/StyledIconButton";
import { APP_TOUCH_TARGET_MIN } from "@/style/appShape";
import { SETTINGS_TWO_COLUMN_BREAKPOINT } from "@components/SettingsLayout/settingsLayout.styled";
import ModalDownload from "@components/ButtonWithModalDownload/ModalDownload";
import { SAAC_FILE_ACCEPT } from "@features/sequence/saac/types";
import { useOpenSaacFile } from "@features/sequence/hooks/useOpenSaacFile";
import messages from "./DefaultForm.lang";

interface MyStyleHeaderProps {
  /** Ajuda del panell, sota el títol */
  help: React.ReactNode;
  /**
   * Porta a les preferències el que hi ha al formulari. Es crida abans de cada
   * acció, perquè el que es desa en un fitxer sigui el que es veu.
   */
  onBeforeAction: () => void;
}

interface StyleAction {
  key: string;
  label: string;
  icon: React.ReactElement;
  run: () => void;
}

const MyStyleHeader = ({
  help,
  onBeforeAction,
}: MyStyleHeaderProps): React.ReactElement => {
  const intl = useIntl();
  const { openFile } = useOpenSaacFile();
  const compact = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down(SETTINGS_TWO_COLUMN_BREAKPOINT),
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [saveStyleOpen, setSaveStyleOpen] = useState(false);
  const menuId = useId();
  const menuButtonId = useId();
  const titleId = useId();

  const actions: StyleAction[] = [
    {
      key: "loadStyleFile",
      label: intl.formatMessage(messages.loadStyleFile),
      icon: <MdOutlineFileOpen aria-hidden />,
      run: () => {
        onBeforeAction();
        fileInputRef.current?.click();
      },
    },
    {
      key: "saveStyleFile",
      label: intl.formatMessage(messages.saveStyleFile),
      icon: <MdOutlineFileDownload aria-hidden />,
      run: () => {
        onBeforeAction();
        setSaveStyleOpen(true);
      },
    },
  ];

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Es buida perquè es pugui tornar a triar el mateix fitxer
    event.target.value = "";
    if (file) void openFile(file, "style");
  };

  const runFromMenu = (action: StyleAction) => {
    // El menú es tanca primer: així torna el focus al «⋯» abans que l'acció
    // obri el selector de fitxers o un diàleg, que en tancar-se hi tornaran
    setMenuOpen(false);
    action.run();
  };

  return (
    <>
      <Alert
        severity="info"
        variant="outlined"
        sx={{ py: 0 }}
        // Capçalera del panell, no un avís: una regió amb el nom del títol, i no
        // el `role="alert"` de l'Alert, que el lector anunciaria en obrir el tab
        role="region"
        aria-labelledby={titleId}
        action={
          compact ? (
            <StyledIconButton
              ref={menuButtonRef}
              id={menuButtonId}
              color="inherit"
              aria-label={intl.formatMessage(messages.styleActions)}
              aria-haspopup="menu"
              aria-controls={menuOpen ? menuId : undefined}
              aria-expanded={menuOpen ? "true" : undefined}
              onClick={() => setMenuOpen(true)}
            >
              <MdMoreHoriz aria-hidden />
            </StyledIconButton>
          ) : undefined
        }
      >
        <AlertTitle component="h2" id={titleId}>
          {intl.formatMessage(messages.myStyleTitle)}
        </AlertTitle>
        {help}

        {!compact && (
          <Stack gap={1} sx={{ mt: 1.5, mb: 1 }}>
            {actions.map((action) => (
              <StyledButton
                key={action.key}
                variant="outlined"
                color="inherit"
                fullWidth
                startIcon={action.icon}
                onClick={action.run}
                sx={{
                  minHeight: APP_TOUCH_TARGET_MIN,
                  justifyContent: "flex-start",
                  textAlign: "left",
                  whiteSpace: "normal",
                }}
              >
                {action.label}
              </StyledButton>
            ))}
          </Stack>
        )}
      </Alert>

      {compact && (
        <Menu
          id={menuId}
          anchorEl={menuButtonRef.current}
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          slotProps={{ list: { "aria-labelledby": menuButtonId } }}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          {actions.map((action) => (
            <MenuItem
              key={action.key}
              onClick={() => runFromMenu(action)}
              sx={{ minHeight: APP_TOUCH_TARGET_MIN }}
            >
              <ListItemIcon>{action.icon}</ListItemIcon>
              <ListItemText>{action.label}</ListItemText>
            </MenuItem>
          ))}
        </Menu>
      )}

      <input
        ref={fileInputRef}
        type="file"
        hidden
        onChange={handleFileChange}
        accept={SAAC_FILE_ACCEPT}
      />

      {saveStyleOpen && (
        <ModalDownload
          kind="style"
          open={saveStyleOpen}
          onClose={() => setSaveStyleOpen(false)}
        />
      )}
    </>
  );
};

export default MyStyleHeader;
