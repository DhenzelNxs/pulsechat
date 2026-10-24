import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { LANGUAGE_STORAGE_KEY, type Language } from '../i18n/config';

export function useLanguage() {
  const { i18n } = useTranslation();
  const language = (i18n.resolvedLanguage ?? 'pt') as Language;

  const setLanguage = useCallback(
    (next: Language) => {
      void i18n.changeLanguage(next);
      try {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
      } catch {}
    },
    [i18n],
  );

  return { language, setLanguage };
}
