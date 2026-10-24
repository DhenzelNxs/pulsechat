import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@pulsechat/shared';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ApiError } from '../api/client';
import { useLogin } from '../features/auth/useLogin';

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const justRegistered = Boolean((location.state as { registered?: boolean } | null)?.registered);
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = (input: LoginInput) => {
    login.mutate(input, { onSuccess: () => navigate('/') });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm space-y-4 rounded-lg bg-white p-8 shadow"
      >
        <h1 className="text-2xl font-semibold text-slate-900">{t('auth.login.title')}</h1>

        {justRegistered && (
          <p className="rounded bg-green-50 px-3 py-2 text-sm text-green-700">
            {t('auth.login.accountCreated')}
          </p>
        )}

        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            {t('auth.login.email')}
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            {...register('email')}
          />
          {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
            {t('auth.login.password')}
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            {...register('password')}
          />
          {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
        </div>

        {login.isError && (
          <p className="text-sm text-red-600">
            {login.error instanceof ApiError ? login.error.message : t('auth.login.genericError')}
          </p>
        )}

        <button
          type="submit"
          disabled={login.isPending}
          className="w-full rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {login.isPending ? t('auth.login.submitPending') : t('auth.login.submit')}
        </button>

        <p className="text-center text-sm text-slate-600">
          {t('auth.login.noAccount')}{' '}
          <Link to="/register" className="font-medium text-slate-900 underline">
            {t('auth.login.registerLink')}
          </Link>
        </p>
      </form>
    </div>
  );
}
