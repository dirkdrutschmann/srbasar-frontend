import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import { resolve } from "path";

export default defineConfig({
  plugins: [vue(), vueDevTools(), sentryVitePlugin({
    org: "pronomix",
    project: "srbasar",
    url: "https://sentry.px-cloud.de/"
  })],

  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },

  server: {
    port: 5173,
    host: true
  },

  build: {
    sourcemap: true
  }
});