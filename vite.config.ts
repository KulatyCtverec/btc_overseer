import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  optimizeDeps: {
    include: ["react-is"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("recharts")) return "recharts";
        },
      },
    },
    chunkSizeWarningLimit: 600,
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
    react({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
    tailwindcss(),
  ],
});
