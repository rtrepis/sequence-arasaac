import { Tab, TabProps, Typography } from "@mui/material";
import React from "react";
import { appTabLabelSx, appTabSx } from "./appTabs.styled";

export interface AppTabProps extends Omit<TabProps, "label" | "icon"> {
  /** Text del tab, ja traduït: visible a partir de `sm` i nom accessible sempre. */
  label: string;
  /** Icona del tab: en mòbil és l'única cosa visible si el tab no està seleccionat. */
  icon: React.ReactElement;
  /** L'injecta el `Tabs` pare en clonar els seus fills; no s'ha de passar a mà. */
  selected?: boolean;
  /** Element de renderitzat (p. ex. `Link` de react-router). */
  component?: React.ElementType;
  /** Destí de navegació quan el tab es renderitza com a `Link`. */
  to?: string;
}

/**
 * Tab canònic de l'app: icona + text en escriptori; en mòbil, només el tab
 * seleccionat conserva el text i la resta queden en icona. Així sempre hi ha un
 * text visible que diu on és l'usuari sense malgastar amplada.
 * El nom es manté sempre a l'`aria-label`, de manera que el tab no perd mai el
 * seu nom accessible encara que el text deixi de ser visible.
 */
const AppTab = ({ label, icon, sx, ...rest }: AppTabProps): React.ReactElement => {
  // `selected` l'injecta el `Tabs` pare en clonar els seus fills
  const isSelected = Boolean(rest.selected);

  return (
    <Tab
      {...rest}
      aria-label={label}
      icon={icon}
      iconPosition="start"
      sx={[appTabSx(isSelected), ...(Array.isArray(sx) ? sx : [sx])]}
      label={
        <Typography
          variant="h6"
          component="span"
          fontWeight={600}
          sx={appTabLabelSx(isSelected)}
        >
          {label}
        </Typography>
      }
    />
  );
};

export default AppTab;
