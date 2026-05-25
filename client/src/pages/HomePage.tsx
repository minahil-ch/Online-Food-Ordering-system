import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CUISINE_OPTIONS } from '@food-ordering/shared';
import type { IRestaurant } from '@food-ordering/shared';
import { restaurantApi } from '../api';
import { RestaurantCard } from '../components/restaurant/RestaurantCard';
import { RestaurantCardSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { PageTransition } from '../components/layout/PageTransition';

export function HomePage() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<IRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);

  useEffect(() => {
    restaurantApi
      .list({ limit: 6, sort: 'rating' })
      .then(({ data }) => {
        if (data.success && data.data) setRestaurants(data.data);
      })
      .catch(() => {
        setRestaurants([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (selectedCuisine) params.set('cuisine', selectedCuisine);
    navigate(`/restaurants?${params.toString()}`);
  };

  return (
    <ErrorBoundary>
      <PageTransition>
        <section className="bg-gradient-to-br from-brand-600 to-brand-800 px-4 py-16 text-white sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold sm:text-5xl"
            >
              Delicious food, delivered fast
            </motion.h1>
            <p className="mt-4 text-lg text-brand-100">
              Browse top restaurants near you and order in minutes
            </p>
            <form onSubmit={handleSearch} className="mt-8 flex flex-col gap-3 sm:flex-row">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search restaurants or cuisine..."
                className="input-field flex-1 text-gray-900"
                aria-label="Search restaurants"
              />
              <button type="submit" className="btn-primary bg-white text-brand-700 hover:bg-brand-50">
                Search
              </button>
            </form>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8">
          <h2 className="mb-4 text-lg font-semibold">Popular cuisines</h2>
          <div className="flex flex-wrap gap-2">
            {CUISINE_OPTIONS.slice(0, 8).map((cuisine) => (
              <button
                key={cuisine}
                type="button"
                onClick={() => setSelectedCuisine(selectedCuisine === cuisine ? null : cuisine)}
                className={`min-h-touch rounded-full px-4 py-2 text-sm font-medium transition ${
                  selectedCuisine === cuisine
                    ? 'bg-brand-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                }`}
              >
                {cuisine}
              </button>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-16">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Featured restaurants</h2>
            <Link to="/restaurants" className="text-brand-600 hover:underline">
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <RestaurantCardSkeleton key={i} />
              ))}
            </div>
          ) : restaurants.length === 0 ? (
            <EmptyState
              title="No restaurants yet"
              description="Check back soon for delicious options near you."
              actionLabel="Browse all"
              actionTo="/restaurants"
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {restaurants.map((r, i) => (
                <RestaurantCard key={r.id} restaurant={r} index={i} />
              ))}
            </div>
          )}
        </section>
      </PageTransition>
    </ErrorBoundary>
  );
}
