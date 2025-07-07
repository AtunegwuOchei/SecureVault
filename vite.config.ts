// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer()
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    middlewareMode: true,
    // Explicitly set hmr to an object with clientPort: null to disable client-side WS connection
    hmr: {
      clientPort: null, // This tells Vite's client not to try connecting via WebSocket
    },
    allowedHosts: [
      "411d76d3-1f86-4d42-9b6f-9db0e512fdcf-00-26t1rmmq2zd9x.spock.replit.dev",
      '*'
    ],
    proxy: {
      '/api': {
        target: 'https://411d76d3-1f86-4d42-9b6f-9db0e512fdcf-00-26t1rmmq2zd9x.spock.replit.dev',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});