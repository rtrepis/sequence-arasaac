import { defineConfig } from "vitest/config";

// Configuració pròpia: sense ella, Vitest pujaria fins al vite.config.ts de
// l'arrel del repositori, que és del web antic i no té res a veure amb aquest paquet
export default defineConfig({
  test: {
    environment: "node",
  },
});
