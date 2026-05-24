import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { OfflineBanner } from './OfflineBanner';

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <OfflineBanner />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-gray-200 bg-white py-8 dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} FoodDash. Order delicious food, delivered fast.
        </div>
      </footer>
    </div>
  );
}
