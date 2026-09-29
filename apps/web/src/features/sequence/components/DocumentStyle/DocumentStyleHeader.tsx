// Capçalera del panell «Estil del document»: títol, ajuda i les quatre accions
// d'estil, en l'ordre dels fonaments (`docs/fonaments/sequencia-i-estil.md`):
//
//   1. Aplica el meu estil per defecte
//   2. Carrega un estil des d'un fitxer…
//   3. Desa com a estil per defecte
//   4. Desa l'estil en un fitxer…
//
// Ocupa el lloc de la guia del tab (`SettingsPanelHint`), que és la columna
// lateral en escriptori. En escriptori i tauleta les accions són botons; per
// sota de `md`, on el panell passa a una sola columna, van a un menú «⋯» a la
// capçalera, amb l'etiqueta accessible «Accions d'estil».
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
  MdOutlinePerson,
  MdOutlinePushPin,
} from "react-icons/md";
import { useIntl } from "react-intl";
import StyledButton from "@/style/StyledButton";
import StyledIconButton from "@/style/StyledIconButton";
import { APP_TOUCH_TARGET_MIN } from "@/style/appShape";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { SETTINGS_TWO_COLUMN_BREAKPOINT } from "@components/SettingsLayout/settingsLayout.styled";
import ModalDownload from "@components/ButtonWithModalDownload/ModalDownload";
import { changeDocumentStyleThunk } from "@features/sequence/store/styleSlice";
import { selectUserDefaultStyle } from "@features/sequence/style/styleSelectors";
import { SAAC_FILE_ACCEPT } from "@features/sequence/saac/types";
import { useOpenSaacFile } from "@features/sequence/hooks/useOpenSaacFile";
import StyleUndoSnackbar from "./StyleUndoSnackbar";
import messages from "./DocumentStyle.lang";

interface DocumentStyleHeaderProps {
  /** Ajuda del panell, sota el títol */
  help: React.ReactNode;
  /**
   * Porta al document el que hi ha al formulari. Es crida abans de cada acció,
   * perquè el que s'aplica, es desa o es desfà sigui el que es veu.
   */
  onBeforeAction: () => void;
  /** «Desa com a estil per defecte»: el panell sap quin és l'estil del formulari */
  onSetAsDefault: () => void;
}

interface StyleAction {
  key: string;
  label: string;
  icon: React.ReactElement;
  run: () => void;
}

const DocumentStyleHeader = ({
  help,
  onBeforeAction,
  onSetAsDefault,
}: DocumentStyleHeaderProps): React.ReactElement => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const userDefault = useAppSelector(selectUserDefaultStyle);
  const { openFile } = useOpenSaacFile();
  const compact = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down(SETTINGS_TWO_COLUMN_BREAKPOINT),
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstActionRef = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [saveStyleOpen, setSaveStyleOpen] = useState(false);
  const menuId = useId();
  const menuButtonId = useId();
  const titleId = useId();

  const actions: StyleAction[] = [
    {
      key: "applyUserDefault",
      label: intl.formatMessage(messages.applyUserDefault),
      icon: <MdOutlinePerson aria-hidden />,
      run: () => {
        onBeforeAction();
        dispatch(changeDocumentStyleThunk(userDefault, "userDefault"));
      },
    },
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
      key: "setAsDefault",
      label: intl.formatMessage(messages.setAsDefault),
      icon: <MdOutlinePushPin aria-hidden />,
      run: onSetAsDefault,
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
          {intl.formatMessage(messages.panelTitle)}
        </AlertTitle>
        {help}

        {!compact && (
          <Stack gap={1} sx={{ mt: 1.5, mb: 1 }}>
            {actions.map((action, index) => (
              <StyledButton
                key={action.key}
                ref={index === 0 ? firstActionRef : undefined}
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

      {/* Al DOM just després de les accions: el tabulador hi arriba tot seguit */}
      <StyleUndoSnackbar
        placement="panel"
        returnFocusRef={compact ? menuButtonRef : firstActionRef}
      />

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

export default DocumentStyleHeader;
