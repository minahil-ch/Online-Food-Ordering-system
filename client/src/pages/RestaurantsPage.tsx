import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { IRestaurant } from '@food-ordering/shared';
import { CUISINE_OPTIONS } from '@food-ordering/shared';
import { restaurantApi } from '../api';
import { RestaurantCard } from '../components/restaurant/RestaurantCard';
import { RestaurantCardSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { PageTransition } from '../components/layout/PageTransition';

export function RestaurantsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [restaurants, setRestaurants] = useState<IRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  const search = searchParams.get('search') ?? '';
  const cuisine = searchParams.get('cuisine') ?? '';
  const sort = searchParams.get('sort') ?? 'rating';
  const openOnly = searchParams.get('open') === 'true';

  const fetchRestaurants = useCallback(
    async (pageNum: number, append = false) => {
      setLoading(true);
      try {
        const params: Record<string, string | number> = {
          sort,
          page: pageNum,
          limit: 12,
        };
        if (search) params.search = search;
        if (cuisine) params.cuisine = cuisine;
        if (openOnly) params.open = 'true';
        const { data } = await restaurantApi.list(params);
        if (data.success && data.data) {
          setRestaurants((prev) => (append ? [...prev, ...data.data!] : data.data!));
          const meta = data.meta;
          if (meta) {
            setTotal(meta.total ?? 0);
            setHasMore((meta.page ?? 1) < (meta.totalPages ?? 1));
          }
        }
      } finally {
        setLoading(false);
      }
    },
    [search, cuisine, sort, openOnly]
  );

  useEffect(() => {
    setPage(1);
    fetchRestaurants(1, false);
  }, [fetchRestaurants]);

  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  return (
    <ErrorBoundary>
      <PageTransition>
        <div className="mx-auto max-w-7xl px-4 py-8">
          <h1 className="text-3xl font-bold">Browse restaurants</h1>

          <div className="mt-6 grid gap-4 lg:grid-cols-4">
            <aside className="card space-y-4 p-4 lg:col-span-1">
              <div>
                <label className="text-sm font-medium">Search</label>
                <input
                  type="search"
                  defaultValue={search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  className="input-field mt-1"
                  placeholder="Name or cuisine"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Cuisine</label>
                <select
                  value={cuisine}
                  onChange={(e) => updateFilter('cuisine', e.target.value)}
                  className="input-field mt-1"
                >
                  <option value="">All</option>
                  {CUISINE_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Sort by</label>
                <select
                  value={sort}
                  onChange={(e) => updateFilter('sort', e.target.value)}
                  className="input-field mt-1"
                >
                  <option value="rating">Rating</option>
                  <option value="deliveryTime">Delivery time</option>
                  <option value="deliveryFee">Delivery fee</option>
                  <option value="name">Name</option>
                </select>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={openOnly}
                  onChange={(e) => updateFilter('open', e.target.checked ? 'true' : '')}
                  className="h-4 w-4 rounded"
                />
                <span className="text-sm">Open now only</span>
              </label>
            </aside>

            <div className="lg:col-span-3">
              <p className="mb-4 text-sm text-gray-500">{total} restaurants found</p>
              {loading && restaurants.length === 0 ? (
                <div className="grid gap-6 sm:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <RestaurantCardSkeleton key={i} />
                  ))}
                </div>
              ) : restaurants.length === 0 ? (
                <EmptyState
                  title="No restaurants found"
                  description="Try adjusting your filters or search terms."
                  actionLabel="Clear filters"
                  actionTo="/restaurants"
                />
              ) : (
                <>
                  <div className="grid gap-6 sm:grid-cols-2">
                    {restaurants.map((r, i) => (
                      <RestaurantCard key={r.id} restaurant={r} index={i} />
                    ))}
                  </div>
                  {hasMore && (
                    <div className="mt-8 text-center">
                      <button
                        type="button"
                        className="btn-secondary"
                        disabled={loading}
                        onClick={() => {
                          const next = page + 1;
                          setPage(next);
                          fetchRestaurants(next, true);
                        }}
                      >
                        {loading ? 'Loading...' : 'Load more'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </PageTransition>
    </ErrorBoundary>
  );
}
