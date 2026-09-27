// Diàleg «Canvia l'estil»: les dues opcions dels fonaments (punt 3), «El meu
// estil per defecte» i «Carrega un estil…». Tots dos camins deixen el canvi a
// punt de desfer a l'avís, i cap no toca el fitxer fins que es desa.
import React, { ChangeEvent, useRef } from "react";
import { DialogContentText, Stack, Typography } from "@mui/material";
import { MdOutlineFileOpen, MdOutlinePerson } from "react-icons/md";
import { useIntl } from "react-intl";
import { AppDialog, AppDialogActions } from "@components/AppDialog";
import confirmMessages from "@components/ConfirmDialog/ConfirmDialog.lang";
import StyledButton from "@/style/StyledButton";
import { APP_TOUCH_TARGET_MIN } from "@/style/appShape";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  changeDocumentStyleThunk,
  changeStyleClosedActionCreator,
} from "@features/sequence/store/styleSlice";
import { selectUserDefaultStyle } from "@features/sequence/style/styleSelectors";
import {
  SEQUENCE_FILE_EXTENSION,
  STYLE_FILE_EXTENSION,
} from "@features/sequence/style/saacFile";
import { useOpenSaacFile } from "@features/sequence/hooks/useOpenSaacFile";
import messages from "./ChangeStyle.lang";

const DIALOG_TITLE_ID = "change-style-dialog-title";

interface OptionButtonProps {
  icon: React.ReactElement;
  label: string;
  help: string;
  onClick: () => void;
}

/** Una opció: el nom, i sota, què vol dir. Tot el bloc és el botó. */
const OptionButton = ({
  icon,
  label,
  help,
  onClick,
}: OptionButtonProps): React.ReactElement => (
  <StyledButton
    variant="outlined"
    color="inherit"
    fullWidth
    onClick={onClick}
    startIcon={icon}
    sx={{
      minHeight: APP_TOUCH_TARGET_MIN,
      justifyContent: "flex-start",
      textAlign: "left",
      whiteSpace: "normal",
      paddingBlock: 1,
    }}
  >
    <Stack>
      <span>{label}</span>
      <Typography variant="body2" component="span" fontWeight="normal">
        {help}
      </Typography>
    </Stack>
  </StyledButton>
);

const ChangeStyleDialog = (): React.ReactElement => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const open = useAppSelector((state) => state.style.changeStyleOpen);
  const userDefault = useAppSelector(selectUserDefaultStyle);
  const { openFile } = useOpenSaacFile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => dispatch(changeStyleClosedActionCreator());

  const handleUserDefault = () => {
    handleClose();
    dispatch(changeDocumentStyleThunk(userDefault, "userDefault"));
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Es buida perquè es pugui tornar a triar el mateix fitxer
    event.target.value = "";
    if (!file) return;
    handleClose();
    void openFile(file, "style");
  };

  return (
    <>
      <AppDialog
        open={open}
        onClose={handleClose}
        title={intl.formatMessage(messages.changeStyle)}
        titleId={DIALOG_TITLE_ID}
        maxWidth="xs"
        actions={
          <AppDialogActions>
            <StyledButton onClick={handleClose} color="inherit">
              {intl.formatMessage(confirmMessages.cancel)}
            </StyledButton>
          </AppDialogActions>
        }
      >
        <DialogContentText variant="body2" sx={{ mb: 2 }}>
          {intl.formatMessage(messages.dialogIntro)}
        </DialogContentText>
        <Stack gap={1.5}>
          <OptionButton
            icon={<MdOutlinePerson aria-hidden />}
            label={intl.formatMessage(messages.optionUserDefault)}
            help={intl.formatMessage(messages.optionUserDefaultHelp)}
            onClick={handleUserDefault}
          />
          <OptionButton
            icon={<MdOutlineFileOpen aria-hidden />}
            label={intl.formatMessage(messages.optionFile)}
            help={intl.formatMessage(messages.optionFileHelp)}
            onClick={() => fileInputRef.current?.click()}
          />
        </Stack>
      </AppDialog>

      <input
        ref={fileInputRef}
        type="file"
        hidden
        onChange={handleFileChange}
        accept={`${STYLE_FILE_EXTENSION},${SEQUENCE_FILE_EXTENSION},application/json,text/plain`}
      />
    </>
  );
};

export default ChangeStyleDialog;
