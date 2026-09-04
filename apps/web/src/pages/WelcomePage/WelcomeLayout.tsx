import React from "react";
import { IntlProvider } from "react-intl";
import { useParams } from "react-router-dom";
import WelcomePage from "./WelcomePage";
import { messageLocale } from "@/App";
import BackendWakeUpNotice from "@features/backend/api/BackendWakeUpNotice";

const WelcomeLayout = ({ localeBrowser }: { localeBrowser: string }) => {
  const { locale } = useParams<{ locale: string }>();

  return (
    <IntlProvider
      locale={locale ?? localeBrowser}
      defaultLocale="es"
      messages={messageLocale[locale ?? localeBrowser]}
    >
      <WelcomePage />
      {/* La pantalla d'inici és on es fa el primer login del dia, i per tant on
          el desvetllament de Render és més probable: sense l'avís aquí, entrar
          des d'aquí deixava el formulari mig minut sense dir res —justament el
          cas que l'avís existeix per cobrir. La resta de layouts ja el porten */}
      <BackendWakeUpNotice />
    </IntlProvider>
  );
};

export default WelcomeLayout;
