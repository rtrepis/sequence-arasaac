import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import i18n from "vite-plugin-i18n";
import { transform } from "typescript";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    i18n({
      include: "src/languages/**",
      locales: ["en", "ca", "es"],
    }),
  ],
  server: { hmr: { overlay: false } },
});
