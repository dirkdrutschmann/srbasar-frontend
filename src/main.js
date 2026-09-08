import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import VueGoodTablePlugin from "vue-good-table-next";
import * as Sentry from "@sentry/vue";

// Styles
import "vue-good-table-next/dist/vue-good-table-next.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "vue-multiselect/dist/vue-multiselect.css";
import "@vuepic/vue-datepicker/dist/main.css";
import "./styles/globals.css";
import "./styles/app.css";

// Font Awesome
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";

library.add(fas, fab, far);

const app = createApp(App);

const resolveSampleRate = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const tracePropagationTargets = ["localhost"];

if (import.meta.env.VITE_API_BASE_URL) {
  try {
    const apiOrigin = new URL(import.meta.env.VITE_API_BASE_URL).origin;
    tracePropagationTargets.push(apiOrigin);
  } catch {
    // Ignore malformed API URLs and fall back to defaults
  }
}

Sentry.init({
  app,
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  release: import.meta.env.VITE_APP_VERSION ? `srbasar_frontend@${import.meta.env.VITE_APP_VERSION}` : undefined,
  // Keep PII disabled by default; can be re-enabled via env when needed
  sendDefaultPii: import.meta.env.VITE_SENTRY_SEND_DEFAULT_PII === "true",
  integrations: [
    Sentry.browserTracingIntegration({ router }),
    Sentry.replayIntegration()
  ],
  tracesSampleRate: resolveSampleRate(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE),
  tracePropagationTargets,
  replaysSessionSampleRate: resolveSampleRate(import.meta.env.VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE),
  replaysOnErrorSampleRate: resolveSampleRate(import.meta.env.VITE_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE)
});

app.component("font-awesome-icon", FontAwesomeIcon);

app.use(createPinia());
app.use(router);
app.use(VueGoodTablePlugin);

app.mount("#app");
