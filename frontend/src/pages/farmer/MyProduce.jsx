import { useState } from 'react';
import { Plus, Trash2, Package } from 'lucide-react';
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
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Your Produce List</h2>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-green text-white rounded-lg hover:bg-green-dark">
            <Plus className="w-4 h-4" /> Add Produce
          </button>
        </div>

        {myProducts.length === 0 ? (
          <EmptyState icon={Package} message="No produce listed yet. Add your first produce!" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold text-gray-600">Image</th>
                  <th className="text-left p-3 font-semibold text-gray-600">Name</th>
                  <th className="text-left p-3 font-semibold text-gray-600">Harvest Date</th>
                  <th className="text-left p-3 font-semibold text-gray-600">Available</th>
                  <th className="text-left p-3 font-semibold text-gray-600">Price</th>
                  <th className="text-left p-3 font-semibold text-gray-600">Status</th>
                  <th className="text-left p-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {myProducts.map((p, idx) => (
                  <tr key={p.id} className={`border-b ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="p-3">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="w-12 h-12 object-cover rounded-lg" />
                      ) : (
                        <span className="text-2xl">{p.name?.[0] || '🌿'}</span>
                      )}
                    </td>
                    <td className="p-3 font-medium">{p.name}</td>
                    <td className="p-3">{p.harvestDate || '-'}</td>
                    <td className="p-3">{p.availableQuantity ?? p.quantity} {p.unit}</td>
                    <td className="p-3">৳{p.price}/{p.unit}</td>
                    <td className="p-3">
                      {(() => {
                        const normalizedStatus = String(p.status || 'available').toLowerCase();
                        const displayStatus = normalizedStatus === 'reserved' ? 'available' : normalizedStatus;

                        return (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        displayStatus === 'available'
                          ? 'bg-green-100 text-green-800'
                          : displayStatus === 'sold'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                        {displayStatus === 'sold' ? 'Sold Out' : displayStatus}
                      </span>
                        );
                      })()}
                    </td>
                    <td className="p-3">
                      <button onClick={() => handleDelete(p.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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