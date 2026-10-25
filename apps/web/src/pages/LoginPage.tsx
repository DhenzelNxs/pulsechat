import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@pulsechat/shared';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import { ApiError } from '../api/client';
import { useLogin } from '../features/auth/useLogin';

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const justRegistered = Boolean((location.state as { registered?: boolean } | null)?.registered);
  const login = useLogin();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = (input: LoginInput) => {
    login.mutate(input, { onSuccess: () => navigate('/') });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        bgcolor: 'background.default',
      }}
    >
      <Paper component="form" onSubmit={handleSubmit(onSubmit)} elevation={2} sx={{ width: '100%', maxWidth: 400, p: 4 }}>
        <Stack spacing={2.5}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {t('auth.login.title')}
          </Typography>

          {justRegistered && <Alert severity="success">{t('auth.login.accountCreated')}</Alert>}

          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                id="email"
                label={t('auth.login.email')}
                type="email"
                autoComplete="email"
                fullWidth
                error={Boolean(errors.email)}
                helperText={errors.email?.message}
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                id="password"
                label={t('auth.login.password')}
                type="password"
                autoComplete="current-password"
                fullWidth
                error={Boolean(errors.password)}
                helperText={errors.password?.message}
              />
            )}
          />

          {login.isError && (
            <Alert severity="error">
              {login.error instanceof ApiError ? login.error.message : t('auth.login.genericError')}
            </Alert>
          )}

          <Button type="submit" variant="contained" size="large" fullWidth disabled={login.isPending}>
            {login.isPending ? t('auth.login.submitPending') : t('auth.login.submit')}
          </Button>

          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            {t('auth.login.noAccount')}{' '}
            <Link component={RouterLink} to="/register" underline="hover" sx={{ fontWeight: 600 }}>
              {t('auth.login.registerLink')}
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
