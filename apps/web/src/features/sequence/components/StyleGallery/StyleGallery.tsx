// La Galeria d'estils (pla dels estils, pas 5; fonament 03, §1 i §5): d'on es
// tria l'estil d'una seqüència.
//
// - **La primera opció és «L'estil del document»**: treu l'estil de la
//   seqüència, que torna a fer servir el del document.
// - **El meu estil**, i el lloc dels **estils de l'app**, buit fins al pas 9.
// - Cada estil, amb una **mostra**: un pictograma de la seqüència, sense els
//   seus retocs, pintat amb aquell estil.
// - A cada estil, «Desa en un fitxer» (D18) i, si no és el meu, «Fes-lo el meu
//   estil» (D7).
// - «Carrega d'un fitxer…» aplica l'estil d'un `.saacstyle` (o d'un `.saac`) a
//   la seqüència i prou: **no es queda** a la galeria (D17).
//
// Triar un estil el **copia** al document: si el meu estil canvia després, la
// seqüència no canvia (direcció única). És una llista, i per això és un
// `AppDialog` d'amplada `sm` (`docs/estandards/capes-flotants.md`).
import React, { ChangeEvent, useId, useRef, useState } from "react";
import {
  Box,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  MdCheck,
  MdMoreVert,
  MdOutlineFileDownload,
  MdOutlineFileOpen,
  MdOutlinePalette,
} from "react-icons/md";
import { useIntl } from "react-intl";
import { useStore } from "react-redux";
import type { RootState } from "@/app/store";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { AppDialog, AppDialogActions } from "@components/AppDialog";
import StyledButton from "@/style/StyledButton";
import { APP_TOUCH_TARGET_MIN } from "@/style/appShape";
import PictogramCard from "@components/PictogramCard/PictogramCard";
import ModalDownload from "@components/ButtonWithModalDownload/ModalDownload";
import confirmMessages from "@components/ConfirmDialog/ConfirmDialog.lang";
import { useFeedback } from "@/context/FeedbackContext";
import feedbackMessages from "@/context/FeedbackContext/FeedbackContext.lang";
import SettingsSaveErrorDialog from "@features/backend/user-settings/components/SettingsSaveErrorDialog";
import type { SequenceStyle } from "@/types/document";
import type { PictSequence } from "@/types/sequence";
import { SAAC_FILE_ACCEPT } from "@features/sequence/saac/types";
import { parseSaac } from "@features/sequence/saac/parse";
import { parseContextOf } from "@features/sequence/saac/saacContext";
import {
  namedStyleFrom,
  namedStyleOf,
  sameNamedContent,
  styleWithNamed,
} from "@features/sequence/style/namedStyle";
import {
  cardDefaultsOf,
  resetPictogramStyle,
} from "@features/sequence/style/pictogramStyle";
import { resolveDocumentStyle } from "@features/sequence/style/styleModel";
import {
  selectDocumentStyle,
  selectUserDefaultStyle,
} from "@features/sequence/style/styleSelectors";
import { chooseSequenceStyleThunk } from "@features/sequence/store/sequenceStyleThunks";
import { useSetDefaultStyle } from "@features/sequence/hooks/useSetDefaultStyle";
import { readText } from "@features/sequence/hooks/useOpenSaacFile";
import messages from "./StyleGallery.lang";

/** El pictograma de mostra quan la seqüència no en té cap amb imatge */
const SAMPLE_PICTOGRAM_ID = 6009;

/** La mida de la targeta de mostra, respecte de la de la graella */
const SAMPLE_PICT_SIZE = 0.45;

interface StyleGalleryProps {
  open: boolean;
  onClose: () => void;
  /** La seqüència a qui es tria l'estil */
  sequenceKey: number;
  /** El nom de la seqüència, que és el distintiu del títol */
  sequenceName: string;
}

/** Una opció de la galeria. */
interface GalleryOption {
  key: string;
  /** El nom que veu l'usuari, que és el que s'escriu al document */
  name: string;
  /** Segona línia, si cal dir d'on ve */
  description?: string;
  /** L'estil que es pinta i es copia */
  style: SequenceStyle;
  /** Triar-lo treu l'estil de la seqüència («L'estil del document») */
  isDocument: boolean;
  selected: boolean;
  /** S'hi ofereix «Fes-lo el meu estil» */
  canMakeMine: boolean;
}

/** Nom del fitxer sense l'extensió: el nom d'un estil carregat sense títol */
const fileBaseName = (name: string): string =>
  name.replace(/\.[^.]+$/, "").trim();

