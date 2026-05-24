import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export function OfflineBanner() {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div
      role="alert"
      className="bg-amber-500 px-4 py-2 text-center text-sm font-medium text-amber-950"
    >
      You are offline. Some features may not work until you reconnect.
    </div>
  );
}
