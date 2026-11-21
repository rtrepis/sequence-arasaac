import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Alert, Link } from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { NewsItem, newsItems } from "../../data/newsItems";
import messages from "./SupersededNotice.lang";

/**
 * L'avís d'una notícia superada: diu de quan és i, si n'hi ha, enllaça a la
 * que explica com és ara. Sense marca, no pinta res
 */
const SupersededNotice = ({
  item,
  locale,
}: {
  item: NewsItem;
  locale: string;
}): React.ReactElement | null => {
  const intl = useIntl();
  if (!item.superseded) return null;

  const replacement = newsItems.find(
    (other) => other.slug === item.superseded?.replacedBy,
  );
  // La data és la de publicació, al migdia perquè cap fus horari no la mogui de dia
  const date = intl.formatDate(new Date(`${item.date}T12:00:00`), {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    // `note` i no `alert`: és part de la pàgina, no un avís urgent que s'hagi d'anunciar
    <Alert
      severity="info"
      variant="outlined"
      role="note"
      sx={{ width: "100%" }}
    >
      <FormattedMessage {...messages.notice} values={{ date }} />
      {replacement && (
        <>
          {" "}
          <FormattedMessage {...messages.replacedBy} />{" "}
          <Link
            component={RouterLink}
            to={`/${locale}/news/${replacement.slug}`}
          >
            <FormattedMessage id={replacement.titleId} />
          </Link>
        </>
      )}
    </Alert>
  );
};

export default SupersededNotice;
