import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import type { IRestaurant } from '@food-ordering/shared';
import { restaurantApi } from '../../api';
import { getApiError } from '../../api/axios';
import { Modal } from '../../components/ui/Modal';
import { PageLoader } from '../../components/ui/Spinner';
import { formatCurrency } from '../../utils/format';

export function AdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState<IRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IRestaurant | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    cuisine: '',
    deliveryTime: 30,
    minimumOrder: 10,
    deliveryFee: 2.99,
    isOpen: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const load = () => {
    restaurantApi.list({ limit: 50 }).then(({ data }) => {
      if (data.success && data.data) setRestaurants(data.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: '',
      description: '',
      cuisine: '',
      deliveryTime: 30,
      minimumOrder: 10,
      deliveryFee: 2.99,
      isOpen: true,
    });
    setImageFile(null);
    setModalOpen(true);
  };

  const openEdit = (r: IRestaurant) => {
    setEditing(r);
    setForm({
      name: r.name,
      description: r.description,
      cuisine: r.cuisine.join(', '),
      deliveryTime: r.deliveryTime,
      minimumOrder: r.minimumOrder,
      deliveryFee: r.deliveryFee,
      isOpen: r.isOpen,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('description', form.description);
    form.cuisine.split(',').forEach((c) => {
      const trimmed = c.trim();
      if (trimmed) formData.append('cuisine[]', trimmed);
    });
    formData.append('deliveryTime', String(form.deliveryTime));
    formData.append('minimumOrder', String(form.minimumOrder));
    formData.append('deliveryFee', String(form.deliveryFee));
    formData.append('isOpen', String(form.isOpen));
    if (imageFile) formData.append('image', imageFile);

    try {
      if (editing) {
        await restaurantApi.update(editing.id, formData);
        toast.success('Restaurant updated');
      } else {
        await restaurantApi.create(formData);
        toast.success('Restaurant created');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(getApiError(err));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete restaurant and all menu items?')) return;
    try {
      await restaurantApi.delete(id);
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
        <h1 className="text-2xl font-bold">Restaurants</h1>
        <button type="button" className="btn-primary" onClick={openCreate}>
          Add restaurant
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {restaurants.map((r) => (
          <div key={r.id} className="card overflow-hidden">
            <img src={r.imageUrl} alt="" className="h-32 w-full object-cover" />
            <div className="p-4">
              <h3 className="font-semibold">{r.name}</h3>
              <p className="text-sm text-gray-500">{r.cuisine.join(', ')}</p>
              <p className="mt-1 text-sm">
                {formatCurrency(r.deliveryFee)} delivery • {r.deliveryTime} min
              </p>
              <div className="mt-3 flex gap-2">
                <button type="button" className="btn-secondary text-sm" onClick={() => openEdit(r)}>
                  Edit
                </button>
                <button type="button" className="text-sm text-red-600" onClick={() => handleDelete(r.id)}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit restaurant' : 'Add restaurant'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Name"
            className="input-field"
            required
          />
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Description"
            className="input-field"
            rows={2}
            required
          />
          <input
            value={form.cuisine}
            onChange={(e) => setForm({ ...form, cuisine: e.target.value })}
            placeholder="Cuisine (comma separated)"
            className="input-field"
          />
          <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
          <button type="submit" className="btn-primary w-full">
            {editing ? 'Update' : 'Create'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
