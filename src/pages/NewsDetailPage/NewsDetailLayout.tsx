import React from "react";
import { IntlProvider } from "react-intl";
import NewsDetailPage from "./NewsDetailPage";
import { messageLocale } from "/src/App";

// Layout wrapper amb IntlProvider (patró de WelcomeLayout)
const NewsDetailLayout = ({
  localeBrowser,
}: {
  localeBrowser: string;
}): React.ReactElement => {
  return (
    <IntlProvider
      locale={localeBrowser}
      defaultLocale="es"
      messages={messageLocale[localeBrowser]}
    >
      <NewsDetailPage />
    </IntlProvider>
  );
};

export default NewsDetailLayout;
