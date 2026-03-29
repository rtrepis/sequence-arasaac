import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import i18n from "vite-plugin-i18n";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  build: { chunkSizeWarningLimit: 2000 },
  plugins: [
    react(),
    i18n({
      include: "src/languages/**",
      locales: ["en", "ca", "es", "fr", "it"],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: { hmr: { overlay: false } },
});