const StyleGallery = ({
  open,
  onClose,
  sequenceKey,
  sequenceName,
}: StyleGalleryProps): React.ReactElement => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const store = useStore<RootState>();
  const { showSnackbar } = useFeedback();
  const titleId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setAsDefault, retry, failure, isRetrying, dismissError } =
    useSetDefaultStyle();

  const documentStyle = useAppSelector(selectDocumentStyle);
  const myStyle = useAppSelector(selectUserDefaultStyle);
  const documentStyleName = useAppSelector((state) => state.document.styleName);
  const styles = useAppSelector((state) => state.document.styles);
  const currentId = useAppSelector(
    (state) => state.document.sequenceStyleIds?.[sequenceKey],
  );
  const pictograms = useAppSelector(
    (state) => state.document.content[sequenceKey],
  );

  // El menú de més accions d'un estil, i l'estil que es desa en un fitxer
  const [menu, setMenu] = useState<{
    anchor: HTMLElement;
    option: GalleryOption;
  } | null>(null);
  const [saving, setSaving] = useState<GalleryOption | null>(null);

  const current = namedStyleOf(styles, currentId);
  const myStyleName = intl.formatMessage(messages.myStyle);
  const isMyStyleCurrent =
    current !== undefined &&
    sameNamedContent(
      current,
      namedStyleFrom(myStyle, { id: current.id, name: current.name }),
    );

  // L'estil que fa servir la seqüència, si no és cap dels de la galeria (un de
  // carregat d'un fitxer, o un d'un altre document): surt a dalt i marcat,
  // perquè s'hi vegi d'on es parteix
  const currentOutside: GalleryOption[] =
    current !== undefined && !isMyStyleCurrent
      ? [
          {
            key: "current",
            name: current.name,
            style: styleWithNamed(documentStyle, current),
            isDocument: false,
            selected: true,
            canMakeMine: true,
          },
        ]
      : [];

  const options: { group?: string; items: GalleryOption[] }[] = [
    ...(currentOutside.length > 0
      ? [
          {
            group: intl.formatMessage(messages.currentGroup),
            items: currentOutside,
          },
        ]
      : []),
    {
      items: [
        {
          key: "document",
          name: intl.formatMessage(messages.documentStyle),
          // El nom de l'estil del document, si en té («El meu estil»…)
          ...(documentStyleName && { description: documentStyleName }),
          style: documentStyle,
          isDocument: true,
          selected: current === undefined,
          canMakeMine: true,
        },
      ],
    },
    {
      group: intl.formatMessage(messages.myStyleGroup),
      items: [
        {
          key: "mine",
          name: myStyleName,
          style: myStyle,
          isDocument: false,
          selected: isMyStyleCurrent,
          canMakeMine: false,
        },
      ],
    },
  ];

  // La mostra: el primer pictograma amb imatge de la seqüència, sense els
  // seus retocs, perquè s'hi vegi l'estil i no el que s'ha retocat
  const sourcePictogram = pictograms?.find(
    (pict) => pict.img.selectedId > 0 || pict.img.url,
  );
  const sample: PictSequence = sourcePictogram
    ? { ...resetPictogramStyle(sourcePictogram), indexSequence: 0 }
    : {
        indexSequence: 0,
        img: {
          searched: {
            word: intl.formatMessage(messages.sampleWord),
            bestIdPicts: [],
          },
          selectedId: SAMPLE_PICTOGRAM_ID,
          settings: {},
        },
        settings: {},
        cross: false,
      };

  const choose = (name: string, style?: SequenceStyle) => {
    dispatch(
      chooseSequenceStyleThunk(sequenceKey, { name, ...(style && { style }) }),
    );
    onClose();
  };

  const handleChoose = (option: GalleryOption) => {
    // El d'ara ja és el de la seqüència: tornar-lo a copiar només en faria
    // una còpia sencera amb un altre nom
    if (option.key === "current") onClose();
    else if (option.isDocument) choose(documentStyleName ?? option.name);
    else choose(option.name, option.style);
  };

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Es buida perquè es pugui tornar a triar el mateix fitxer
    event.target.value = "";
    if (!file) return;
    const context = parseContextOf(store.getState());
    let parsed: ReturnType<typeof parseSaac>;
    try {
      parsed = parseSaac(await readText(file), context);
    } catch (error) {
      console.error(error);
      parsed = { kind: "invalid" };
    }
    if (parsed.kind === "invalid") {
      showSnackbar({
        message: intl.formatMessage(feedbackMessages.loadInvalidFile),
        severity: "error",
      });
      return;
    }
    // D'un document, només l'estil: el seu, amb el nom que porti
    const style =
      parsed.kind === "style"
        ? parsed.style
        : resolveDocumentStyle(parsed.document, context.userDefault);
    const name =
      (parsed.kind === "style"
        ? parsed.title
        : (parsed.document.styleName ?? parsed.document.title)) ||
      fileBaseName(file.name);
    choose(name, style);
  };

  const closeMenu = () => setMenu(null);

  const optionRow = (option: GalleryOption) => {
    const defaults = cardDefaultsOf(option.style);
    const actionsLabel = intl.formatMessage(messages.styleActions, {
      name: option.name,
    });
    return (
      <ListItem
        key={option.key}
        disablePadding
        secondaryAction={
          <Tooltip title={actionsLabel}>
            <IconButton
              edge="end"
              aria-label={actionsLabel}
              aria-haspopup="menu"
              onClick={(event) =>
                setMenu({ anchor: event.currentTarget, option })
              }
              sx={{
                minWidth: APP_TOUCH_TARGET_MIN,
                minHeight: APP_TOUCH_TARGET_MIN,
              }}
            >
              <MdMoreVert aria-hidden />
            </IconButton>
          </Tooltip>
        }
      >
        <ListItemButton
          selected={option.selected}
          aria-current={option.selected ? "true" : undefined}
          onClick={() => handleChoose(option)}
          sx={{ gap: 2, borderRadius: 1, pr: 7 }}
        >
          {/* La mostra és damunt del full: no s'adapta al tema, i el lector
              de pantalla no l'ha de llegir (el nom ja diu l'estil) */}
          <Box aria-hidden sx={{ flexShrink: 0, pointerEvents: "none" }}>
            <PictogramCard
              pictogram={sample}
              defaults={defaults}
              view="complete"
              size={{ pictSize: SAMPLE_PICT_SIZE }}
            />
          </Box>
          <ListItemText
            primary={option.name}
            secondary={
              option.selected
                ? intl.formatMessage(messages.inUse)
                : option.description
            }
          />
          {option.selected && (
            <ListItemIcon sx={{ minWidth: 0 }}>
              <MdCheck aria-hidden size={24} />
            </ListItemIcon>
          )}
        </ListItemButton>
      </ListItem>
    );
  };

  return (
    <>
      <AppDialog
        open={open}
        onClose={onClose}
        title={intl.formatMessage(messages.title)}
        titleId={titleId}
        describedById={`${titleId}-for`}
        maxWidth="sm"
        actions={
          <AppDialogActions
            // L'acció que no és ni acceptar ni cancel·lar, sola a l'esquerra
            startAction={
              <StyledButton
                variant="outlined"
                color="inherit"
                startIcon={<MdOutlineFileOpen aria-hidden />}
                onClick={() => fileInputRef.current?.click()}
              >
                {intl.formatMessage(messages.loadFromFile)}
              </StyledButton>
            }
          >
            <StyledButton color="inherit" onClick={onClose}>
              {intl.formatMessage(confirmMessages.cancel)}
            </StyledButton>
          </AppDialogActions>
        }
      >
        {/* Per a quina seqüència: el distintiu del títol és per a un número,
            i el nom d'una seqüència pot ser llarg */}
        <Typography id={`${titleId}-for`} variant="body2" sx={{ mb: 1 }}>
          {intl.formatMessage(messages.forSequence, { name: sequenceName })}
        </Typography>
        {options.map(({ group, items }, index) => (
          <List
            key={group ?? `group-${index}`}
            dense
            subheader={
              group ? (
                <ListSubheader disableSticky sx={{ bgcolor: "transparent" }}>
                  {group}
                </ListSubheader>
              ) : undefined
            }
          >
            {items.map(optionRow)}
          </List>
        ))}

        {/* Els estils de l'app arriben al pas 9 del pla: el lloc ja hi és */}
        <List
          dense
          subheader={
            <ListSubheader disableSticky sx={{ bgcolor: "transparent" }}>
              {intl.formatMessage(messages.appStylesGroup)}
            </ListSubheader>
          }
        >
          <ListItem>
            <Typography variant="body2" color="text.secondary">
              {intl.formatMessage(messages.appStylesEmpty)}
            </Typography>
          </ListItem>
        </List>

        <input
          ref={fileInputRef}
          type="file"
          hidden
          accept={SAAC_FILE_ACCEPT}
          onChange={(event) => void handleFile(event)}
          data-testid="style-gallery-file"
        />
      </AppDialog>

      <Menu
        anchorEl={menu?.anchor}
        open={menu !== null}
        onClose={closeMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem
          sx={{ minHeight: APP_TOUCH_TARGET_MIN }}
          onClick={() => {
            if (menu) setSaving(menu.option);
            closeMenu();
          }}
        >
          <ListItemIcon>
            <MdOutlineFileDownload aria-hidden />
          </ListItemIcon>
          <ListItemText>{intl.formatMessage(messages.saveToFile)}</ListItemText>
        </MenuItem>
        {menu?.option.canMakeMine && (
          <MenuItem
            sx={{ minHeight: APP_TOUCH_TARGET_MIN }}
            onClick={() => {
              // No toca el document obert: només el meu estil
              setAsDefault(menu.option.style, { withView: false });
              closeMenu();
            }}
          >
            <ListItemIcon>
              <MdOutlinePalette aria-hidden />
            </ListItemIcon>
            <ListItemText>
              {intl.formatMessage(messages.makeMyStyle)}
            </ListItemText>
          </MenuItem>
        )}
      </Menu>

      {saving && (
        <ModalDownload
          kind="style"
          open
          style={saving.style}
          styleTitle={
            saving.isDocument ? (documentStyleName ?? saving.name) : saving.name
          }
          onClose={() => setSaving(null)}
        />
      )}

      <SettingsSaveErrorDialog
        failure={failure}
        isRetrying={isRetrying}
        onRetry={retry}
        onDismiss={dismissError}
      />
    </>
  );
};

export default StyleGallery;
