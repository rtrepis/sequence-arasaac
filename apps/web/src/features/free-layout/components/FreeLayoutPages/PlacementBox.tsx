import React, { useId, useState } from "react";
import {
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import {
  MdCheck,
  MdMoreVert,
  MdOutlineRemoveCircleOutline,
} from "react-icons/md";
import { useIntl } from "react-intl";
import { useAppDispatch } from "@/app/hooks";
import { useFeedback } from "@/context/FeedbackContext";
import type { Theme } from "@mui/material";
import type { SystemStyleObject } from "@mui/system";
import type { BoxedPlacement } from "@features/free-layout/model/placement";
import { mmToPixelsExact } from "@features/print/utils/pageUnits";
import { CSS_PRINT_DPI } from "@features/print/utils/pageFormat";
import {
  printColors,
  sheetGuide,
  sheetSurface,
  sheetWarning,
} from "@/style/palette";
import {
  copyPlacementToSheetThunk,
  removePlacementThunk,
  setPlacementCommonThunk,
} from "@features/free-layout/store/freeLayoutThunks";
import messages from "./FreeLayoutPages.lang";

/** El botó del menú, a la pantalla, en px: el full s'escala, el botó no. */
const MENU_BUTTON_PX = 36;

export const px = (mm: number): number => mmToPixelsExact(mm, CSS_PRINT_DPI);

/** Marques d'edició damunt del full: mai al paper ni al PDF. */
export const editMarkSx = {
  "@media print": { display: "none" },
} as const;

interface PlacementBoxProps {
  placement: BoxedPlacement;
  /** La pàgina on es pinta (una comuna es pinta a totes) */
  sheetIndex: number;
  sheetCount: number;
  common: boolean;
  /** El nom del bloc als missatges: el de la seqüència o el text del rètol */
  name: string;
  /** El nom accessible de la caixa, que la selecciona */
  label: string;
  /** El nom accessible del botó del menú */
  actionsLabel: string;
  /** La marca «no hi cap»: els pictogrames passarien per sota del mínim */
  belowMinimum?: boolean;
  /** Com es col·loca el contingut dins de la caixa */
  contentSx: SystemStyleObject<Theme>;
  /** L'escala del full a la pantalla: el botó del menú es pinta a mida de pantalla */
  scale: number;
  selected: boolean;
  onSelect: () => void;
  /** El contingut: les targetes d'una seqüència o el text d'un rètol */
  children: React.ReactNode;
}

/**
 * Un bloc en una pàgina: la caixa, amb el seu contingut (`SequenceBlock`,
 * `TextBlock`), i el menú de les seves accions.
 *
 * Clicar la caixa (o Enter i Espai) la **selecciona** (R5): es marca i la
 * columna n'ensenya els ajustos. El menú («A totes les pàgines», «Copia a la
 * pàgina», «Columnes», «Treu d'aquesta pàgina») és al botó del costat, que és
 * germà de la caixa i no fill: un botó dins d'un altre no es pot fer servir
 * amb el teclat. El contorn, les marques i el botó són de l'edició: no surten
 * mai al paper ni al PDF.
 */
const PlacementBox = ({
  placement,
  sheetIndex,
  sheetCount,
  common,
  name,
  label,
  actionsLabel,
  belowMinimum = false,
  contentSx,
  scale,
  selected,
  onSelect,
  children,
}: PlacementBoxProps): React.ReactElement => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { showSnackbar } = useFeedback();
  const menuId = useId();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const close = () => setAnchor(null);
  const run = (action: () => void) => {
    close();
    action();
  };

  // A mida de pantalla: dins del full escalat, es divideix per l'escala
  const buttonPx = MENU_BUTTON_PX / Math.max(scale, 0.01);

  return (
    <Box
      className="placement"
      sx={{
        position: "absolute",
        left: px(placement.x),
        top: px(placement.y),
        width: px(placement.w),
        height: px(placement.h),
        "&:hover .placement-menu, &:focus-within .placement-menu": {
          opacity: 1,
        },
      }}
    >
      <Box
        role="button"
        tabIndex={0}
        aria-label={label}
        aria-pressed={selected}
        onClick={(event) => {
          // El clic fora de cap caixa treu la selecció: aquest no hi ha d'arribar
          event.stopPropagation();
          onSelect();
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSelect();
          }
        }}
        sx={{
          position: "absolute",
          inset: 0,
          ...contentSx,
          cursor: "pointer",
          outline: "none",
          ...(!selected && {
            "&:hover .placement-guide, &:focus-visible .placement-guide": {
              borderStyle: "solid",
              borderWidth: 3,
            },
          }),
        }}
      >
        {children}

        {/* El contorn i les marques, per damunt de les targetes */}
        <Box
          className="placement-guide"
          aria-hidden
          data-html2canvas-ignore
          sx={{
            ...editMarkSx,
            position: "absolute",
            inset: 0,
            border: `1px dashed ${sheetGuide}`,
            pointerEvents: "none",
            display: "flex",
            // El bloc seleccionat, amb la vora sencera i gruixuda
            ...(selected && {
              borderStyle: "solid",
              borderWidth: 4,
            }),
            alignItems: "flex-start",
            gap: 0.5,
            padding: 0.5,
          }}
        >
          {common && (
            <Box
              component="span"
              sx={{
                fontSize: 11,
                lineHeight: 1.6,
                paddingInline: 0.75,
                borderRadius: 1,
                color: sheetSurface,
                backgroundColor: printColors.text,
              }}
            >
              {intl.formatMessage(messages.commonMark)}
            </Box>
          )}
          {belowMinimum && (
            <Box
              component="span"
              sx={{
                fontSize: 11,
                lineHeight: 1.6,
                paddingInline: 0.75,
                borderRadius: 1,
                color: sheetSurface,
                backgroundColor: sheetWarning,
              }}
            >
              {intl.formatMessage(messages.placementTooSmall)}
            </Box>
          )}
        </Box>
      </Box>

      {/* El menú del bloc: es veu amb el bloc seleccionat, en passar-hi per
          sobre o amb el focus; amb el teclat, s'hi arriba just després */}
      <Tooltip title={actionsLabel}>
        <IconButton
          className="placement-menu"
          data-html2canvas-ignore
          aria-label={actionsLabel}
          aria-haspopup="menu"
          aria-expanded={anchor !== null}
          aria-controls={anchor ? menuId : undefined}
          onClick={(event) => {
            event.stopPropagation();
            setAnchor(event.currentTarget);
          }}
          sx={{
            ...editMarkSx,
            position: "absolute",
            top: 0,
            right: 0,
            width: buttonPx,
            height: buttonPx,
            fontSize: buttonPx * 0.6,
            opacity: selected || anchor ? 1 : 0,
            color: sheetSurface,
            backgroundColor: sheetGuide,
            borderRadius: 0,
            "&:hover, &:focus-visible": { backgroundColor: sheetGuide },
          }}
        >
          <MdMoreVert />
        </IconButton>
      </Tooltip>

      <Menu
        id={menuId}
        anchorEl={anchor}
        open={anchor !== null}
        onClose={close}
        MenuListProps={{ "aria-label": name }}
      >
        <MenuItem
          role="menuitemcheckbox"
          aria-checked={common}
          onClick={() =>
            run(() => {
              dispatch(
                setPlacementCommonThunk(placement.id, !common, sheetIndex),
              );
              // Treure-la de totes té el seu propi snackbar, amb «Desfés»
              if (!common)
                showSnackbar({
                  message: intl.formatMessage(messages.madeCommon, { name }),
                  severity: "success",
                });
            })
          }
        >
          <ListItemIcon>{common && <MdCheck />}</ListItemIcon>
          <ListItemText>
            {intl.formatMessage(messages.onEveryPage)}
          </ListItemText>
        </MenuItem>

        {!common && sheetCount > 1 && <Divider />}
        {!common && sheetCount > 1 && (
          <ListSubheader>
            {intl.formatMessage(messages.copyToPage)}
          </ListSubheader>
        )}
        {!common &&
          Array.from({ length: sheetCount }, (_, index) => index)
            .filter((index) => index !== sheetIndex)
            .map((index) => (
              <MenuItem
                key={`copy-${index}`}
                onClick={() =>
                  run(() => {
                    dispatch(copyPlacementToSheetThunk(placement.id, index));
                    showSnackbar({
                      message: intl.formatMessage(messages.copiedToPage, {
                        name,
                        number: index + 1,
                      }),
                      severity: "success",
                    });
                  })
                }
              >
                <ListItemIcon />
                <ListItemText>
                  {intl.formatMessage(messages.pageNumber, {
                    number: index + 1,
                  })}
                </ListItemText>
              </MenuItem>
            ))}

        {/* L'acció que treu, sola i l'última (`feedback-i-accions.md`) */}
        <Divider />
        <MenuItem
          onClick={() =>
            run(() => dispatch(removePlacementThunk(placement.id)))
          }
          sx={{ color: "error.main" }}
        >
          <ListItemIcon sx={{ color: "inherit" }}>
            <MdOutlineRemoveCircleOutline />
          </ListItemIcon>
          <ListItemText>
            {intl.formatMessage(
              common ? messages.removeFromEveryPage : messages.removeFromPage,
            )}
          </ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default PlacementBox;
