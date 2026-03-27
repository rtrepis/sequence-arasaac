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
      "@features": path.resolve(__dirname, "src/features"),
      "@shared": path.resolve(__dirname, "src/shared"),
      "@app": path.resolve(__dirname, "src/app"),
      "@components": path.resolve(__dirname, "src/components"),
    },
  },
  server: {
    hmr: { overlay: false },
    // Proxy /api al backend Express en dev per evitar problemes CORS amb cookies httpOnly
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
