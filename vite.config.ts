import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => ({
  plugins: [
    react({
      jsxImportSource: "react",
    }),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      "#": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    port: 5173,
    strictPort: true,
    host: true,
    open: false,
    hmr: {
      overlay: true,
    },
  },

  preview: {
    port: 4173,
    strictPort: true,
    host: true,
    open: false,
  },

  build: {
    sourcemap: true,
    target: "esnext",
    minify: "oxc",
    cssMinify: "lightningcss",
    cssTarget: "chrome120",
    modulePreload: {
      polyfill: true,
    },
    cssCodeSplit: true,
    chunkSizeWarningLimit: 500,
    assetsInlineLimit: 4096,

    rollupOptions: {
      treeshake: {
        moduleSideEffects: "no-external",
        propertyReadSideEffects: false,
      },

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

          return undefined;
        },

        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },

    reportCompressedSize: true,
    emptyOutDir: true,
  },

  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom"],
    exclude: [],
  },

  define: {
    "process.env.NODE_ENV": JSON.stringify(mode),
  },
}));
