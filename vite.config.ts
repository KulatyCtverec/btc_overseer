import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";

// https://vite.dev/config/
export default defineConfig({
  optimizeDeps: {
    include: ["react-is"],
  },
  server: {
    proxy: {
      "/api/bitcoin-charts": {
        target: "https://charts.bitcoin.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/bitcoin-charts/, "/api/v1"),
      },
      "/api/fear-greed": {
        target: "https://api.alternative.me",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/fear-greed/, ""),
      },
    },
  },
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ],
});
