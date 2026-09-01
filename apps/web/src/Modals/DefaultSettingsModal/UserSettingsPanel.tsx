import { FormattedMessage } from "react-intl";
import SettingCardLang from "../../components/SettingsCards/SettingCardOptions/lang/SettingCardLang";
import SettingCardLangAppToggle from "../../components/SettingsCards/SettingCardOptions/lang/SettingCardLangAppToggle";
import SettingCardTheme from "../../components/SettingsCards/SettingCardTheme/SettingCardTheme";
import SettingCardImageQuality from "../../components/SettingsCards/SettingCardImageQuality/SettingCardImageQuality";
import {
  SectionTitle,
  SettingsPanelHint,
  SettingsPanelLayout,
} from "../../components/SettingsLayout";
import AccountStorageSummary from "@features/backend/user-settings/components/AccountStorageSummary";
import AccountImagesList from "@features/backend/user-settings/components/AccountImagesList";
import { useAppSelector } from "../../app/hooks";
import messages from "./UserSettingsPanel.lang";
import React from "react";

const UserSettingsPanel = (): React.ReactElement => {
  // L'espai i les imatges són del compte: sense sessió no hi ha cap límit a
  // ensenyar ni cap imatge al núvol, i una secció buida només faria preguntar
  // què hi falta
  const isAuthenticated = useAppSelector(
    (state) => state.auth.accessToken !== null,
  );

  return (
    // Sense mostra, però amb el mateix layout que la resta de tabs: la columna
    // d'ajustos ha de caure al mateix lloc i amb la mateixa amplada a tot arreu
    <SettingsPanelLayout
      hint={
        // Guia del tab: què s'ajusta aquí
        <SettingsPanelHint>
          <FormattedMessage {...messages.panelHint} />
        </SettingsPanelHint>
      }
    >
      <SectionTitle title={<FormattedMessage {...messages.sectionLanguage} />}>
        <SettingCardLangAppToggle />
        <SettingCardLang setting="languagesSearch" />
      </SectionTitle>

      <SectionTitle
        title={<FormattedMessage {...messages.sectionAppearance} />}
      >
        <SettingCardTheme />
      </SectionTitle>

      {/* La qualitat val també sense compte: mana sobre el pes de l'esborrany
          d'aquest navegador i sobre el que s'imprimeix */}
      <SectionTitle title={<FormattedMessage {...messages.sectionImages} />}>
        <SettingCardImageQuality />
      </SectionTitle>

      {isAuthenticated && (
        <SectionTitle title={<FormattedMessage {...messages.sectionStorage} />}>
          <AccountStorageSummary />
          <AccountImagesList />
        </SectionTitle>
      )}
    </SettingsPanelLayout>
  );
};

export default UserSettingsPanel;
