import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from '@pulsechat/shared';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError } from '../api/client';
import { useRegister } from '../features/auth/useRegister';

export function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const registerAccount = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const onSubmit = (input: RegisterInput) => {
    registerAccount.mutate(input, {
      onSuccess: () => navigate('/login', { state: { registered: true } }),
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm space-y-4 rounded-lg bg-white p-8 shadow"
      >
        <h1 className="text-2xl font-semibold text-slate-900">{t('auth.register.title')}</h1>

        <div className="flex gap-3">
          <div className="flex-1 space-y-1">
            <label htmlFor="firstName" className="block text-sm font-medium text-slate-700">
              {t('auth.register.firstName')}
            </label>
            <input
              id="firstName"
              type="text"
              autoComplete="given-name"
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              {...register('firstName')}
            />
            {errors.firstName && (
              <p className="text-sm text-red-600">{errors.firstName.message}</p>
            )}
          </div>

          <div className="flex-1 space-y-1">
            <label htmlFor="lastName" className="block text-sm font-medium text-slate-700">
              {t('auth.register.lastName')}
            </label>
            <input
              id="lastName"
              type="text"
              autoComplete="family-name"
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              {...register('lastName')}
            />
            {errors.lastName && <p className="text-sm text-red-600">{errors.lastName.message}</p>}
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="username" className="block text-sm font-medium text-slate-700">
            {t('auth.register.username')}
          </label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            placeholder={t('auth.register.usernamePlaceholder')}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            {...register('username')}
          />
          <p className="text-xs text-slate-500">{t('auth.register.usernameHelp')}</p>
          {errors.username && <p className="text-sm text-red-600">{errors.username.message}</p>}
        </div>

        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            {t('auth.register.email')}
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
            {t('auth.register.password')}
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            {...register('password')}
          />
          {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
        </div>

        {registerAccount.isError && (
          <p className="text-sm text-red-600">
            {registerAccount.error instanceof ApiError
              ? registerAccount.error.message
              : t('auth.register.genericError')}
          </p>
        )}

        <button
          type="submit"
          disabled={registerAccount.isPending}
          className="w-full rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {registerAccount.isPending ? t('auth.register.submitPending') : t('auth.register.submit')}
        </button>

        <p className="text-center text-sm text-slate-600">
          {t('auth.register.haveAccount')}{' '}
          <Link to="/login" className="font-medium text-slate-900 underline">
            {t('auth.register.loginLink')}
          </Link>
        </p>
      </form>
    </div>
  );
}
