import React from "react";
import { IntlProvider } from "react-intl";
import { Navigate, Outlet, useParams } from "react-router-dom";
import { messageLocale } from "@/App";
import NewsNavBar from "./NewsNavBar";

// Layout compartit per a la secció de notícies (/:locale/news i /:locale/news/:slug)
const NewsLayout = ({
  localeBrowser,
}: {
  localeBrowser: string;
}): React.ReactElement => {
  const { locale } = useParams<{ locale: string }>();

  // Redirigeix a la versió en espanyol si el locale no és vàlid
  if (!["ca", "es", "en"].includes(locale ?? "")) {
    return <Navigate to="/es/news" replace />;
  }

  return (
    <IntlProvider
      locale={locale ?? localeBrowser}
      defaultLocale="es"
      messages={messageLocale[(locale ?? localeBrowser) as "ca" | "es" | "en"]}
    >
      {/* NewsNavBar ha d'estar dins IntlProvider perquè usa FormattedMessage */}
      <NewsNavBar>
        <Outlet />
      </NewsNavBar>
    </IntlProvider>
  );
};

export default NewsLayout;
