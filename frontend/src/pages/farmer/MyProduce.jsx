import { useState } from 'react';
import { Plus, Trash2, Package, CalendarDays, Thermometer } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { Modal } from '../../components/ui/Modal';
import { ImageUpload } from '../../components/ui/ImageUpload';
import { Topbar } from '../../components/layout/Topbar';
import { EmptyState } from '../../components/ui/EmptyState';
import { PRODUCE_DB, getStorageTips } from '../../utils/produceDB';
import toast from 'react-hot-toast';

const emptyImageSlots = ['', '', ''];

export default function MyProduce() {
  const { user } = useAuth();
  const { products, addProduct, deleteProduct } = useAppData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [useManualName, setUseManualName] = useState(false);
  const [form, setForm] = useState({
    name: '',
    harvestDate: '',
    quantity: '',
    unit: 'kg',
    price: '',
    category: '',
    shortDescription: '',
    imageUrls: emptyImageSlots,
  });
  const [storageTip, setStorageTip] = useState(null);

  const myProducts = products.filter((p) => p.farmerId === user?.id);

  const resetForm = () => {
    setForm({
      name: '',
      harvestDate: '',
      quantity: '',
      unit: 'kg',
      price: '',
      category: '',
      shortDescription: '',
      imageUrls: emptyImageSlots,
    });
    setStorageTip(null);
    setUseManualName(false);
  };

  const handleNameChange = (name) => {
    const info = getStorageTips(name);
    setStorageTip(info);
    setForm((current) => ({
      ...current,
      name,
      category: info?.category || current.category,
      shortDescription: info ? info.tips : current.shortDescription,
    }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.quantity || !form.price || !form.harvestDate) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      await addProduct({
        farmerId: user.id,
        farmerName: user.name,
        name: form.name,
        harvestDate: form.harvestDate,
        quantity: Number(form.quantity),
        unit: form.unit,
        price: Number(form.price),
        category: form.category || storageTip?.category || 'Vegetable',
        shortDescription: form.shortDescription,
        imageUrls: form.imageUrls.filter(Boolean),
        imageUrl: form.imageUrls.find(Boolean) || null,
        storageTemp: storageTip?.temp,
        freshDays: storageTip?.days,
        storageTips: storageTip?.tips,
      });
      toast.success('Produce added successfully');
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to add produce');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this produce?')) {
      try {
        await deleteProduct(id);
        toast.success('Produce deleted');
      } catch (err) {
        toast.error(err?.response?.data?.error || 'Failed to delete produce');
      }
    }
  };

  return (
    <div>
      <Topbar title="My Produce" />
      <div className="p-6 space-y-6">
        <section className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-green">Inventory workspace</p>
              <h2 className="mt-2 text-2xl font-bold text-forest sm:text-3xl">Manage your produce like a proper operation.</h2>
              <p className="mt-3 text-base leading-7 text-slate">
                Add new stock, review storage tips, and keep visible control over the produce you have ready for sale.
              </p>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 rounded-full bg-green px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(39,174,96,0.2)] transition hover:-translate-y-0.5 hover:bg-green-dark">
              <Plus className="w-4 h-4" /> Add Produce
            </button>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              { label: 'Listed items', value: myProducts.length },
              { label: 'Latest status', value: myProducts.length ? 'Active inventory' : 'No items yet' },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl bg-ivory p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate">{item.label}</p>
                <p className="mt-2 text-2xl font-bold text-forest">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        {myProducts.length === 0 ? (
          <EmptyState icon={Package} message="No produce listed yet. Add your first produce!" />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {myProducts.map((product) => {
              const normalizedStatus = String(product.status || 'available').toLowerCase();
              const displayStatus = normalizedStatus === 'reserved' ? 'available' : normalizedStatus;

              return (
                <article key={product.id} className="overflow-hidden rounded-[1.75rem] border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="relative h-48 bg-ivory">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-6xl">{product.name?.[0] || '🌿'}</div>
                    )}
                    <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-forest shadow-sm backdrop-blur">
                      {displayStatus === 'sold' ? 'Sold Out' : displayStatus}
                    </div>
                  </div>

                  <div className="space-y-4 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-bold text-forest">{product.name}</h3>
                        <p className="mt-1 text-sm text-slate">{product.category || 'Category not set'}</p>
                      </div>
                      <button onClick={() => handleDelete(product.id)} className="rounded-full border border-red-100 p-2 text-red-500 transition hover:bg-red-50" aria-label={`Delete ${product.name}`}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-ivory p-3">
                        <p className="flex items-center gap-1 text-xs uppercase tracking-[0.18em] text-slate"><CalendarDays className="h-3.5 w-3.5" /> Harvest</p>
                        <p className="mt-2 text-sm font-semibold text-forest">{product.harvestDate || '-'}</p>
                      </div>
                      <div className="rounded-2xl bg-ivory p-3">
                        <p className="flex items-center gap-1 text-xs uppercase tracking-[0.18em] text-slate"><Thermometer className="h-3.5 w-3.5" /> Storage</p>
                        <p className="mt-2 text-sm font-semibold text-forest">{product.storageTemp || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl bg-forest px-4 py-3 text-white">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-white/70">Available</p>
                        <p className="text-sm font-semibold">{product.availableQuantity ?? product.quantity} {product.unit}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs uppercase tracking-[0.18em] text-white/70">Price</p>
                        <p className="text-sm font-semibold">৳{product.price}/{product.unit}</p>
                      </div>
                    </div>

                    {product.shortDescription && <p className="text-sm leading-6 text-slate">{product.shortDescription}</p>}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); resetForm(); }} title="Add New Produce">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <label className="block text-sm font-medium">Product Name</label>
            <button type="button" onClick={() => setUseManualName((current) => !current)} className="text-sm text-forest underline">
              {useManualName ? 'Use produce list' : 'Enter manually'}
            </button>
          </div>

          {useManualName ? (
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
              className="w-full p-3 border rounded-xl"
              placeholder="Enter product name"
            />
          ) : (
            <select value={form.name} onChange={(e) => handleNameChange(e.target.value)} className="w-full p-3 border rounded-xl">
              <option value="">Select produce...</option>
              {PRODUCE_DB.map((p) => <option key={p.name} value={p.name}>{p.emoji} {p.name}</option>)}
            </select>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Harvest Date *</label>
            <input type="date" value={form.harvestDate} onChange={(e) => setForm((current) => ({ ...current, harvestDate: e.target.value }))} className="w-full p-3 border rounded-xl" />
          </div>

          {storageTip && !useManualName && (
            <div className="p-3 bg-green-50 rounded-lg text-sm">
              <p className="font-medium text-green-800">Storage Tips:</p>
              <p className="text-green-700">{storageTip.tips}</p>
              <p className="text-green-600 mt-1">🌡️ {storageTip.temp} | ⏰ {storageTip.days} days fresh</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Quantity *</label>
              <input type="number" value={form.quantity} onChange={(e) => setForm((current) => ({ ...current, quantity: e.target.value }))} className="w-full p-3 border rounded-xl" placeholder="500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Unit</label>
              <select value={form.unit} onChange={(e) => setForm((current) => ({ ...current, unit: e.target.value }))} className="w-full p-3 border rounded-xl">
                <option value="kg">kg</option>
                <option value="ton">ton</option>
                <option value="pieces">pieces</option>
                <option value="crate">crate</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Price per Unit (৳) *</label>
            <input type="number" value={form.price} onChange={(e) => setForm((current) => ({ ...current, price: e.target.value }))} className="w-full p-3 border rounded-xl" placeholder="25" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Short Description</label>
            <textarea
              value={form.shortDescription}
              onChange={(e) => setForm((current) => ({ ...current, shortDescription: e.target.value }))}
              className="w-full p-3 border rounded-xl"
              rows="3"
              placeholder="Short details about quality, packing, grading, or special handling"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Product Images (up to 3)</label>
            <div className="grid gap-3">
              {form.imageUrls.map((imageUrl, index) => (
                <ImageUpload
                  key={index}
                  value={imageUrl}
                  onChange={(img) => setForm((current) => ({
                    ...current,
                    imageUrls: current.imageUrls.map((item, itemIndex) => (itemIndex === index ? img : item)),
                  }))}
                />
              ))}
            </div>
          </div>

          <button onClick={handleSubmit} className="w-full py-3 bg-green text-white font-semibold rounded-xl hover:bg-green-dark">Add Produce</button>
        </div>
      </Modal>
    </div>
  );
}