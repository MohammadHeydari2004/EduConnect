import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

const __dirname =
  import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname);

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "#": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    sourcemap: true,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (
              id.includes("/react/") ||
              id.includes("/react-dom/") ||
              id.includes("/react-router-dom/")
            ) {
              return "react-vendor";
            }

            if (id.includes("/recharts/") || id.includes("/d3-")) {
              return "chart-vendor";
            }

            return "vendor";
          }
        },
      },
    },
  },
});
