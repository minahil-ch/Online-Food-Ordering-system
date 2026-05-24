import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CUISINE_OPTIONS } from '@food-ordering/shared';
import type { IRestaurant } from '@food-ordering/shared';
import { restaurantApi } from '../../api';
import { getApiError } from '../../api/axios';
import { Modal } from '../../components/ui/Modal';
import { PageLoader } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatCurrency } from '../../utils/format';
import { formatOpeningHours } from '../../utils/restaurant';
import { ImagePicker, type ImageSelection } from '../../components/admin/ImagePicker';

interface RestaurantFormState {
  name: string;
  description: string;
  cuisine: string;
  rating: number;
  deliveryTime: number;
  minimumOrder: number;
  deliveryFee: number;
  isOpen: boolean;
  hoursOpen: string;
  hoursClose: string;
  hoursDays: string;
}

const defaultForm: RestaurantFormState = {
  name: '',
  description: '',
  cuisine: '',
  rating: 4.5,
  deliveryTime: 30,
  minimumOrder: 10,
  deliveryFee: 2.99,
  isOpen: true,
  hoursOpen: '10:00',
  hoursClose: '22:00',
  hoursDays: 'Mon–Sun',
};

function buildFormData(form: RestaurantFormState, image: ImageSelection): FormData {
  const fd = new FormData();
  fd.append('name', form.name.trim());
  fd.append('description', form.description.trim());
  fd.append('rating', String(form.rating));
  fd.append('deliveryTime', String(form.deliveryTime));
  fd.append('minimumOrder', String(form.minimumOrder));
  fd.append('deliveryFee', String(form.deliveryFee));
  fd.append('isOpen', String(form.isOpen));
  fd.append('openingHours.open', form.hoursOpen);
  fd.append('openingHours.close', form.hoursClose);
  fd.append('openingHours.days', form.hoursDays);

  form.cuisine
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean)
    .forEach((c) => fd.append('cuisine[]', c));

  if (image.file) fd.append('image', image.file);
  else if (image.url) fd.append('imageUrl', image.url);
  return fd;
}

