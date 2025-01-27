import React from "react";
import { IntlProvider } from "react-intl";
import { useParams } from "react-router-dom";
import WelcomePage from "./WelcomePage";
import { messageLocale } from "/src/App";

const WelcomeLayout = ({ localeBrowser }: { localeBrowser: string }) => {
  const { locale } = useParams<{ locale: string }>();

  return (
    <IntlProvider
      locale={locale ?? localeBrowser}
      defaultLocale="es"
      messages={messageLocale[locale ?? localeBrowser]}
    >
      <WelcomePage />
    </IntlProvider>
  );
};

export default WelcomeLayout;
