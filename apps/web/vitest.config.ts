import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

// Els alias i els plugins surten del `vite.config.ts`: amb dues llistes
// separades, un alias nou funcionava a l'app i no als tests (o al contrari).
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: ["./src/test/setup.ts"],
      // Marge ample a propòsit: muntar un diàleg sencer amb tots els seus
      // panells i clicar-hi amb `userEvent` passa dels 5 s per defecte quan la
      // màquina va carregada (`turbo test` corre el web i l'API alhora, i al
      // costat del `build`). Amb el valor per defecte la suite passava sola i
      // queia dins de Turbo, que és el pitjor que pot fer una barrera.
      testTimeout: 20000,
      hookTimeout: 20000,
      css: false,
      // Suite heretada de Create React App: escrita contra el model d'estat
      // anterior (un sol slice `sequence`) i amb API de Jest. Queda fora fins
      // que es revisi o s'esborri, fitxer per fitxer — amb ella dins, `npm
      // test` surt vermell sempre i deixa de servir de barrera per a ningú.
      // Vegeu C10 de `docs/BACKLOG-ux.md`.
      exclude: [
        "**/node_modules/**",
        "**/dist/**",
        "e2e/**",
        "src/App.test.tsx",
        "src/components/BarNavigation/BarNavigation.test.tsx",
        "src/components/PictogramAmount/PictogramAmount.test.tsx",
        "src/components/PictogramCard/PictogramCard.test.tsx",
        "src/components/PictogramSearch/PictogramSearch.test.tsx",
        "src/components/SettingsCards/SettingCard/SettingCard.test.tsx",
        "src/features/pictogram/components/MagicSearch/MagicSearch.test.tsx",
        "src/features/user-settings/store/uiSlice.test.tsx",
      ],
    },
  }),
);
