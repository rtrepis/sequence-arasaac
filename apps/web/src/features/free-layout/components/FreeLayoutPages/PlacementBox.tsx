import React, { useId, useState } from "react";
import {
  Box,
  Divider,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Menu,
  MenuItem,
} from "@mui/material";
import { MdCheck, MdOutlineRemoveCircleOutline } from "react-icons/md";
import { useIntl } from "react-intl";
import { useAppDispatch } from "@/app/hooks";
import { useFeedback } from "@/context/FeedbackContext";
import PictogramCard from "@components/PictogramCard/PictogramCard";
import type { PictogramCardDefaults, Sequence } from "@/types/sequence";
import type {
  PlacementColumns,
  SequencePlacement,
  SequenceViewSettings,
} from "@/types/document";
import { mmToPixelsExact, pixelsToMM } from "@features/print/utils/pageUnits";
import { CSS_PRINT_DPI } from "@features/print/utils/pageFormat";
import {
  printColors,
  sheetGuide,
  sheetSurface,
  sheetWarning,
} from "@/style/palette";
import { computeGrid } from "@features/free-layout/model/computeGrid";
import {
  copyPlacementToSheetThunk,
  removePlacementThunk,
  setPlacementColumnsThunk,
  setPlacementCommonThunk,
} from "@features/free-layout/store/freeLayoutThunks";
import { ALIGN_H, ALIGN_V } from "@shared/constants/alignmentMaps";
import type { CardBaseSize } from "./CardBaseMeasurer";
import messages from "./FreeLayoutPages.lang";

/** Columnes fixes que s'ofereixen, com a molt: més enllà, «Automàtic» ja ho fa. */
const MAX_COLUMN_CHOICES = 8;

/**
 * La targeta a mida 1 abans que el mesurador digui res (o on no pot mesurar,
 * com a les proves): l'amplada de la targeta amb vora i una línia de text.
 */
const FALLBACK_CARD_PX: CardBaseSize = { w: 182, h: 210 };

/** L'espai entre targetes a mida 1, en px: el `pictSpaceBetween` és en unitats de 8 px, com al flux. */
const SPACE_UNIT_PX = 8;

const px = (mm: number): number => mmToPixelsExact(mm, CSS_PRINT_DPI);

/** Marques d'edició damunt del full: mai al paper ni al PDF. */
const editMarkSx = {
  "@media print": { display: "none" },
} as const;

interface PlacementBoxProps {
  placement: SequencePlacement;
  /** La pàgina on es pinta (una comuna es pinta a totes) */
  sheetIndex: number;
  sheetCount: number;
  common: boolean;
  name: string;
  pictograms: Sequence;
  view: SequenceViewSettings;
  cardBase: CardBaseSize | undefined;
  defaults: PictogramCardDefaults;
}

/**
 * Una seqüència posada en una pàgina: la caixa, amb la graella de pictogrames
 * que hi cap (mana la caixa, ADR-005), i el menú de les seves accions.
 *
 * La caixa és un botó que obre el menú: «A totes les pàgines», «Copia a la
 * pàgina», «Columnes» i «Treu d'aquesta pàgina». Moure-la i redimensionar-la
 * és la fase 4 (`docs/PLA-mode-lliure.md`). El contorn, les marques i el focus
 * són de l'edició: no surten mai al paper ni al PDF.
 */
const PlacementBox = ({
  placement,
  sheetIndex,
  sheetCount,
  common,
  name,
  pictograms,
  view,
  cardBase,
  defaults,
}: PlacementBoxProps): React.ReactElement => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { showSnackbar } = useFeedback();
  const menuId = useId();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const card = cardBase && cardBase.w > 0 ? cardBase : FALLBACK_CARD_PX;
  const grid = computeGrid({
    count: pictograms.length,
    card: {
      w: pixelsToMM(card.w, CSS_PRINT_DPI),
      h: pixelsToMM(card.h, CSS_PRINT_DPI),
    },
    gap: pixelsToMM(
      Math.max(0, view.pictSpaceBetween) * SPACE_UNIT_PX,
      CSS_PRINT_DPI,
    ),
    box: { w: placement.w, h: placement.h },
    columns: placement.columns,
  });
  // L'espai negatiu del flux (fins a -2) aquí no té sentit: la graella el pren a 0
  const gapPx = Math.max(0, view.pictSpaceBetween) * SPACE_UNIT_PX * grid.size;

  const close = () => setAnchor(null);
  const run = (action: () => void) => {
    close();
    action();
  };

  const columnChoices: PlacementColumns[] = [
    "auto",
    ...Array.from(
      { length: Math.min(pictograms.length, MAX_COLUMN_CHOICES) },
      (_, i) => i + 1,
    ),
  ];

  const label = intl.formatMessage(messages.placementLabel, {
    name,
    count: pictograms.length,
    common: String(common),
  });

  return (
    <>
      <Box
        role="button"
        tabIndex={0}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={anchor !== null}
        aria-controls={anchor ? menuId : undefined}
        onClick={(event) => setAnchor(event.currentTarget)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setAnchor(event.currentTarget);
          }
        }}
        sx={{
          position: "absolute",
          left: px(placement.x),
          top: px(placement.y),
          width: px(placement.w),
          height: px(placement.h),
          display: "grid",
          gridTemplateColumns: `repeat(${Math.max(1, grid.columns)}, max-content)`,
          columnGap: `${gapPx}px`,
          rowGap: `${gapPx}px`,
          justifyContent: ALIGN_H[view.alignmentH],
          alignContent: ALIGN_V[view.alignmentV],
          alignItems: "start",
          cursor: "pointer",
          outline: "none",
          "&:hover .placement-guide, &:focus-visible .placement-guide": {
            borderStyle: "solid",
            borderWidth: 3,
          },
        }}
      >
        {pictograms.map((pictogram) => (
          <PictogramCard
            key={`${pictogram.indexSequence}_${pictogram.img.selectedId}`}
            pictogram={pictogram}
            view="complete"
            defaults={defaults}
            variant="plane"
            size={{ pictSize: grid.size, scale: 1 }}
          />
        ))}

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
          {grid.belowMinimum && (
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

        <Divider />
        <ListSubheader>{intl.formatMessage(messages.columns)}</ListSubheader>
        {columnChoices.map((columns) => {
          const checked = placement.columns === columns;
          return (
            <MenuItem
              key={`columns-${columns}`}
              role="menuitemradio"
              aria-checked={checked}
              onClick={() =>
                run(() => {
                  dispatch(setPlacementColumnsThunk(placement.id, columns));
                  showSnackbar({
                    message: intl.formatMessage(messages.columnsChanged, {
                      columns: String(columns),
                    }),
                    severity: "success",
                  });
                })
              }
            >
              <ListItemIcon>{checked && <MdCheck />}</ListItemIcon>
              <ListItemText>
                {columns === "auto"
                  ? intl.formatMessage(messages.columnsAuto)
                  : columns}
              </ListItemText>
            </MenuItem>
          );
        })}

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
    </>
  );
};

export default PlacementBox;
