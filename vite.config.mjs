import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from 'node:path';
import versionPlugin from './vite.version.plugin';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), versionPlugin()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    host: true,
    port: 3000,
  },
  build: {
    outDir: resolve(__dirname, 'vue'),
    emptyOutDir: true,
    chunkSizeWarningLimit: 1600,
    cors: false,
    rollupOptions: {
      output: {
        entryFileNames: "assets/[name].[hash].js",
        chunkFileNames: "assets/[name].[hash].js",
        assetFileNames: "assets/[name].[hash].[ext]",
      },
    },
  },
});
