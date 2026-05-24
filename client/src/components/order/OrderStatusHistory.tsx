import type { OrderStatusLog } from '@food-ordering/shared';
import { formatDate, formatStatus } from '../../utils/format';

interface OrderStatusHistoryProps {
  history?: OrderStatusLog[];
}

export function OrderStatusHistory({ history }: OrderStatusHistoryProps) {
  if (!history?.length) return null;

  return (
    <div className="mt-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Status history</h3>
      <ol className="mt-2 space-y-2 border-l-2 border-gray-200 pl-4 dark:border-gray-700">
        {[...history].reverse().map((entry, i) => (
          <li key={`${entry.changedAt}-${i}`} className="relative text-sm">
            <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-brand-600" />
            <p className="font-medium">{formatStatus(entry.status)}</p>
            <p className="text-xs text-gray-500">{formatDate(entry.changedAt)}</p>
            {entry.note && <p className="text-xs text-gray-400">{entry.note}</p>}
          </li>
        ))}
      </ol>
    </div>
  );
}
