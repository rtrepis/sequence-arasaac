// Botó flotant que diu on és la feina de l'usuari i ofereix les tres accions
// que hi poden fer alguna cosa: desar-la al núvol, descarregar-la i començar-ne
// una de nova.
//
// Existeix perquè l'autodesat és invisible: la seqüència es guarda sola al
// navegador, però qui la mira no en té cap senyal i no pot saber que allò
// encara no és enlloc de durador (troballa A1b de l'auditoria d'UX).
import React, { ReactElement, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  SpeedDial,
  SpeedDialAction,
  Typography,
} from "@mui/material";
import {
  MdOutlineCloudDone,
  MdOutlineCloudUpload,
  MdOutlineDevices,
  MdOutlineErrorOutline,
  MdOutlineFileDownload,
  MdOutlineFileDownloadDone,
  MdOutlineNoteAdd,
  MdOutlineSync,
} from "react-icons/md";
import { useIntl } from "react-intl";
import { useAppDispatch, useAppSelector } from "@app/hooks";
import { RootState } from "@app/store";
import { startNewDocumentThunk } from "@features/sequence/store/documentSlice";
import {
  DocumentDurability,
  getDocumentDurability,
} from "@features/sequence/store/documentStatusSlice";
import useSaveDocumentToCloud from "@features/backend/documents/hooks/useSaveDocumentToCloud";
import ModalDownload from "@components/ButtonWithModalDownload/ModalDownload";
import messages from "./DocumentStatusFab.lang";

const selectDocumentStatus = (state: RootState) => state.documentStatus;
const selectIsLoggedIn = (state: RootState) => state.auth.accessToken !== null;

/** Estats en què la feina de pantalla no té cap còpia fora del navegador. */
const isAtRisk = (durability: DocumentDurability): boolean =>
  durability === "saving" || durability === "local" || durability === "error";

