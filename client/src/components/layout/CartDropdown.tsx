import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  useCartStore,
  selectSubtotal,
  selectTotalItems,
  selectIsEmpty,
} from '../../store/cartStore';
import { formatCurrency } from '../../utils/format';

export function CartDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const items = useCartStore((s) => s.items);
  const restaurantName = useCartStore((s) => s.restaurantName);
  const subtotal = useCartStore(selectSubtotal);
  const totalItems = useCartStore(selectTotalItems);
  const isEmpty = useCartStore(selectIsEmpty);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative min-h-touch min-w-touch rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label={`Cart, ${totalItems} items`}
        aria-expanded={open}
      >
        🛒
        {totalItems > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-600 px-1 text-xs font-bold text-white"
          >
            {totalItems}
          </motion.span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
          <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
            <p className="font-semibold">Your cart</p>
            {restaurantName && (
              <p className="text-xs text-gray-500">from {restaurantName}</p>
            )}
          </div>

          {isEmpty ? (
            <p className="px-4 py-8 text-center text-sm text-gray-500">Cart is empty</p>
          ) : (
            <>
              <ul className="max-h-48 overflow-y-auto px-4 py-2">
                {items.map((item) => (
                  <li key={item.menuItem.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                    <span className="min-w-0 flex-1 truncate">
                      {item.quantity}× {item.menuItem.name}
                    </span>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        className="min-h-touch min-w-[32px] rounded border px-1 text-xs"
                        onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                        aria-label="Decrease"
                      >
                        −
                      </button>
                      <button
                        type="button"
                        className="min-h-touch min-w-[32px] rounded border px-1 text-xs"
                        onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                        aria-label="Increase"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        className="text-red-600 text-xs"
                        onClick={() => removeItem(item.menuItem.id)}
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="border-t border-gray-200 px-4 py-2 dark:border-gray-700">
                <div className="flex justify-between text-sm font-semibold">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
              </div>
              <div className="flex gap-2 p-3">
                <button
                  type="button"
                  className="btn-secondary flex-1 text-xs"
                  onClick={() => {
                    clearCart();
                    setOpen(false);
                  }}
                >
                  Clear
                </button>
                <Link
                  to="/cart"
                  className="btn-primary flex-1 text-center text-xs"
                  onClick={() => setOpen(false)}
                >
                  Checkout
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
