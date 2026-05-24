import { Link } from 'react-router-dom';
import {
  useCartStore,
  selectSubtotal,
  selectTotalItems,
  selectIsEmpty,
} from '../../store/cartStore';
import { formatCurrency } from '../../utils/format';

interface CartSidebarProps {
  className?: string;
}

export function CartSidebar({ className = '' }: CartSidebarProps) {
  const items = useCartStore((s) => s.items);
  const restaurantName = useCartStore((s) => s.restaurantName);
  const deliveryFee = useCartStore((s) => s.deliveryFee);
  const subtotal = useCartStore(selectSubtotal);
  const totalItems = useCartStore(selectTotalItems);
  const isEmpty = useCartStore(selectIsEmpty);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const total = subtotal + (isEmpty ? 0 : deliveryFee);

  return (
    <aside
      className={`card sticky top-24 flex flex-col p-4 ${className}`}
      aria-label="Shopping cart"
    >
      <h2 className="text-lg font-semibold">Your Cart</h2>
      {restaurantName && (
        <p className="text-sm text-gray-500 dark:text-gray-400">from {restaurantName}</p>
      )}

      {isEmpty ? (
        <p className="mt-8 text-center text-sm text-gray-500">Your cart is empty</p>
      ) : (
        <>
          <ul className="mt-4 flex-1 space-y-3 overflow-y-auto max-h-[40vh]">
            {items.map((item) => (
              <li key={item.menuItem.id} className="flex gap-3 border-b border-gray-100 pb-3 dark:border-gray-800">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-sm">{item.menuItem.name}</p>
                  <p className="text-sm text-brand-600">{formatCurrency(item.menuItem.price)}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <button
                      type="button"
                      className="min-h-touch min-w-touch rounded border px-2"
                      onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                      aria-label={`Decrease ${item.menuItem.name}`}
                    >
                      −
                    </button>
                    <span aria-live="polite">{item.quantity}</span>
                    <button
                      type="button"
                      className="min-h-touch min-w-touch rounded border px-2"
                      onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                      aria-label={`Increase ${item.menuItem.name}`}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      className="ml-auto text-xs text-red-600"
                      onClick={() => removeItem(item.menuItem.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-4 space-y-1 border-t border-gray-200 pt-4 text-sm dark:border-gray-700">
            <div className="flex justify-between">
              <span>Subtotal ({totalItems} items)</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery</span>
              <span>{formatCurrency(deliveryFee)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          <Link to="/cart" className="btn-primary mt-4 w-full text-center">
            Checkout
          </Link>
        </>
      )}
    </aside>
  );
}
