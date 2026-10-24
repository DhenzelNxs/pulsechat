import { useTranslation } from 'react-i18next';

export function ChatHomePage() {
  const { t } = useTranslation();

  return (
    <div className="flex h-full items-center justify-center text-slate-400">
      <p>{t('chat.selectOrStart')}</p>
    </div>
  );
}
