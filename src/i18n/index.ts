import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { getDeviceAppLanguage } from "./config";
import { deTranslations } from "./resources/de";
import { enTranslations } from "./resources/en";
import { esTranslations } from "./resources/es";
import { frTranslations } from "./resources/fr";
import { itTranslations } from "./resources/it";
import { ptTranslations } from "./resources/pt";
import { trTranslations } from "./resources/tr";

const deviceLanguage = getDeviceAppLanguage();

// eslint-disable-next-line import/no-named-as-default-member
i18n.use(initReactI18next).init({
  compatibilityJSON: "v4",
  resources: {
    en: { translation: enTranslations },
    tr: { translation: trTranslations },
    de: { translation: deTranslations },
    es: { translation: esTranslations },
    fr: { translation: frTranslations },
    it: { translation: itTranslations },
    pt: { translation: ptTranslations },
  },
  lng: deviceLanguage,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

export default i18n;
