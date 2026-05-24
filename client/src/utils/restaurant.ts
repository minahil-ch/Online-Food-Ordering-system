import type { IRestaurant, OpeningHours } from '@food-ordering/shared';

export function formatOpeningHours(restaurant: Pick<IRestaurant, 'isOpen' | 'openingHours'>): string {
  const hours = restaurant.openingHours;
  if (hours) {
    const status = restaurant.isOpen ? 'Open' : 'Closed';
    return `${status} · ${hours.days ?? 'Daily'} ${hours.open}–${hours.close}`;
  }
  return restaurant.isOpen ? 'Open now' : 'Closed';
}

export function formatHoursOnly(hours?: OpeningHours): string {
  if (!hours) return 'Hours vary';
  return `${hours.days ?? 'Daily'}: ${hours.open} – ${hours.close}`;
}
