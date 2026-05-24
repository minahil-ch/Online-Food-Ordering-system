import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import type { IMenuItem, IRestaurant } from '@food-ordering/shared';
import { restaurantApi } from '../api';
import { useCartStore } from '../store/cartStore';
import { CartSidebar } from '../components/cart/CartSidebar';
import { SwitchRestaurantModal } from '../components/cart/SwitchRestaurantModal';
import { PageLoader } from '../components/ui/Spinner';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { formatCurrency } from '../utils/format';
import { formatOpeningHours, formatHoursOnly } from '../utils/restaurant';

export function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<IRestaurant | null>(null);
  const [menu, setMenu] = useState<Record<string, IMenuItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');
  const categoryRefs = useRef<Record<string, HTMLElement | null>>({});

  const addItem = useCartStore((s) => s.addItem);
  const getItemQuantity = useCartStore((s) => s.getItemQuantity);
  const updateQuantity = useCartStore((s) => s.updateQuantity);

  useEffect(() => {
    if (!id) return;
    restaurantApi
      .get(id)
      .then(({ data }) => {
        if (data.success && data.data) {
          setRestaurant(data.data.restaurant);
          setMenu(data.data.menu);
          const cats = Object.keys(data.data.menu);
          if (cats.length) setActiveCategory(cats[0]);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAdd = (item: IMenuItem) => {
    if (!restaurant) return;
    const result = addItem(
      {
        id: item.id,
        restaurantId: item.restaurantId,
        name: item.name,
        description: item.description,
        price: item.price,
        imageUrl: item.imageUrl,
        category: item.category,
      },
      { id: restaurant.id, name: restaurant.name, deliveryFee: restaurant.deliveryFee }
    );
    if (result === 'added') {
      toast.success(`Added ${item.name}`, { icon: '🛒' });
    }
  };

  const scrollToCategory = (cat: string) => {
    setActiveCategory(cat);
    categoryRefs.current[cat]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (loading) return <PageLoader />;
  if (!restaurant) {
    return (
      <div className="p-8 text-center">
        <p>Restaurant not found</p>
      </div>
    );
  }

  const categories = Object.keys(menu);

  return (
    <ErrorBoundary>
      <SwitchRestaurantModal />
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="relative mb-6 h-48 overflow-hidden rounded-xl sm:h-64">
          <img
            src={restaurant.imageUrl}
            alt={restaurant.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-4 left-4 text-white">
            <h1 className="text-3xl font-bold">{restaurant.name}</h1>
            <p className="mt-1 text-sm opacity-90">
              ★ {restaurant.rating} • {formatOpeningHours(restaurant)}
            </p>
            <p className="text-sm opacity-80">
              {formatHoursOnly(restaurant.openingHours)} • {restaurant.deliveryTime} min delivery •{' '}
              Min {formatCurrency(restaurant.minimumOrder)} • {formatCurrency(restaurant.deliveryFee)} fee
            </p>
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-2">
            {categories.length > 0 && (
              <nav
                className="sticky top-[65px] z-30 -mx-4 mb-6 flex gap-2 overflow-x-auto border-b border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-800 dark:bg-gray-950"
                aria-label="Menu categories"
              >
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => scrollToCategory(cat)}
                    className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium min-h-touch ${
                      activeCategory === cat
                        ? 'bg-brand-600 text-white'
                        : 'bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </nav>
            )}

            {categories.map((category) => (
              <section
                key={category}
                ref={(el) => {
                  categoryRefs.current[category] = el;
                }}
                className="mb-10 scroll-mt-32"
              >
                <h2 className="mb-4 text-xl font-semibold">{category}</h2>
                <div className="space-y-4">
                  {menu[category].map((item) => {
                    const qty = getItemQuantity(item.id);
                    return (
                      <motion.article
                        key={item.id}
                        layout
                        className="card flex gap-4 p-4"
                      >
                        <img
                          src={item.imageUrl}
                          alt=""
                          className="h-24 w-24 shrink-0 rounded-lg object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-medium">{item.name}</h3>
                            {item.isPopular && (
                              <span className="shrink-0 rounded bg-brand-100 px-2 py-0.5 text-xs text-brand-800">
                                Popular
                              </span>
                            )}
                          </div>
                          <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                            {item.description}
                          </p>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="font-semibold text-brand-600">
                              {formatCurrency(item.price)}
                            </span>
                            {!item.isAvailable ? (
                              <span className="text-sm text-gray-400">Unavailable</span>
                            ) : qty > 0 ? (
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  className="min-h-touch min-w-touch rounded border px-3"
                                  onClick={() => updateQuantity(item.id, qty - 1)}
                                  aria-label="Decrease quantity"
                                >
                                  −
                                </button>
                                <span>{qty}</span>
                                <button
                                  type="button"
                                  className="min-h-touch min-w-touch rounded border px-3"
                                  onClick={() => updateQuantity(item.id, qty + 1)}
                                  aria-label="Increase quantity"
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                className="btn-primary text-sm"
                                onClick={() => handleAdd(item)}
                              >
                                Add to Cart
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          <div className="hidden lg:block">
            <CartSidebar />
          </div>
        </div>

        {/* Mobile bottom cart bar */}
        <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4 lg:hidden dark:border-gray-800 dark:bg-gray-900">
          <Link to="/cart" className="btn-primary block w-full text-center">
            View Cart
          </Link>
        </div>
      </div>
    </ErrorBoundary>
  );
}