export function AdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState<IRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IRestaurant | null>(null);
  const [form, setForm] = useState<RestaurantFormState>(defaultForm);
  const [imageSelection, setImageSelection] = useState<ImageSelection>({ file: null, url: null });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    restaurantApi
      .list({ limit: 100 })
      .then(({ data }) => {
        if (data.success && data.data) setRestaurants(data.data);
      })
      .catch((err) => toast.error(getApiError(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setImageSelection({ file: null, url: null });
    setImagePreview(null);
    setModalOpen(true);
  };

  const openEdit = (r: IRestaurant) => {
    setEditing(r);
    setForm({
      name: r.name,
      description: r.description,
      cuisine: r.cuisine.join(', '),
      rating: r.rating,
      deliveryTime: r.deliveryTime,
      minimumOrder: r.minimumOrder,
      deliveryFee: r.deliveryFee,
      isOpen: r.isOpen,
      hoursOpen: r.openingHours?.open ?? '10:00',
      hoursClose: r.openingHours?.close ?? '22:00',
      hoursDays: r.openingHours?.days ?? 'Mon–Sun',
    });
    setImageSelection({ file: null, url: r.imageUrl });
    setImagePreview(r.imageUrl);
    setModalOpen(true);
  };

  const handleImageChange = (selection: ImageSelection) => {
    setImageSelection(selection);
    if (selection.file) {
      setImagePreview(URL.createObjectURL(selection.file));
    } else if (selection.url) {
      setImagePreview(selection.url);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.description.trim()) {
      toast.error('Name and description are required');
      return;
    }

    setSubmitting(true);
    const formData = buildFormData(form, imageSelection);

    try {
      if (editing) {
        await restaurantApi.update(editing.id, formData);
        toast.success(`"${form.name}" updated successfully`);
      } else {
        await restaurantApi.create(formData);
        toast.success(`"${form.name}" added successfully`);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (r: IRestaurant) => {
    if (
      !confirm(
        `Delete "${r.name}"?\n\nThis will permanently remove the restaurant and ALL its menu items.`
      )
    ) {
      return;
    }
    try {
      await restaurantApi.delete(r.id);
      toast.success(`"${r.name}" deleted`);
      load();
    } catch (err) {
      toast.error(getApiError(err));
    }
  };

  const addCuisineChip = (cuisine: string) => {
    const current = form.cuisine
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);
    if (!current.includes(cuisine)) {
      setForm({ ...form, cuisine: [...current, cuisine].join(', ') });
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Restaurant management</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Add, edit, or remove restaurants. Changes appear immediately for customers.
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={openCreate}>
          + Add restaurant
        </button>
      </div>

      {restaurants.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No restaurants yet"
            description="Add your first restaurant to start building the menu."
            actionLabel="Add restaurant"
            icon="🏪"
          />
          <div className="mt-4 text-center">
            <button type="button" className="btn-primary" onClick={openCreate}>
              Add restaurant
            </button>
          </div>
        </div>
      ) : (
        <div className="card mt-6 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                <th className="p-4">Restaurant</th>
                <th className="p-4">Cuisine</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Hours / Status</th>
                <th className="p-4">Delivery</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {restaurants.map((r) => (
                <tr key={r.id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={r.imageUrl}
                        alt=""
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-medium">{r.name}</p>
                        <p className="line-clamp-1 max-w-xs text-xs text-gray-500">
                          {r.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">{r.cuisine.join(', ') || '—'}</td>
                  <td className="p-4">★ {r.rating.toFixed(1)}</td>
                  <td className="p-4">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs ${
                        r.isOpen
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-800'
                      }`}
                    >
                      {formatOpeningHours(r)}
                    </span>
                  </td>
                  <td className="p-4">
                    {r.deliveryTime} min · {formatCurrency(r.deliveryFee)}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        className="btn-secondary text-xs"
                        onClick={() => openEdit(r)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-900/20"
                        onClick={() => handleDelete(r)}
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => !submitting && setModalOpen(false)}
        title={editing ? `Edit: ${editing.name}` : 'Add new restaurant'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <ImagePicker
            label="Restaurant cover image"
            variant="restaurant"
            previewUrl={imagePreview}
            onChange={handleImageChange}
          />

          <div>
            <label className="text-sm font-medium">Restaurant name *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-field mt-1"
              required
              placeholder="e.g. Bella Italia Pizzeria"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input-field mt-1"
              rows={3}
              required
              placeholder="Short description for customers"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Cuisine types</label>
            <input
              value={form.cuisine}
              onChange={(e) => setForm({ ...form, cuisine: e.target.value })}
              className="input-field mt-1"
              placeholder="Pizza, Italian (comma separated)"
            />
            <div className="mt-2 flex flex-wrap gap-1">
              {CUISINE_OPTIONS.slice(0, 6).map((c) => (
                <button
                  key={c}
                  type="button"
                  className="rounded-full bg-gray-100 px-2 py-1 text-xs dark:bg-gray-800"
                  onClick={() => addCuisineChip(c)}
                >
                  + {c}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Rating (0–5)</label>
              <input
                type="number"
                step="0.1"
                min={0}
                max={5}
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                className="input-field mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Delivery time (min)</label>
              <input
                type="number"
                min={1}
                value={form.deliveryTime}
                onChange={(e) => setForm({ ...form, deliveryTime: Number(e.target.value) })}
                className="input-field mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Minimum order ($)</label>
              <input
                type="number"
                step="0.01"
                min={0}
                value={form.minimumOrder}
                onChange={(e) => setForm({ ...form, minimumOrder: Number(e.target.value) })}
                className="input-field mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Delivery fee ($)</label>
              <input
                type="number"
                step="0.01"
                min={0}
                value={form.deliveryFee}
                onChange={(e) => setForm({ ...form, deliveryFee: Number(e.target.value) })}
                className="input-field mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-sm font-medium">Opens</label>
              <input
                type="time"
                value={form.hoursOpen}
                onChange={(e) => setForm({ ...form, hoursOpen: e.target.value })}
                className="input-field mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Closes</label>
              <input
                type="time"
                value={form.hoursClose}
                onChange={(e) => setForm({ ...form, hoursClose: e.target.value })}
                className="input-field mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Days</label>
              <input
                value={form.hoursDays}
                onChange={(e) => setForm({ ...form, hoursDays: e.target.value })}
                className="input-field mt-1"
                placeholder="Mon–Sun"
              />
            </div>
          </div>

          <label className="flex min-h-touch items-center gap-2">
            <input
              type="checkbox"
              checked={form.isOpen}
              onChange={(e) => setForm({ ...form, isOpen: e.target.checked })}
              className="h-4 w-4"
            />
            <span className="text-sm font-medium">Restaurant is open for orders</span>
          </label>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              className="btn-secondary flex-1"
              disabled={submitting}
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={submitting}>
              {submitting ? 'Saving...' : editing ? 'Save changes' : 'Add restaurant'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
