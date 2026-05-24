import { motion } from 'framer-motion';
import { ORDER_STATUS_FLOW, type OrderStatus } from '@food-ordering/shared';
import { formatStatus } from '../../utils/format';

const STATUS_ICONS: Record<string, string> = {
  pending: '📝',
  confirmed: '✅',
  preparing: '👨‍🍳',
  out_for_delivery: '🛵',
  delivered: '🎉',
  cancelled: '❌',
};

interface OrderStatusTrackerProps {
  status: OrderStatus;
}

export function OrderStatusTracker({ status }: OrderStatusTrackerProps) {
  const currentIndex = ORDER_STATUS_FLOW.indexOf(status);
  const isCancelled = status === 'cancelled';

  if (isCancelled) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-center text-red-700 dark:bg-red-900/30 dark:text-red-300">
        Order was cancelled
      </div>
    );
  }

  return (
    <ol className="relative flex flex-col gap-4 sm:flex-row sm:justify-between">
      {ORDER_STATUS_FLOW.map((step, index) => {
        const isComplete = index <= currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <li key={step} className="flex flex-1 items-center gap-3 sm:flex-col sm:text-center">
            <motion.div
              animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: isCurrent ? Infinity : 0, duration: 1.5 }}
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl ${
                isComplete
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-200 text-gray-400 dark:bg-gray-700'
              }`}
            >
              {STATUS_ICONS[step]}
            </motion.div>
            <div>
              <p
                className={`text-sm font-medium ${
                  isComplete ? 'text-gray-900 dark:text-white' : 'text-gray-400'
                }`}
              >
                {formatStatus(step)}
              </p>
            </div>
            {index < ORDER_STATUS_FLOW.length - 1 && (
              <div
                className={`hidden h-0.5 flex-1 sm:block ${
                  index < currentIndex ? 'bg-brand-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
                aria-hidden="true"
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
