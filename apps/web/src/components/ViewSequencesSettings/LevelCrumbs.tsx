import React from "react";
import { Breadcrumbs, Link, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import messages from "./ViewLevels.lang";

export interface LevelCrumb {
  /** L'`id` del nivell a què porta */
  levelId: string;
  label: string;
}

interface LevelCrumbsProps {
  crumbs: LevelCrumb[];
  /** Obre el nivell, el porta a la vista i hi deixa el focus */
  onGo: (levelId: string) => void;
}

/**
 * Les molles de dalt de la columna de la vista: «Document › Pàgina 2 ›
 * Rutina». Queden fixes mentre es baixa per la columna i porten a cada
 * nivell; l'últim és on s'és. A prova: si funcionen, passaran a l'estàndard.
 */
const LevelCrumbs = ({
  crumbs,
  onGo,
}: LevelCrumbsProps): React.ReactElement => {
  const intl = useIntl();
  return (
    <Breadcrumbs
      aria-label={intl.formatMessage(messages.crumbs)}
      sx={{
        position: "sticky",
        // Al mòbil el verd és qui es desplaça, i té marge: les molles s'hi
        // enganxen a la vora, no a dins del marge, perquè no s'hi vegi res a sobre
        top: { xs: -12, md: 0 },
        zIndex: 1,
        // Opac: la columna passa per sota
        backgroundColor: "background.paper",
        paddingBlock: 0.5,
        "& .MuiBreadcrumbs-ol": { flexWrap: "wrap" },
      }}
    >
      {crumbs.map((crumb, index) =>
        index === crumbs.length - 1 ? (
          <Typography
            key={crumb.levelId}
            variant="body2"
            fontWeight="bold"
            aria-current="location"
            sx={{ overflowWrap: "anywhere" }}
          >
            {crumb.label}
          </Typography>
        ) : (
          <Link
            key={crumb.levelId}
            component="button"
            type="button"
            variant="body2"
            color="inherit"
            onClick={() => onGo(crumb.levelId)}
          >
            {crumb.label}
          </Link>
        ),
      )}
    </Breadcrumbs>
  );
};

export default LevelCrumbs;
