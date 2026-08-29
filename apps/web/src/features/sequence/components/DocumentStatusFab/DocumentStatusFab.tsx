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
import { MessageDescriptor, useIntl } from "react-intl";
import { useAppDispatch, useAppSelector } from "@app/hooks";
import { RootState } from "@app/store";
import { startNewDocumentThunk } from "@features/sequence/store/documentSlice";
import {
  DocumentDurability,
  getDocumentDurability,
} from "@features/sequence/store/documentStatusSlice";
import { requestPersistentStorage } from "@features/sequence/storage/persistentStorage";
import {
  APP_CONTROL_SIZE,
  APP_CORNER_RADIUS,
  APP_TOUCH_TARGET_MIN,
  FLOATING_EDGE_GAP,
} from "@/style/appShape";
import { floatingControlSx } from "@/style/floatingControl";
import SaveDocumentModal from "@features/backend/documents/components/SaveDocumentModal";
import ModalDownload from "@components/ButtonWithModalDownload/ModalDownload";
import ConfirmDialog from "@components/ConfirmDialog/ConfirmDialog";
import messages from "./DocumentStatusFab.lang";

const selectDocumentStatus = (state: RootState) => state.documentStatus;
const selectIsLoggedIn = (state: RootState) => state.auth.accessToken !== null;

/**
 * Si un moment és d'avui, comparant **dia de calendari** i no «fa menys de 24
 * hores»: a les 00:30, un esborrany de les 23:50 d'ahir no és d'avui encara que
 * faci quaranta minuts, i dir-ne «des de les 23:50» seria exactament el
 * malentès que aquesta distinció evita.
 */
const isToday = (at: number): boolean => {
  const now = new Date();
  const moment = new Date(at);

  return (
    moment.getDate() === now.getDate() &&
    moment.getMonth() === now.getMonth() &&
    moment.getFullYear() === now.getFullYear()
  );
};

/** Estats en què la feina de pantalla no té cap còpia fora del navegador. */
const isAtRisk = (durability: DocumentDurability): boolean =>
  durability === "saving" || durability === "local" || durability === "error";

const DocumentStatusFab = (): ReactElement => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectDocumentStatus);
  const isLoggedIn = useAppSelector(selectIsLoggedIn);

  const [isOpen, setIsOpen] = useState(false);
  const [isCloudOpen, setIsCloudOpen] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const durability = getDocumentDurability(status);

  /**
   * L'hora sola quan és d'avui; el dia i l'hora quan no. L'indicador és per a
   * qui torna, i qui torna és justament qui no sap de quin dia és l'hora que
   * llegeix. La data no es pot encaixar dins de la frase de sempre («des de les
   * {time}»): cada llengua hi porta la seva preposició, i per això cada estat té
   * dues frases i no un format condicional.
   */
  const momentText = (
    at: number | null,
    todayMessage: MessageDescriptor,
    datedMessage: MessageDescriptor,
  ): string => {
    if (at === null) return intl.formatMessage(todayMessage, { time: "" });

    if (isToday(at))
      return intl.formatMessage(todayMessage, { time: intl.formatTime(at) });

    return intl.formatMessage(datedMessage, {
      // Curta i amb any: al panell hi caben 260 px, i un esborrany pot
      // sobreviure a un canvi d'any
      date: intl.formatDate(at, { dateStyle: "short" }),
      time: intl.formatTime(at),
    });
  };

  const statusText = ((): string => {
    switch (durability) {
      case "pristine":
        return intl.formatMessage(messages.statusPristine);
      case "saving":
        return intl.formatMessage(messages.statusSaving);
      case "error":
        // Les dues causes deixen la feina només a la pantalla, però no volen dir
        // el mateix ni tenen la mateixa sortida
        return intl.formatMessage(
          status.draftError === "conflict"
            ? messages.statusConflict
            : messages.statusError,
        );
      case "durable":
        return status.durableKind === "cloud"
          ? momentText(
              status.durableAt,
              messages.statusCloud,
              messages.statusCloudDated,
            )
          : momentText(
              status.durableAt,
              messages.statusFile,
              messages.statusFileDated,
            );
      default:
        return momentText(
          status.draftSavedAt,
          messages.statusLocal,
          messages.statusLocalDated,
        );
    }
  })();

  const hintText = ((): string | null => {
    if (durability === "error")
      return intl.formatMessage(
        status.draftError === "conflict"
          ? messages.hintConflict
          : messages.hintError,
      );
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

  // Desar passa pel mateix diàleg de nom que al drawer: dues portes a la
  // mateixa acció, un sol comportament
  const handleSaveToCloud = (): void => {
    setIsOpen(false);
    setIsCloudOpen(true);
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
          bottom: FLOATING_EDGE_GAP,
          right: FLOATING_EDGE_GAP,
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
              maxWidth: `calc(100vw - ${FLOATING_EDGE_GAP * 2}px)`,
              p: 1.5,
              borderRadius: `${APP_CORNER_RADIUS}px`,
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
            if (reason !== "toggle") return;

            setIsOpen(true);
            // El gest que Firefox necessita per concedir emmagatzematge
            // persistent, i el moment de l'app on demanar-lo té més sentit:
            // qui obre això està preguntant precisament on es desa la feina
            void requestPersistentStorage();
          }}
          // Tanca tot menys treure-hi el ratolí de sobre: qui l'ha obert per
          // llegir l'estat pot moure el cursor mentre llegeix
          onClose={(_event, reason) => {
            if (reason !== "mouseLeave") setIsOpen(false);
          }}
          icon={statusIcon}
          // La forma del toggle seleccionat, que és la marca de la casa: fins
          // ara era un `Fab` rodó de MUI, sense cap decisió nostra i sense
          // assemblar-se a cap dels controls que té a sota
          FabProps={{
            sx: [
              floatingControlSx(fabColor),
              { width: APP_CONTROL_SIZE, height: APP_CONTROL_SIZE },
            ],
          }}
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
              // El `small` de MUI es queda a 40, per sota de la diana mínima
              FabProps={{
                disabled: action.disabled,
                sx: [
                  floatingControlSx(),
                  { width: APP_TOUCH_TARGET_MIN, height: APP_TOUCH_TARGET_MIN },
                ],
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

      {isCloudOpen && (
        <SaveDocumentModal
          open={isCloudOpen}
          onClose={() => setIsCloudOpen(false)}
        />
      )}

      {isDownloadOpen && (
        <ModalDownload
          open={isDownloadOpen}
          onClose={() => setIsDownloadOpen(false)}
        />
      )}

      <ConfirmDialog
        open={isConfirmOpen}
        title={intl.formatMessage(messages.confirmTitle)}
        body={intl.formatMessage(messages.confirmBody)}
        confirmLabel={intl.formatMessage(messages.confirmDiscard)}
        onConfirm={startNewDocument}
        onCancel={() => setIsConfirmOpen(false)}
        alternative={{
          label: intl.formatMessage(messages.confirmDownloadFirst),
          onClick: handleDownloadFirst,
        }}
      />
    </>
  );
};

export default DocumentStatusFab;
