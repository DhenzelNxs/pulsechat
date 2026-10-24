import { useTranslation } from 'react-i18next';
import { useLanguage } from '../hooks/useLanguage';

export function LanguageSwitcher() {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();

  return (
    <select
      value={language}
      onChange={(event) => setLanguage(event.target.value as 'pt' | 'en')}
      aria-label={t('language.label')}
      className="rounded border border-slate-300 bg-transparent px-2 py-1 text-sm text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
    >
      <option value="pt">{t('language.pt')}</option>
      <option value="en">{t('language.en')}</option>
    </select>
  );
}
