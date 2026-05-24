import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../api';
import { getApiError } from '../api/axios';
import { useAuthStore } from '../store/authStore';
import { loginSchema, type LoginForm } from '../schemas/auth';
import { PageTransition } from '../components/layout/PageTransition';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuthStore();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, navigate, from]);

  const onSubmit = async (data: LoginForm) => {
    try {
      const res = await authApi.login(data);
      if (res.data.success && res.data.data) {
        login(res.data.data.accessToken, res.data.data.user);
        toast.success('Welcome back!');
        navigate(from, { replace: true });
      }
    } catch (err) {
      toast.error(getApiError(err));
    }
  };

  return (
    <PageTransition>
      <div className="mx-auto max-w-md px-4 py-12">
        <h1 className="text-3xl font-bold">Log in</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-brand-600 hover:underline">
            Sign up
          </Link>
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <input type="email" {...register('email')} className="input-field mt-1" autoComplete="email" />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <input type="password" {...register('password')} className="input-field mt-1" autoComplete="current-password" />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
          </div>
          <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : 'Log in'}
          </button>
        </form>
      </div>
    </PageTransition>
  );
}
