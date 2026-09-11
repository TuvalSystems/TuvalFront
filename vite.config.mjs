import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from 'node:path';
import versionPlugin from './vite.version.plugin';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const apiProxy = {
    target: env.VITE_API_BASE_URL,
    changeOrigin: true,
    cookieDomainRewrite: '',
  };
  return {
    plugins: [vue(), versionPlugin()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: {
      host: true,
      port: 3000,
      proxy: {
        '/api': apiProxy,
        '/sanctum': apiProxy,
      },
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
  };
});
