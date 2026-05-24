import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import type { IUser } from '@food-ordering/shared';
import { userApi } from '../../api';
import { getApiError } from '../../api/axios';
import { PageLoader } from '../../components/ui/Spinner';
import { formatDate } from '../../utils/format';

export function AdminUsersPage() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    userApi
      .list()
      .then(({ data }) => {
        if (data.success && data.data) setUsers(data.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const toggleSuspend = async (user: IUser) => {
    const next = !user.isSuspended;
    const action = next ? 'suspend' : 'reactivate';
    if (!confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} ${user.name}?`)) return;

    try {
      await userApi.updateStatus(user.id, next);
      toast.success(next ? 'User suspended' : 'User reactivated');
      load();
    } catch (err) {
      toast.error(getApiError(err));
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <h1 className="text-2xl font-bold">User management</h1>
      <p className="mt-1 text-sm text-gray-500">
        View all registered customers. Suspend accounts to block login and ordering.
      </p>

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Phone</th>
              <th className="p-4">Role</th>
              <th className="p-4">Joined</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-100 dark:border-gray-800">
                <td className="p-4 font-medium">{user.name}</td>
                <td className="p-4">{user.email}</td>
                <td className="p-4">{user.phone ?? '—'}</td>
                <td className="p-4 capitalize">{user.role}</td>
                <td className="p-4">{formatDate(user.createdAt)}</td>
                <td className="p-4">
                  {user.role === 'admin' ? (
                    <span className="text-gray-400">Protected</span>
                  ) : user.isSuspended ? (
                    <span className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-800 dark:bg-red-900 dark:text-red-200">
                      Suspended
                    </span>
                  ) : (
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800 dark:bg-green-900 dark:text-green-200">
                      Active
                    </span>
                  )}
                </td>
                <td className="p-4">
                  {user.role !== 'admin' && (
                    <button
                      type="button"
                      className={`text-sm font-medium ${
                        user.isSuspended ? 'text-green-600' : 'text-red-600'
                      }`}
                      onClick={() => toggleSuspend(user)}
                    >
                      {user.isSuspended ? 'Reactivate' : 'Suspend'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
