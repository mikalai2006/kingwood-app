import { createApp, markRaw } from "vue";

import router from "./router";
import { createPinia } from "pinia";
import { i18n } from "./plugins/i18n";

import { VueRecaptchaPlugin } from "vue-recaptcha/head";

import App from "./App.vue";

import "./style.css";

// import "./demos/ipc";
// If you want use Node.js, the`nodeIntegration` needs to be enabled in the Main process.
// import './demos/node'
const pinia = createPinia();

const app = createApp(App);
app.use(router);

app.use(VueRecaptchaPlugin, {
  v2SiteKey: import.meta.env.VITE_RECAPTCHA2,
});

pinia.use(({ store }) => {
  store.router = markRaw(router);
});

app.use(i18n);
app.use(pinia);
app.mount("#app").$nextTick(() => {
  postMessage({ payload: "removeLoading" }, "*");
});
