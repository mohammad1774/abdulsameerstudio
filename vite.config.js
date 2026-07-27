import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";

export default defineConfig({
  appType: "mpa",
  base: "/",
  build: {
    assetsInlineLimit: 0,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        home: fileURLToPath(new URL("./index.html", import.meta.url)),
        notFound: fileURLToPath(new URL("./404.html", import.meta.url)),
      },
    },
    sourcemap: false,
    target: "es2022",
  },
  preview: {
    host: "127.0.0.1",
    port: 4173,
    strictPort: true,
  },
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
  },
});
