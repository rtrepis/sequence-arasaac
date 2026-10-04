import { defineConfig } from "vitest/config";

// Configuració pròpia: les proves del paquet corren a Node i no han d'heretar
// res de cap altre workspace
export default defineConfig({
  test: {
    environment: "node",
  },
});
