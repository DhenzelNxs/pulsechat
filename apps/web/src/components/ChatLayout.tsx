import { useTranslation } from 'react-i18next';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import { RoomList } from '../features/rooms/RoomList';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useLogout } from '../features/auth/useLogout';
import { useSession } from '../features/auth/useSession';
import { displayName, initials } from '../lib/displayName';

export function ChatLayout() {
  const { t } = useTranslation();
  const location = useLocation();
  const hasActiveRoom = location.pathname.startsWith('/rooms/');
  const navigate = useNavigate();
  const logout = useLogout();
  const { data: currentUser } = useSession();

  const handleLogout = () => {
    logout.mutate(undefined, { onSuccess: () => navigate('/login') });
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
      <Box
        component="aside"
        sx={{
          width: { xs: '100%', md: 320 },
          flexShrink: { md: 0 },
          display: { xs: hasActiveRoom ? 'none' : 'flex', md: 'flex' },
          flexDirection: 'column',
          borderRight: 1,
          borderColor: 'divider',
        }}
      >
        <RoomList />
        <Divider />
        {currentUser && (
          <Stack direction="row" spacing={1.5} sx={{ px: 2, pt: 2, alignItems: 'center' }}>
            <Avatar sx={{ width: 32, height: 32, fontSize: '0.75rem' }}>{initials(currentUser)}</Avatar>
            <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
              {displayName(currentUser)}
            </Typography>
          </Stack>
        )}
        <Stack direction="row" sx={{ p: 2, alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <ThemeToggle />
            <LanguageSwitcher />
          </Stack>
          <Button size="small" color="inherit" onClick={handleLogout}>
            {t('logout')}
          </Button>
        </Stack>
      </Box>

      <Box
        component="main"
        sx={{
          flex: 1,
          display: { xs: hasActiveRoom ? 'flex' : 'none', md: 'flex' },
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
