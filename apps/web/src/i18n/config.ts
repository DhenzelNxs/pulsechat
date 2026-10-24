import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import pt from './locales/pt.json';
import en from './locales/en.json';

export const LANGUAGE_STORAGE_KEY = 'pulsechat-language';
export type Language = 'pt' | 'en';

function getInitialLanguage(): Language {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored === 'pt' || stored === 'en') {
      return stored;
    }
  } catch {}

  return 'pt';
}

void i18n.use(initReactI18next).init({
  resources: {
    pt: { translation: pt },
    en: { translation: en },
  },
  lng: getInitialLanguage(),
  fallbackLng: 'pt',
  interpolation: { escapeValue: false },
});

export default i18n;
