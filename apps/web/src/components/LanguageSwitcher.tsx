import { useTranslation } from 'react-i18next';
import FormControl from '@mui/material/FormControl';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useLanguage } from '../hooks/useLanguage';

export function LanguageSwitcher() {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();

  const handleChange = (event: SelectChangeEvent) => {
    setLanguage(event.target.value as 'pt' | 'en');
  };

  return (
    <FormControl size="small" variant="standard">
      <Select value={language} onChange={handleChange} disableUnderline inputProps={{ 'aria-label': t('language.label') }}>
        <MenuItem value="pt">{t('language.pt')}</MenuItem>
        <MenuItem value="en">{t('language.en')}</MenuItem>
      </Select>
    </FormControl>
  );
}
