import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { authApi } from '../api';
import { getApiError } from '../api/axios';
import { useAuthStore } from '../store/authStore';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { PageTransition } from '../components/layout/PageTransition';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  zipCode: z.string().regex(/^\d{5}$/, 'ZIP must be 5 digits'),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Required'),
    newPassword: z
      .string()
      .min(8)
      .regex(/[A-Z]/)
      .regex(/\d/),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

function ProfileContent() {
  const { user, setUser } = useAuthStore();
  const [changingPassword, setChangingPassword] = useState(false);

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? '',
      phone: user?.phone ?? '',
      street: user?.address?.street ?? '',
      city: user?.address?.city ?? '',
      zipCode: user?.address?.zipCode ?? '',
    },
  });

  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  const onProfileSubmit = async (data: ProfileForm) => {
    try {
      const res = await authApi.updateProfile({
        name: data.name,
        phone: data.phone,
        address: { street: data.street, city: data.city, zipCode: data.zipCode },
      });
      if (res.data.success && res.data.data) {
        setUser(res.data.data);
        toast.success('Profile updated');
      }
    } catch (err) {
      toast.error(getApiError(err));
    }
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    try {
      await authApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password changed');
      passwordForm.reset();
      setChangingPassword(false);
    } catch (err) {
      toast.error(getApiError(err));
    }
  };

  return (
    <PageTransition>
      <div className="mx-auto max-w-lg px-4 py-8">
        <h1 className="text-3xl font-bold">Profile</h1>
        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="card mt-6 space-y-4 p-6">
          <h2 className="font-semibold">Personal info</h2>
          <div>
            <label className="text-sm font-medium">Name</label>
            <input {...profileForm.register('name')} className="input-field mt-1" />
            {profileForm.formState.errors.name && (
              <p className="text-sm text-red-600">{profileForm.formState.errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium">Phone</label>
            <input {...profileForm.register('phone')} className="input-field mt-1" />
          </div>
          <h2 className="pt-2 font-semibold">Saved address</h2>
          <input {...profileForm.register('street')} placeholder="Street" className="input-field" />
          <input {...profileForm.register('city')} placeholder="City" className="input-field" />
          <input {...profileForm.register('zipCode')} placeholder="ZIP" className="input-field" maxLength={5} />
          <button type="submit" className="btn-primary w-full">
            Save changes
          </button>
        </form>

        <div className="card mt-6 p-6">
          <h2 className="font-semibold">Password</h2>
          {!changingPassword ? (
            <button type="button" className="btn-secondary mt-4" onClick={() => setChangingPassword(true)}>
              Change password
            </button>
          ) : (
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="mt-4 space-y-4">
              <input
                type="password"
                placeholder="Current password"
                {...passwordForm.register('currentPassword')}
                className="input-field"
              />
              <input
                type="password"
                placeholder="New password"
                {...passwordForm.register('newPassword')}
                className="input-field"
              />
              <input
                type="password"
                placeholder="Confirm new password"
                {...passwordForm.register('confirmPassword')}
                className="input-field"
              />
              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1">
                  Update password
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setChangingPassword(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </PageTransition>
  );
}

export function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
