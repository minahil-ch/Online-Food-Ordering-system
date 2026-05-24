import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../api';
import { getApiError } from '../api/axios';
import { useAuthStore } from '../store/authStore';
import { registerSchema, type RegisterForm } from '../schemas/auth';
import { PageTransition } from '../components/layout/PageTransition';

export function RegisterPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: RegisterForm) => {
    try {
      const res = await authApi.register(data);
      if (res.data.success && res.data.data) {
        login(res.data.data.accessToken, res.data.data.user);
        toast.success('Account created!');
        navigate('/');
      }
    } catch (err) {
      toast.error(getApiError(err));
    }
  };

  return (
    <PageTransition>
      <div className="mx-auto max-w-md px-4 py-12">
        <h1 className="text-3xl font-bold">Create account</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 hover:underline">
            Log in
          </Link>
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <input {...register('name')} className="input-field mt-1" />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <input type="email" {...register('email')} className="input-field mt-1" />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium">Phone</label>
            <input {...register('phone')} className="input-field mt-1" placeholder="5551234567" />
            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <input type="password" {...register('password')} className="input-field mt-1" />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium">Confirm password</label>
            <input type="password" {...register('confirmPassword')} className="input-field mt-1" />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>
          <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Sign up'}
          </button>
        </form>
      </div>
    </PageTransition>
  );
}
