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
import { formatCurrency } from '../../utils/format';

export function AdminMenuPage() {
  const [items, setItems] = useState<(IMenuItem & { restaurantName?: string })[]>([]);
  const [restaurants, setRestaurants] = useState<IRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IMenuItem | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const form = useForm<MenuItemForm>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: { isAvailable: true, isPopular: false },
  });

  const load = () => {
    Promise.all([menuApi.listAll(), restaurantApi.list({ limit: 50 })]).then(
      ([itemsRes, restRes]) => {
        if (itemsRes.data.success && itemsRes.data.data)
          setItems(itemsRes.data.data as (IMenuItem & { restaurantName?: string })[]);
        if (restRes.data.success && restRes.data.data) setRestaurants(restRes.data.data);
      }
    ).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    form.reset({ isAvailable: true, isPopular: false });
    setImageFile(null);
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
    setImageFile(null);
    setModalOpen(true);
  };

  const onSubmit = async (data: MenuItemForm) => {
    const formData = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined && v !== null) formData.append(k, String(v));
    });
    if (imageFile) formData.append('image', imageFile);

    try {
      if (editing) {
        await menuApi.update(editing.id, formData);
        toast.success('Item updated');
      } else {
        await menuApi.create(formData);
        toast.success('Item created');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(getApiError(err));
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

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item?')) return;
    try {
      await menuApi.delete(id);
      toast.success('Deleted');
      load();
    } catch (err) {
      toast.error(getApiError(err));
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Menu management</h1>
        <button type="button" className="btn-primary" onClick={openCreate}>
          Add item
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
                    <img src={item.imageUrl} alt="" className="h-10 w-10 rounded object-cover" />
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
                    aria-label="Toggle popular"
                  >
                    {item.isPopular ? '★ Popular' : 'Mark popular'}
                  </button>
                </td>
                <td className="p-4">
                  <button type="button" className="text-brand-600 mr-2" onClick={() => openEdit(item)}>
                    Edit
                  </button>
                  <button type="button" className="text-red-600" onClick={() => handleDelete(item.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit item' : 'Add item'}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <input {...form.register('name')} placeholder="Name" className="input-field" />
          <textarea {...form.register('description')} placeholder="Description" className="input-field" rows={2} />
          <input type="number" step="0.01" {...form.register('price')} placeholder="Price" className="input-field" />
          <input {...form.register('category')} placeholder="Category" className="input-field" />
          <select {...form.register('restaurantId')} className="input-field">
            <option value="">Select restaurant</option>
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
          <label className="flex items-center gap-2">
            <input type="checkbox" {...form.register('isAvailable')} />
            Available
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" {...form.register('isPopular')} />
            Popular
          </label>
          <button type="submit" className="btn-primary w-full">
            {editing ? 'Update' : 'Create'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
