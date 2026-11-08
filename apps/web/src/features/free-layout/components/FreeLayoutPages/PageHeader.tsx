import React, { useId, useState } from "react";
import {
  Box,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { MdOutlineLibraryAdd, MdTitle } from "react-icons/md";
import { useIntl } from "react-intl";
import { useAppDispatch } from "@/app/hooks";
import { useFeedback } from "@/context/FeedbackContext";
import StyledButton from "@/style/StyledButton";
import StyledIconButton from "@/style/StyledIconButton";
import { addTextBlockThunk } from "@features/free-layout/store/freeLayoutThunks";
import { useViewSelection } from "@features/free-layout/hooks/useViewSelection";
import PageActionsMenu from "./PageActionsMenu";
import messages from "./FreeLayoutPages.lang";

interface PageHeaderProps {
  sheetIndex: number;
  sheetCount: number;
  /** Una pàgina contínua s'omple amb seqüències; una en blocs, amb blocs */
  continuous?: boolean;
  /** La pàgina que segueix la columna (R5) */
  active?: boolean;
  onAddSequence: () => void;
  /** Clicar el títol: la pàgina, a dalt de tot i tan gran com hi càpiga */
  onFocusPage?: () => void;
}

/**
 * La capçalera d'una pàgina del mode lliure, a sobre del full: quina pàgina
 * és, el botó d'afegir (una seqüència a una pàgina contínua, un bloc a una en
 * blocs) i el menú de la pàgina, on hi ha totes les seves accions. Al mòbil
 * el botó d'afegir només porta la icona, amb el tooltip. No s'imprimeix: és
 * fora del full.
 */
const PageHeader = ({
  sheetIndex,
  sheetCount,
  continuous = false,
  active = false,
  onAddSequence,
  onFocusPage,
}: PageHeaderProps): React.ReactElement => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const narrow = useMediaQuery(theme.breakpoints.down("sm"));
  const { showSnackbar } = useFeedback();
  const { select } = useViewSelection();
  const addMenuId = useId();
  const [addAnchor, setAddAnchor] = useState<HTMLElement | null>(null);
  const number = sheetIndex + 1;
  const title = intl.formatMessage(messages.pageLabel, {
    number,
    total: sheetCount,
  });

  const addLabel = intl.formatMessage(
    continuous ? messages.addSequence : messages.addBlock,
  );
  const handleAdd = (event: React.MouseEvent<HTMLElement>) => {
    if (continuous) onAddSequence();
    else setAddAnchor(event.currentTarget);
  };
  const addProps = {
    color: "inherit" as const,
    "aria-haspopup": continuous ? undefined : ("menu" as const),
    "aria-expanded": continuous ? undefined : addAnchor !== null,
    "aria-controls": addAnchor ? addMenuId : undefined,
    onClick: handleAdd,
  };

  return (
    <Stack
      direction="row"
      alignItems="center"
      gap={1}
      sx={{ "@media print": { display: "none" } }}
    >
      <Typography
        component="h2"
        variant="subtitle1"
        sx={{ flexGrow: 1, minWidth: 0 }}
      >
        <Box
          component="button"
          type="button"
          onClick={onFocusPage}
          sx={{
            all: "unset",
            cursor: onFocusPage ? "pointer" : "default",
            display: "inline-flex",
            alignItems: "center",
            gap: 0.75,
            fontWeight: active ? "bold" : undefined,
            borderRadius: 1,
            "&:focus-visible": {
              outline: 2,
              outlineStyle: "solid",
              outlineColor: "primary.main",
            },
          }}
        >
          {/* El punt de la pàgina activa, del verd primari del marc que l'envolta */}
          {active && (
            <Box
              component="span"
              aria-hidden
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: "primary.main",
              }}
            />
          )}
          {title}
        </Box>
      </Typography>

      {narrow ? (
        // Al mòbil, només la icona; el nom, al tooltip (pressió llarga)
        <Tooltip title={addLabel}>
          <StyledIconButton aria-label={addLabel} {...addProps}>
            <MdOutlineLibraryAdd />
          </StyledIconButton>
        </Tooltip>
      ) : (
        <StyledButton startIcon={<MdOutlineLibraryAdd />} {...addProps}>
          {addLabel}
        </StyledButton>
      )}
      <Menu
        id={addMenuId}
        anchorEl={addAnchor}
        open={addAnchor !== null}
        onClose={() => setAddAnchor(null)}
        MenuListProps={{ "aria-label": addLabel }}
      >
        <MenuItem
          onClick={() => {
            setAddAnchor(null);
            onAddSequence();
          }}
        >
          <ListItemIcon>
            <MdOutlineLibraryAdd />
          </ListItemIcon>
          <ListItemText>
            {intl.formatMessage(messages.addSequenceBlock)}
          </ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAddAnchor(null);
            const placementId = dispatch(addTextBlockThunk(sheetIndex));
            select({ kind: "block", placementId, sheetIndex });
            showSnackbar({
              message: intl.formatMessage(messages.textBlockAdded, { number }),
              severity: "success",
            });
          }}
        >
          <ListItemIcon>
            <MdTitle />
          </ListItemIcon>
          <ListItemText>
            {intl.formatMessage(messages.addTextBlock)}
          </ListItemText>
        </MenuItem>
      </Menu>

      <PageActionsMenu
        sheetIndex={sheetIndex}
        sheetCount={sheetCount}
        onAddSequence={onAddSequence}
      />
    </Stack>
  );
};

export default PageHeader;
