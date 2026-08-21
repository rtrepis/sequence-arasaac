// Layout compartit per a les pàgines d'autenticació que viuen fora de
// LanguageLayout (signup, forgot-password, set-password): els proveeix el
// <IntlProvider> que necessiten per fer servir useIntl/FormattedMessage.
//
// set-password no porta :locale a la URL (l'enllaç el construeix el backend,
// que no sap l'idioma), així que el fallback a localeBrowser és imprescindible
// per a aquesta ruta — mateix patró que LanguageLayout i WelcomeLayout.
import React from "react";
import { IntlProvider } from "react-intl";
import { Outlet, useParams } from "react-router-dom";
import { messageLocale } from "@/App";

const AuthStandaloneLayout = ({
  localeBrowser,
}: {
  localeBrowser: string;
}): React.ReactElement => {
  const { locale } = useParams<{ locale: string }>();
  const resolvedLocale = locale ?? localeBrowser;

  return (
    <IntlProvider
      locale={resolvedLocale}
      defaultLocale="es"
      messages={messageLocale[resolvedLocale as keyof typeof messageLocale]}
    >
      <Outlet />
    </IntlProvider>
  );
};

export default AuthStandaloneLayout;
