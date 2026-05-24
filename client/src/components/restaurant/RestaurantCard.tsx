import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { IRestaurant } from '@food-ordering/shared';
import { formatCurrency } from '../../utils/format';
import { formatOpeningHours } from '../../utils/restaurant';

interface RestaurantCardProps {
  restaurant: IRestaurant;
  index?: number;
}

export function RestaurantCard({ restaurant, index = 0 }: RestaurantCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        to={`/restaurants/${restaurant.id}`}
        className="card group block overflow-hidden transition hover:shadow-md"
      >
        <div className="relative h-44 overflow-hidden">
          <img
            src={restaurant.imageUrl || 'https://placehold.co/400x300?text=Restaurant'}
            alt={restaurant.name}
            className="h-full w-full object-cover transition group-hover:scale-105"
            loading="lazy"
          />
          {!restaurant.isOpen && (
            <span className="absolute left-2 top-2 rounded bg-red-600 px-2 py-1 text-xs font-medium text-white">
              Closed
            </span>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">{restaurant.name}</h3>
            <span className="shrink-0 rounded bg-green-100 px-2 py-0.5 text-sm font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
              ★ {restaurant.rating.toFixed(1)}
            </span>
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
            {restaurant.description}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
            <span>{formatOpeningHours(restaurant)}</span>
            <span>•</span>
            <span>{restaurant.deliveryTime} min delivery</span>
            <span>•</span>
            <span>{formatCurrency(restaurant.deliveryFee)} fee</span>
          </div>
          <p className="mt-1 text-xs text-gray-400">{restaurant.cuisine.join(' · ')}</p>
        </div>
      </Link>
    </motion.div>
  );
}
