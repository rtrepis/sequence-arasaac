import React from "react";
import { IntlProvider } from "react-intl";
import { Navigate, Outlet, useParams } from "react-router-dom";
import BarNavigation from "/src/components/BarNavigation/BarNavigation";
import { messageLocale } from "/src/App";

const LanguageLayout = ({ localeBrowser }: { localeBrowser: string }) => {
  const { locale } = useParams<{ locale: string }>();

  if (!["ca", "es", "en"].includes(locale || "")) {
    return <Navigate to="/es/create-sequence" replace />;
  }

  return (
    <IntlProvider
      locale={locale ?? localeBrowser}
      defaultLocale="es"
      messages={messageLocale[locale ?? localeBrowser]}
    >
      <BarNavigation>
        <Outlet />
      </BarNavigation>
    </IntlProvider>
  );
};

export default LanguageLayout;
