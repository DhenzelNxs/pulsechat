import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export function ChatHomePage() {
  const { t } = useTranslation();

  return (
    <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
      <Typography color="text.secondary">{t('chat.selectOrStart')}</Typography>
    </Box>
  );
}
