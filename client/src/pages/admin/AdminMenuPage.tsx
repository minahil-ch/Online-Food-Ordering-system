import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import type { IMenuItem, IRestaurant } from '@food-ordering/shared';
import { menuApi, restaurantApi } from '../../api';
import { getApiError } from '../../api/axios';
import { menuItemSchema, type MenuItemForm } from '../../schemas/menuItem';
import { Modal } from '../../components/ui/Modal';
import { PageLoader } from '../../components/ui/Spinner';
import { ImagePicker, type ImageSelection } from '../../components/admin/ImagePicker';
import { formatCurrency } from '../../utils/format';

export function AdminMenuPage() {
  const [items, setItems] = useState<(IMenuItem & { restaurantName?: string })[]>([]);
  const [restaurants, setRestaurants] = useState<IRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IMenuItem | null>(null);
  const [imageSelection, setImageSelection] = useState<ImageSelection>({ file: null, url: null });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<MenuItemForm>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: { isAvailable: true, isPopular: false },
  });

  const load = () => {
    setLoading(true);
    Promise.all([menuApi.listAll(), restaurantApi.list({ limit: 100 })])
      .then(([itemsRes, restRes]) => {
        if (itemsRes.data.success && itemsRes.data.data)
          setItems(itemsRes.data.data as (IMenuItem & { restaurantName?: string })[]);
        if (restRes.data.success && restRes.data.data) setRestaurants(restRes.data.data);
      })
      .catch((err) => toast.error(getApiError(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    form.reset({ isAvailable: true, isPopular: false });
    setImageSelection({ file: null, url: null });
    setImagePreview(null);
    setModalOpen(true);
  };

  const openEdit = (item: IMenuItem) => {
    setEditing(item);
    form.reset({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      restaurantId: item.restaurantId,
      isAvailable: item.isAvailable,
      isPopular: item.isPopular,
    });
    setImageSelection({ file: null, url: item.imageUrl });
    setImagePreview(item.imageUrl);
    setModalOpen(true);
  };

  const handleImageChange = (selection: ImageSelection) => {
    setImageSelection(selection);
    if (selection.file) setImagePreview(URL.createObjectURL(selection.file));
    else if (selection.url) setImagePreview(selection.url);
    else setImagePreview(null);
  };

  const onSubmit = async (data: MenuItemForm) => {
    const formData = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined && v !== null) formData.append(k, String(v));
    });
    if (imageSelection.file) formData.append('image', imageSelection.file);
    else if (imageSelection.url) formData.append('imageUrl', imageSelection.url);

    setSubmitting(true);
    try {
      if (editing) {
        await menuApi.update(editing.id, formData);
        toast.success(`"${data.name}" updated`);
      } else {
        await menuApi.create(formData);
        toast.success(`"${data.name}" added to menu`);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await menuApi.toggle(id);
      load();
    } catch (err) {
      toast.error(getApiError(err));
    }
  };

  const handleTogglePopular = async (id: string) => {
    try {
      await menuApi.togglePopular(id);
      toast.success('Popular flag updated');
      load();
    } catch (err) {
      toast.error(getApiError(err));
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}" from the menu?`)) return;
    try {
      await menuApi.delete(id);
      toast.success('Item deleted');
      load();
    } catch (err) {
      toast.error(getApiError(err));
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Menu management</h1>
          <p className="mt-1 text-sm text-gray-500">Add, edit, or remove menu items across all restaurants.</p>
        </div>
        <button type="button" className="btn-primary" onClick={openCreate}>
          + Add menu item
        </button>
      </div>

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="p-4">Item</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Available</th>
              <th className="p-4">Popular</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={item.imageUrl} alt="" className="h-12 w-12 rounded-lg object-cover" />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.restaurantName}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">{item.category}</td>
                <td className="p-4">{formatCurrency(item.price)}</td>
                <td className="p-4">
                  <button
                    type="button"
                    onClick={() => handleToggle(item.id)}
                    className={`min-h-touch rounded px-2 py-1 text-xs ${
                      item.isAvailable ? 'bg-green-100 text-green-800' : 'bg-gray-100'
                    }`}
                  >
                    {item.isAvailable ? 'Yes' : 'No'}
                  </button>
                </td>
                <td className="p-4">
                  <button
                    type="button"
                    onClick={() => handleTogglePopular(item.id)}
                    className={`min-h-touch rounded px-2 py-1 text-xs ${
                      item.isPopular
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900'
                        : 'bg-gray-100 dark:bg-gray-800'
                    }`}
                  >
                    {item.isPopular ? '★ Popular' : 'Mark popular'}
                  </button>
                </td>
                <td className="p-4">
                  <button type="button" className="text-brand-600 mr-2" onClick={() => openEdit(item)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="text-red-600"
                    onClick={() => handleDelete(item.id, item.name)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => !submitting && setModalOpen(false)}
        title={editing ? `Edit: ${editing.name}` : 'Add menu item'}
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <ImagePicker
            label="Product image"
            variant="food"
            previewUrl={imagePreview}
            onChange={handleImageChange}
          />

          <div>
            <label className="text-sm font-medium">Name *</label>
            <input {...form.register('name')} className="input-field mt-1" placeholder="Item name" />
          </div>
          <div>
            <label className="text-sm font-medium">Description *</label>
            <textarea
              {...form.register('description')}
              className="input-field mt-1"
              rows={2}
              placeholder="Short description"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Price ($) *</label>
              <input
                type="number"
                step="0.01"
                {...form.register('price')}
                className="input-field mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Category *</label>
              <input {...form.register('category')} className="input-field mt-1" placeholder="e.g. Pizza" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Restaurant *</label>
            <select {...form.register('restaurantId')} className="input-field mt-1">
              <option value="">Select restaurant</option>
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" {...form.register('isAvailable')} />
            Available for ordering
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" {...form.register('isPopular')} />
            Mark as popular / featured
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
              {submitting ? 'Saving...' : editing ? 'Save changes' : 'Add item'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
