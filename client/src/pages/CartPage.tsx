import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  useCartStore,
  selectSubtotal,
  selectIsEmpty,
  selectTotalItems,
} from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { orderApi } from '../api';
import { getApiError } from '../api/axios';
import { checkoutSchema, type CheckoutForm } from '../schemas/checkout';
import { EmptyState } from '../components/ui/EmptyState';
import { formatCurrency } from '../utils/format';

export function CartPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const items = useCartStore((s) => s.items);
  const restaurantId = useCartStore((s) => s.restaurantId);
  const deliveryFee = useCartStore((s) => s.deliveryFee);
  const subtotal = useCartStore(selectSubtotal);
  const isEmpty = useCartStore(selectIsEmpty);
  const totalItems = useCartStore(selectTotalItems);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      street: user?.address?.street ?? '',
      city: user?.address?.city ?? '',
      zipCode: user?.address?.zipCode ?? '',
      paymentMethod: 'cash',
    },
  });

  const total = subtotal + deliveryFee;

  const onSubmit = async (formData: CheckoutForm) => {
    if (!isAuthenticated) {
      toast.error('Please log in to place an order');
      navigate('/login', { state: { from: { pathname: '/cart' } } });
      return;
    }
    if (!restaurantId || isEmpty) return;
    setSubmitting(true);
    try {
      const { data } = await orderApi.create({
        restaurantId,
        items: items.map((i) => ({
          menuItemId: i.menuItem.id,
          quantity: i.quantity,
        })),
        deliveryAddress: {
          street: formData.street,
          city: formData.city,
          zipCode: formData.zipCode,
        },
        paymentMethod: formData.paymentMethod,
      });
      if (data.success && data.data) {
        clearCart();
        toast.success('Order placed!');
        navigate(`/order-confirmation/${data.data.id}`);
      }
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (isEmpty) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Browse restaurants and add delicious items to get started."
        actionLabel="Find restaurants"
        actionTo="/restaurants"
        icon="🛒"
      />
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold">Your Cart</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.menuItem.id} className="card flex gap-4 p-4">
              <img
                src={item.menuItem.imageUrl}
                alt=""
                className="h-20 w-20 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="font-medium">{item.menuItem.name}</h3>
                <p className="text-brand-600">{formatCurrency(item.menuItem.price)}</p>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    className="min-h-touch min-w-touch rounded border px-3"
                    onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    type="button"
                    className="min-h-touch min-w-touch rounded border px-3"
                    onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    className="ml-auto text-sm text-red-600"
                    onClick={() => removeItem(item.menuItem.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4 p-6">
          <h2 className="text-lg font-semibold">Delivery details</h2>
          <div>
            <label className="text-sm font-medium">Street</label>
            <input {...register('street')} className="input-field mt-1" />
            {errors.street && (
              <p className="mt-1 text-sm text-red-600">{errors.street.message}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium">City</label>
            <input {...register('city')} className="input-field mt-1" />
            {errors.city && (
              <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium">ZIP Code</label>
            <input {...register('zipCode')} className="input-field mt-1" maxLength={5} />
            {errors.zipCode && (
              <p className="mt-1 text-sm text-red-600">{errors.zipCode.message}</p>
            )}
          </div>

          <fieldset>
            <legend className="text-sm font-medium">Payment method</legend>
            <div className="mt-2 flex gap-4">
              <label className="flex min-h-touch items-center gap-2">
                <input type="radio" value="cash" {...register('paymentMethod')} />
                Cash
              </label>
              <label className="flex min-h-touch items-center gap-2">
                <input type="radio" value="card" {...register('paymentMethod')} />
                Card (demo)
              </label>
            </div>
          </fieldset>

          <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
            <div className="flex justify-between text-sm">
              <span>Subtotal ({totalItems} items)</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Delivery</span>
              <span>{formatCurrency(deliveryFee)}</span>
            </div>
            <div className="mt-2 flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          {!isAuthenticated ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <Link to="/login" state={{ from: { pathname: '/cart' } }} className="text-brand-600 hover:underline">
                Log in
              </Link>{' '}
              to place your order
            </p>
          ) : (
            <button type="submit" className="btn-primary w-full" disabled={submitting}>
              {submitting ? 'Placing order...' : 'Place Order'}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
