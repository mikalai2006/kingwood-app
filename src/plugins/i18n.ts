// https://vue-i18n.intlify.dev/installation.html#package-managers
import { createI18n } from "vue-i18n";

import ru from "@/locales/ru.json";

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: "ru",
  fallbackLocale: "ru",
  messages: { ru },
});

// declare module '@vue/runtime-core' {
//   export interface ComponentCustomProperties {
//     $i18nRoute: (to: any) => any
//     $i18nPath: (to: any) => any
//   }
// }
