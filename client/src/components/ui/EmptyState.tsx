import { Link } from 'react-router-dom';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
  icon?: string;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionTo = '/',
  icon = '🍽️',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
      <span className="mb-4 text-6xl" role="img" aria-hidden="true">
        {icon}
      </span>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
      <p className="mt-2 max-w-md text-gray-600 dark:text-gray-400">{description}</p>
      {actionLabel && (
        <Link to={actionTo} className="btn-primary mt-6">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
