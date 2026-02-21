import React from "react";
import { IntlProvider } from "react-intl";
import ChangelogPage from "./ChangelogPage";
import { messageLocale } from "/src/App";

// Layout wrapper amb IntlProvider (patró de NewsDetailLayout)
const ChangelogLayout = ({
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
      <ChangelogPage />
    </IntlProvider>
  );
};

export default ChangelogLayout;
