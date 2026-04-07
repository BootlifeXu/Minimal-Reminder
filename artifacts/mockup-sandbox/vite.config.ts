import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { mockupPreviewPlugin } from "./mockupPreviewPlugin";

export default defineConfig(({ command }) => {
  const isBuild = command === 'build';

  const rawPort = process.env.PORT;

  if (!isBuild && !rawPort) {
    throw new Error(
      "PORT environment variable is required but was not provided.",
    );
  }

  const port = rawPort ? Number(rawPort) : 3000;

  if (!isBuild && (Number.isNaN(port) || port <= 0)) {
    throw new Error(`Invalid PORT value: "${rawPort}"`);
  }

  const basePath = process.env.BASE_PATH || (isBuild ? "/" : undefined);

  if (!isBuild && !basePath) {
    throw new Error(
      "BASE_PATH environment variable is required but was not provided.",
    );
  }

  const plugins = [
    mockupPreviewPlugin(),
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
  ];

  // Note: cartographer plugin removed for build compatibility

  return {
    base: basePath,
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "src"),
      },
    },
    root: path.resolve(import.meta.dirname),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist"),
      emptyOutDir: true,
    },
    server: isBuild ? {} : {
      port,
      host: "0.0.0.0",
      allowedHosts: true,
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
    },
    preview: isBuild ? {} : {
      port,
      host: "0.0.0.0",
      allowedHosts: true,
    },
  };
});
