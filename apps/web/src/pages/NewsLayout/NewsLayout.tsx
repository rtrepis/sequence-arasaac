import React from "react";
import { Navigate, Outlet, useParams } from "react-router-dom";
import AppIntlProvider from "@app/providers/AppIntlProvider";
import NewsNavBar from "./NewsNavBar";

// Layout compartit per a la secció de notícies (/:locale/news i /:locale/news/:slug)
const NewsLayout = ({
  localeBrowser,
}: {
  localeBrowser: string;
}): React.ReactElement => {
  const { locale } = useParams<{ locale: string }>();

  // Redirigeix a la versió en espanyol si el locale no és vàlid
  if (!["ca", "es", "en", "fr", "it"].includes(locale ?? "")) {
    return <Navigate to="/es/news" replace />;
  }

  return (
    <AppIntlProvider
      locale={locale ?? localeBrowser}
      defaultLocale="es"
    >
      {/* NewsNavBar ha d'estar dins IntlProvider perquè usa FormattedMessage */}
      <NewsNavBar>
        <Outlet />
      </NewsNavBar>
    </AppIntlProvider>
  );
};

export default NewsLayout;
