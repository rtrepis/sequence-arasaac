import { Box, ButtonBase, Collapse, Paper, Typography } from "@mui/material";
import { AiOutlineSetting } from "react-icons/ai";
import React, { useId, useState } from "react";
import { APP_TOUCH_TARGET_MIN } from "@/style/appShape";
import { settingsContent, settingsList } from "./SettingAccordion.styled";

interface SettingAccordionProps {
  children: React.ReactElement | React.ReactElement[] | undefined;
  /** Nom accessible del botó que obre i tanca («Configuració, personalitzat») */
  label: string;
  /**
   * Estat que la capçalera diu amb text (p. ex. «Personalitzat»). Sense estat,
   * la icona queda centrada, com sempre; amb estat, passa a l'esquerra.
   */
  status?: string;
  /**
   * Acció que va al costat del botó de la capçalera, **mai a dins**: un botó
   * dins d'un altre no es pot fer servir amb el teclat ni amb el lector.
   */
  statusAction?: React.ReactNode;
  /** El botó de la capçalera: on va el focus quan l'acció desapareix */
  summaryRef?: React.Ref<HTMLButtonElement>;
}

/**
 * Secció plegable del formulari d'edició del pictograma. Abans era un
 * `Accordion` de MUI amb un `IconButton` dins de la capçalera, que ja és un
 * botó: dos botons un dins l'altre. Ara la capçalera és un sol botó (amb
 * `aria-expanded` i `aria-controls`), i l'acció d'estat n'és germana.
 */
const SettingAccordion = ({
  children,
  label,
  status,
  statusAction,
  summaryRef,
}: SettingAccordionProps): React.ReactElement => {
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  const buttonId = `${id}-summary`;
  const regionId = `${id}-region`;

  return (
    <Paper variant="outlined" sx={settingsList}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, pr: 1 }}>
        <ButtonBase
          ref={summaryRef}
          id={buttonId}
          aria-expanded={expanded}
          aria-controls={regionId}
          aria-label={label}
          onClick={() => setExpanded((open) => !open)}
          sx={{
            flex: 1,
            minHeight: APP_TOUCH_TARGET_MIN,
            px: 2,
            gap: 1,
            // Sense estat, la icona al mig com sempre; amb estat, a l'esquerra
            justifyContent: status ? "flex-start" : "center",
            fontSize: "2rem",
          }}
        >
          <AiOutlineSetting aria-hidden />
          {status && (
            <Typography component="span" variant="body2" fontWeight="bold">
              {status}
            </Typography>
          )}
        </ButtonBase>
        {statusAction}
      </Box>
      <Collapse in={expanded}>
        <Box
          id={regionId}
          role="region"
          aria-labelledby={buttonId}
          sx={settingsContent}
        >
          {children}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default SettingAccordion;
