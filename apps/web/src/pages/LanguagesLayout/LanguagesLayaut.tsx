import React from "react";
import { IntlProvider } from "react-intl";
import { Navigate, Outlet, useParams } from "react-router-dom";
import BarNavigation from "@/components/BarNavigation/BarNavigation";
import EmailVerificationBanner from "@features/backend/auth/components/EmailVerificationBanner";
import BackendWakeUpNotice from "@features/backend/api/BackendWakeUpNotice";
import DocumentDraftSync from "@features/sequence/components/DocumentDraftSync";
import { messageLocale } from "@/App";

const LanguageLayout = ({ localeBrowser }: { localeBrowser: string }) => {
  const { locale } = useParams<{ locale: string }>();

  if (!["ca", "es", "en", "fr", "it"].includes(locale || "")) {
    return <Navigate to="/es/create-sequence" replace />;
  }

  return (
    <IntlProvider
      locale={locale ?? localeBrowser}
      defaultLocale="es"
      messages={messageLocale[locale as keyof typeof messageLocale]}
    >
      {/* Autodesat de l'esborrany: va al layout perquè és l'únic lloc que
          embolcalla l'editor i el visualitzador alhora, i perquè necessita
          l'IntlProvider per poder avisar si el navegador no pot desar */}
      <DocumentDraftSync />
      <BarNavigation>
        {/* L'avís de verificació va aquí i no dins de cada pàgina: així apareix
            tant a l'editor com al visualitzador sense duplicar-lo */}
        <EmailVerificationBanner />
        <Outlet />
        {/* Va al layout i no a index.tsx perquè necessita l'IntlProvider, i aquest és
            l'únic lloc de l'app on l'usuari fa crides al backend (entrar, desar, carregar) */}
        <BackendWakeUpNotice />
      </BarNavigation>
    </IntlProvider>
  );
};

export default LanguageLayout;
