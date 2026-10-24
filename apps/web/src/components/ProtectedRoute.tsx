import { useTranslation } from 'react-i18next';
import { Navigate, Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useSession } from '../features/auth/useSession';

export function ProtectedRoute() {
  const { t } = useTranslation();
  const { data: user, isLoading } = useSession();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          height: '100vh',
          color: 'text.secondary',
        }}
      >
        <CircularProgress size={28} />
        <Typography variant="body2">{t('protectedRoute.loading')}</Typography>
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