const DocumentStatusFab = (): ReactElement => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectDocumentStatus);
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const { saveToCloud } = useSaveDocumentToCloud();

  const [isOpen, setIsOpen] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const durability = getDocumentDurability(status);

  const formatTime = (at: number | null): string =>
    at === null ? "" : intl.formatTime(at);

  const statusText = ((): string => {
    switch (durability) {
      case "pristine":
        return intl.formatMessage(messages.statusPristine);
      case "saving":
        return intl.formatMessage(messages.statusSaving);
      case "error":
        return intl.formatMessage(messages.statusError);
      case "durable":
        return intl.formatMessage(
          status.durableKind === "cloud"
            ? messages.statusCloud
            : messages.statusFile,
          { time: formatTime(status.durableAt) },
        );
      default:
        return intl.formatMessage(messages.statusLocal, {
          time: formatTime(status.draftSavedAt),
        });
    }
  })();

  const hintText = ((): string | null => {
    if (durability === "error") return intl.formatMessage(messages.hintError);
    if (durability === "local" || durability === "saving")
      return intl.formatMessage(messages.hintLocal);
    return null;
  })();

  const statusIcon = ((): ReactElement => {
    switch (durability) {
      case "saving":
        return <MdOutlineSync />;
      case "error":
        return <MdOutlineErrorOutline />;
      case "durable":
        return status.durableKind === "cloud" ? (
          <MdOutlineCloudDone />
        ) : (
          <MdOutlineFileDownloadDone />
        );
      default:
        return <MdOutlineDevices />;
    }
  })();

  const fabColor = durability === "error" ? "error" : "primary";

  const startNewDocument = (): void => {
    setIsConfirmOpen(false);
    setIsOpen(false);
    void dispatch(startNewDocumentThunk());
  };

  const handleNewDocument = (): void => {
    if (isAtRisk(durability)) {
      setIsConfirmOpen(true);
      return;
    }
    startNewDocument();
  };

  const handleDownloadFirst = (): void => {
    setIsConfirmOpen(false);
    setIsDownloadOpen(true);
  };

  const handleSaveToCloud = (): void => {
    setIsOpen(false);
    void saveToCloud();
  };

  const handleDownload = (): void => {
    setIsOpen(false);
    setIsDownloadOpen(true);
  };

  const actions = [
    ...(isLoggedIn
      ? [
          {
            key: "cloud",
            icon: <MdOutlineCloudUpload />,
            label: intl.formatMessage(messages.actionCloud),
            onClick: handleSaveToCloud,
            disabled: false,
          },
        ]
      : []),
    {
      key: "download",
      icon: <MdOutlineFileDownload />,
      label: intl.formatMessage(messages.actionDownload),
      onClick: handleDownload,
      disabled: false,
    },
    {
      key: "new",
      icon: <MdOutlineNoteAdd />,
      label: intl.formatMessage(messages.actionNew),
      onClick: handleNewDocument,
      // Amb el document buit no hi ha res a buidar: el botó existiria només
      // per no fer res
      disabled: durability === "pristine",
    },
  ];

  return (
    <>
      <Box
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          // Columna alineada a la dreta i ancorada a baix: el que s'hi afegeix
          // creix cap amunt, de manera que la frase d'estat queda per sobre de
          // les accions sense haver de calcular-ne l'alçada
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 1,
          zIndex: (theme) => theme.zIndex.speedDial,
          "@media print": { display: "none" },
        }}
      >
        {/* La frase d'estat va a dalt de tot de la columna: les accions
            s'obren cap amunt i les seves etiquetes ocupen l'esquerra, on
            abans hi queia el panell */}
        {isOpen && (
          <Paper
            elevation={3}
            sx={{
              width: 260,
              maxWidth: "calc(100vw - 32px)",
              p: 1.5,
              pointerEvents: "none",
            }}
          >
            <Typography variant="body2" fontWeight="bold">
              {statusText}
            </Typography>
            {hintText && (
              <Typography variant="caption" color="text.secondary">
                {hintText}
              </Typography>
            )}
          </Paper>
        )}

        <SpeedDial
          ariaLabel={`${intl.formatMessage(messages.fabLabel)}: ${statusText}`}
          open={isOpen}
          // Només obre el clic (que el teclat també provoca amb Enter). El
          // ratolí per sobre no: passar pel racó no és voler saber on es desa
          // la feina, i amb l'obertura per hover el clic següent la tancaria,
          // de manera que el botó semblaria mort. El focus tampoc: en tancar-se
          // el diàleg de descàrrega el focus torna al botó i el panell es
          // tornaria a obrir tot sol.
          onOpen={(_event, reason) => {
            if (reason === "toggle") setIsOpen(true);
          }}
          // Tanca tot menys treure-hi el ratolí de sobre: qui l'ha obert per
          // llegir l'estat pot moure el cursor mentre llegeix
          onClose={(_event, reason) => {
            if (reason !== "mouseLeave") setIsOpen(false);
          }}
          icon={statusIcon}
          FabProps={{ color: fabColor, size: "medium" }}
          sx={{ ".MuiSpeedDial-fab": { width: 48, height: 48 } }}
        >
          {actions.map((action) => (
            <SpeedDialAction
              key={action.key}
              icon={action.icon}
              tooltipTitle={action.label}
              tooltipOpen
              onClick={action.onClick}
              // Les etiquetes sempre visibles (l'usuari tàctil no té hover) i
              // en una sola línia: partides s'encavalquen amb l'acció del costat
              sx={{
                ".MuiSpeedDialAction-staticTooltipLabel": {
                  whiteSpace: "nowrap",
                },
              }}
              // 44 px és el mínim de diana tàctil (WCAG); el `small` de MUI
              // es queda a 40
              FabProps={{
                disabled: action.disabled,
                sx: { width: 44, height: 44 },
              }}
            />
          ))}
        </SpeedDial>
      </Box>

      {/* Anunci per a lectors de pantalla. Només els estats que l'usuari ha de
          saber sense mirar: desar-se sol al navegador no és una notícia, no
          poder-ho fer sí */}
      <Box
        aria-live="polite"
        aria-atomic="true"
        sx={{
          position: "absolute",
          left: -9999,
          width: 1,
          height: 1,
          overflow: "hidden",
        }}
      >
        {durability === "error" || durability === "durable" ? statusText : ""}
      </Box>

      {isDownloadOpen && (
        <ModalDownload
          open={isDownloadOpen}
          onClose={() => setIsDownloadOpen(false)}
        />
      )}

      <Dialog open={isConfirmOpen} onClose={() => setIsConfirmOpen(false)}>
        <DialogTitle>{intl.formatMessage(messages.confirmTitle)}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {intl.formatMessage(messages.confirmBody)}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsConfirmOpen(false)}>
            {intl.formatMessage(messages.confirmCancel)}
          </Button>
          <Button onClick={handleDownloadFirst}>
            {intl.formatMessage(messages.confirmDownloadFirst)}
          </Button>
          <Button onClick={startNewDocument} color="error" variant="contained">
            {intl.formatMessage(messages.confirmDiscard)}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DocumentStatusFab;
