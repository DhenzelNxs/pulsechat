import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from '@pulsechat/shared';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import { ApiError } from '../api/client';
import { useRegister } from '../features/auth/useRegister';

export function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const registerAccount = useRegister();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: '', lastName: '', username: '', email: '', password: '' },
  });

  const onSubmit = (input: RegisterInput) => {
    registerAccount.mutate(input, {
      onSuccess: () => navigate('/login', { state: { registered: true } }),
    });
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
            {t('auth.register.title')}
          </Typography>

          <Stack direction="row" spacing={2}>
            <Controller
              name="firstName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  id="firstName"
                  label={t('auth.register.firstName')}
                  autoComplete="given-name"
                  fullWidth
                  error={Boolean(errors.firstName)}
                  helperText={errors.firstName?.message}
                />
              )}
            />
            <Controller
              name="lastName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  id="lastName"
                  label={t('auth.register.lastName')}
                  autoComplete="family-name"
                  fullWidth
                  error={Boolean(errors.lastName)}
                  helperText={errors.lastName?.message}
                />
              )}
            />
          </Stack>

          <Controller
            name="username"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                id="username"
                label={t('auth.register.username')}
                autoComplete="username"
                placeholder={t('auth.register.usernamePlaceholder')}
                fullWidth
                error={Boolean(errors.username)}
                helperText={errors.username?.message ?? t('auth.register.usernameHelp')}
              />
            )}
          />

          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                id="email"
                label={t('auth.register.email')}
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
                label={t('auth.register.password')}
                type="password"
                autoComplete="new-password"
                fullWidth
                error={Boolean(errors.password)}
                helperText={errors.password?.message}
              />
            )}
          />

          {registerAccount.isError && (
            <Alert severity="error">
              {registerAccount.error instanceof ApiError
                ? registerAccount.error.message
                : t('auth.register.genericError')}
            </Alert>
          )}

          <Button type="submit" variant="contained" size="large" fullWidth disabled={registerAccount.isPending}>
            {registerAccount.isPending ? t('auth.register.submitPending') : t('auth.register.submit')}
          </Button>

          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            {t('auth.register.haveAccount')}{' '}
            <Link component={RouterLink} to="/login" underline="hover" sx={{ fontWeight: 600 }}>
              {t('auth.register.loginLink')}
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
