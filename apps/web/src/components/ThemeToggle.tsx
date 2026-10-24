import { useTranslation } from 'react-i18next';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useThemeMode } from '../theme/themeModeContext';

export function ThemeToggle() {
  const { t } = useTranslation();
  const { mode, toggleMode } = useThemeMode();

  return (
    <Tooltip title={t('theme.toggleAria')}>
      <IconButton onClick={toggleMode} aria-label={t('theme.toggleAria')} size="small">
        {mode === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
      </IconButton>
    </Tooltip>
  );
}
