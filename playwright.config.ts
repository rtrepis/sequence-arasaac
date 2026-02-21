import { defineConfig, devices } from "@playwright/test";

// Configuració de Playwright per fer captures i vídeos de la notícia multiple-sequences
export default defineConfig({
  testDir: "./e2e",
  timeout: 600000,
  use: {
    baseURL: "http://localhost:5173",
    viewport: { width: 1280, height: 800 },
    // Captura vídeo per a tots els tests (s'usa per als passos del view)
    video: "off",
    // Mode headless per defecte; usar --headed per veure el navegador
    headless: true,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
