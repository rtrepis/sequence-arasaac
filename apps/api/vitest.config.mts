import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    // Han de córrer abans de qualsevol import de l'app: config/env.ts atura
    // el procés si li falta una variable obligatòria
    setupFiles: ["./src/test/setupEnv.ts"],
    // Els tests que toquen base de dades arrenquen un MongoDB en memòria:
    // el temps per defecte de 5 s no arriba per a la primera arrencada
    testTimeout: 30000,
    hookTimeout: 60000,
    // Un sol procés: tots els tests comparteixen la mateixa instància de Mongo
    // i els models de Mongoose, que són globals per procés
    fileParallelism: false,
  },
});
