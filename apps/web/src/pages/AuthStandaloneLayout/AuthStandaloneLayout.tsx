// Layout compartit per a les pàgines d'autenticació que viuen fora de
// LanguageLayout (signup, forgot-password, set-password): els proveeix el
// <AppIntlProvider> que necessiten per fer servir useIntl/FormattedMessage.
//
// set-password no porta :locale a la URL (l'enllaç el construeix el backend,
// que no sap l'idioma), així que el fallback a localeBrowser és imprescindible
// per a aquesta ruta — mateix patró que LanguageLayout i WelcomeLayout.
import React from "react";
import { Outlet, useParams } from "react-router-dom";
import AppIntlProvider from "@app/providers/AppIntlProvider";
import BackendWakeUpNotice from "@features/backend/api/BackendWakeUpNotice";

const AuthStandaloneLayout = ({
  localeBrowser,
}: {
  localeBrowser: string;
}): React.ReactElement => {
  const { locale } = useParams<{ locale: string }>();
  const resolvedLocale = locale ?? localeBrowser;

  return (
    <AppIntlProvider
      locale={resolvedLocale}
      defaultLocale="es"
    >
      <Outlet />
      {/* Aquestes pàgines també criden el backend (signup, set-password) i en
          poden patir el desvetllament; aquí no els arriba des de LanguageLayout. */}
      <BackendWakeUpNotice />
    </AppIntlProvider>
  );
};

export default AuthStandaloneLayout;
