import { Modal } from '../ui/Modal';
import { useCartStore } from '../../store/cartStore';

export function SwitchRestaurantModal() {
  const pendingItem = useCartStore((s) => s.pendingItem);
  const restaurantName = useCartStore((s) => s.restaurantName);
  const confirmSwitch = useCartStore((s) => s.confirmSwitch);
  const cancelSwitch = useCartStore((s) => s.cancelSwitch);

  return (
    <Modal
      isOpen={!!pendingItem}
      onClose={cancelSwitch}
      title="Switch restaurant?"
    >
      <p className="text-gray-600 dark:text-gray-400">
        Your cart has items from <strong>{restaurantName}</strong>. Adding items from{' '}
        <strong>{pendingItem?.restaurant.name}</strong> will clear your current cart.
      </p>
      <div className="mt-6 flex gap-3">
        <button type="button" className="btn-secondary flex-1" onClick={cancelSwitch}>
          Cancel
        </button>
        <button type="button" className="btn-primary flex-1" onClick={confirmSwitch}>
          Clear & switch
        </button>
      </div>
    </Modal>
  );
}
