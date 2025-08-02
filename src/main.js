import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import VueGoodTablePlugin from "vue-good-table-next";
import JsonExcel from "vue-json-excel3";;
import debounce from "./directives/debounce.js";

// Styles
import "vue-good-table-next/dist/vue-good-table-next.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "maz-ui/css/main.css";
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

app.component("font-awesome-icon", FontAwesomeIcon);
app.component("downloadExcel", JsonExcel);

// Register global directives
app.directive("debounce", debounce);
app.use(createPinia());
app.use(router);
app.use(VueGoodTablePlugin);

app.mount("#app");
