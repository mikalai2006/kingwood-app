// https://vue-i18n.intlify.dev/installation.html#package-managers
import { createI18n } from "vue-i18n";

import ru from "@/locales/ru.json";

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: "ru",
  fallbackLocale: "ru",
  messages: { ru },
  pluralRules: {
    ru: function (choice, choicesLength) {
      if (choice === 0) {
        return 0; // For zero
      }
      const teen = choice > 10 && choice < 20;
      const endsWithOne = choice % 10 === 1;

      if (choicesLength < 4) {
        // Simplified rule for cases with fewer than 4 forms
        return !teen && endsWithOne ? 1 : 2;
      }

      // Standard Russian pluralization rules
      if (!teen && endsWithOne) {
        return 1; // For 1, 21, 31, etc. (except 11)
      }
      if (!teen && choice % 10 >= 2 && choice % 10 <= 4) {
        return 2; // For 2, 3, 4, 22, 23, 24, etc. (except 12, 13, 14)
      }
      return 3; // For 0, 5-9, 10-20, 25-30, etc.
    },
  },
});

// declare module '@vue/runtime-core' {
//   export interface ComponentCustomProperties {
//     $i18nRoute: (to: any) => any
//     $i18nPath: (to: any) => any
//   }
// }
