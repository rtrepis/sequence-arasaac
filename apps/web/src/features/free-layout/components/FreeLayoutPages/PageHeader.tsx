import React, { useId, useState } from "react";
import {
  Box,
  ListSubheader,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import { MdOutlineDashboard, MdOutlineLibraryAdd } from "react-icons/md";
import { useIntl } from "react-intl";
import { useAppDispatch } from "@/app/hooks";
import StyledButton from "@/style/StyledButton";
import { sheetGuide } from "@/style/palette";
import { templatesFor } from "@features/free-layout/model/templates";
import { applyTemplateThunk } from "@features/free-layout/store/freeLayoutThunks";
import PageActionsMenu from "./PageActionsMenu";
import { TEMPLATE_NAMES } from "./templateNames";
import messages from "./FreeLayoutPages.lang";

interface PageHeaderProps {
  sheetIndex: number;
  sheetCount: number;
  /** Les caixes pròpies de la pàgina, sense les comunes */
  placementCount: number;
  /** La pàgina que segueix la columna (R5) */
  active?: boolean;
  onAddSequence: () => void;
}

/**
 * La capçalera d'una pàgina del mode lliure, a sobre del full: quina pàgina
 * és, «Afegeix una seqüència», les plantilles i el menú de la pàgina
 * (duplicar, moure, esborrar). No s'imprimeix: és fora del full.
 */
const PageHeader = ({
  sheetIndex,
  sheetCount,
  placementCount,
  active = false,
  onAddSequence,
}: PageHeaderProps): React.ReactElement => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const templateMenuId = useId();
  const [templateAnchor, setTemplateAnchor] = useState<HTMLElement | null>(
    null,
  );
  const templates = templatesFor(placementCount);
  const number = sheetIndex + 1;

  return (
    <Stack
      direction="row"
      alignItems="center"
      flexWrap="wrap"
      gap={1}
      sx={{ "@media print": { display: "none" } }}
    >
      <Typography
        component="h2"
        variant="subtitle1"
        sx={{ flexGrow: 1, fontWeight: active ? "bold" : undefined }}
      >
        {/* El punt de la pàgina activa, del color de la guia que l'envolta */}
        {active && (
          <Box
            component="span"
            aria-hidden
            sx={{ color: sheetGuide, marginInlineEnd: 0.75 }}
          >
            ●
          </Box>
        )}
        {intl.formatMessage(messages.pageLabel, {
          number,
          total: sheetCount,
        })}
      </Typography>

      <StyledButton
        color="inherit"
        startIcon={<MdOutlineLibraryAdd />}
        onClick={onAddSequence}
      >
        {intl.formatMessage(messages.addSequence)}
      </StyledButton>

      {placementCount > 0 && (
        <StyledButton
          color="inherit"
          startIcon={<MdOutlineDashboard />}
          aria-haspopup="menu"
          aria-expanded={templateAnchor !== null}
          aria-controls={templateAnchor ? templateMenuId : undefined}
          onClick={(event) => setTemplateAnchor(event.currentTarget)}
        >
          {intl.formatMessage(messages.template)}
        </StyledButton>
      )}
      <Menu
        id={templateMenuId}
        anchorEl={templateAnchor}
        open={templateAnchor !== null}
        onClose={() => setTemplateAnchor(null)}
      >
        <ListSubheader>
          {intl.formatMessage(messages.templateMenuTitle)}
        </ListSubheader>
        {templates.length === 0 && (
          <MenuItem disabled>
            {intl.formatMessage(messages.templateNone)}
          </MenuItem>
        )}
        {templates.map((template) => (
          <MenuItem
            key={template.id}
            onClick={() => {
              setTemplateAnchor(null);
              // Substitueix els retocs de la pàgina: surt el snackbar amb «Desfés»
              dispatch(applyTemplateThunk(sheetIndex, template));
            }}
          >
            {intl.formatMessage(TEMPLATE_NAMES[template.id])}
          </MenuItem>
        ))}
      </Menu>

      <PageActionsMenu sheetIndex={sheetIndex} sheetCount={sheetCount} />
    </Stack>
  );
};

export default PageHeader;
