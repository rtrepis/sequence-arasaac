import React from "react";
import { Box } from "@mui/material";
import { MdArrowDownward } from "react-icons/md";
import { useIntl } from "react-intl";
import StyledButton from "@/style/StyledButton";
import { VIEW_BLOCK_LEVEL_ID } from "@features/free-layout/hooks/useViewSelection";
import messages from "./BlockSettingsLink.lang";

/**
 * Al mòbil la columna és sota les pàgines, i seleccionar un bloc no mou la
 * pàgina (P9 de l'esbós): l'enllaç, a sobre del full, és qui hi porta. Baixa
 * fins al nivell «Bloc» i hi deixa el focus. No s'imprimeix: és fora del full.
 */
const BlockSettingsLink = (): React.ReactElement => {
  const intl = useIntl();

  const goToBlockSettings = () => {
    const level = document.getElementById(VIEW_BLOCK_LEVEL_ID);
    if (!level) return;
    level.scrollIntoView({ behavior: "smooth", block: "start" });
    // El focus va al botó que plega el nivell, que és el seu títol
    level.querySelector<HTMLElement>("[aria-expanded]")?.focus({
      preventScroll: true,
    });
  };

  return (
    <Box sx={{ "@media print": { display: "none" } }}>
      <StyledButton
        color="inherit"
        startIcon={<MdArrowDownward />}
        onClick={goToBlockSettings}
      >
        {intl.formatMessage(messages.goToBlockSettings)}
      </StyledButton>
    </Box>
  );
};

export default BlockSettingsLink;
