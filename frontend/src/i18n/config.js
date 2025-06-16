import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import uzLatn from './locales/uz-Latn.json';
import uzCyrl from './locales/uz-Cyrl.json';

const resources = {
  'uz-Latn': {
    translation: uzLatn
  },
  'uz-Cyrl': {
    translation: uzCyrl
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'uz-Latn',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    }
  });

export default i18n;