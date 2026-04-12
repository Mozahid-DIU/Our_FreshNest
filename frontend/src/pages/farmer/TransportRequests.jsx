import { useState } from 'react';
import { Plus, Truck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { Modal } from '../../components/ui/Modal';
import { Topbar } from '../../components/layout/Topbar';
import { EmptyState } from '../../components/ui/EmptyState';
import { Badge } from '../../components/ui/Badge';
import toast from 'react-hot-toast';

export default function TransportRequests() {
  const { user } = useAuth();
  const { products, transport, deals, addTransport, updateTransport } = useAppData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    produceId: '',
    fromLocation: '',
    toLocation: '',
    contactPhone: user?.phone || '',
    dealerId: '',
    dealerName: '',
    dealerPhone: '',
    dealerLocation: '',
    description: '',
  });

  const myRequests = transport.filter((t) => t.farmerId === user?.id);
  const availableProduce = products.filter(
    (p) => p.farmerId === user?.id && p.status !== 'sold' && (p.availableQuantity ?? p.quantity) > 0
  );
  const acceptedDeals = deals
    .filter((d) => d.farmerId === user?.id && d.status === 'accepted')
    .sort((a, b) => new Date(b.respondedAt || b.createdAt || 0).getTime() - new Date(a.respondedAt || a.createdAt || 0).getTime());

  const handleProduceChange = (produceId) => {
    const selectedProduce = products.find((p) => p.id === Number(produceId));
    const matchedDeal = acceptedDeals.find((deal) => Number(deal.produceId) === Number(produceId));

    setForm((current) => ({
      ...current,
      produceId,
      fromLocation: selectedProduce?.location || current.fromLocation,
      dealerId: matchedDeal?.dealerId || '',
      dealerName: matchedDeal?.dealerName || '',
      dealerPhone: matchedDeal?.dealerPhone || '',
      dealerLocation: matchedDeal?.dealerLocation || '',
    }));
  };

  const handleSubmit = async () => {
    if (!form.produceId || !form.fromLocation || !form.toLocation || !form.contactPhone || !form.dealerName) {
      toast.error('Please fill all required fields');
      return;
    }
    const produce = products.find((p) => p.id === Number(form.produceId));
    if (!produce) {
      toast.error('Selected produce is no longer available');
      return;
    }

    try {
      await addTransport({
        produceId: produce.id,
        farmerId: user.id,
        farmerName: user.name,
        produceName: produce.name,
        contactPhone: form.contactPhone,
        dealerId: form.dealerId ? Number(form.dealerId) : null,
        dealerName: form.dealerName,
        dealerPhone: form.dealerPhone,
        dealerLocation: form.dealerLocation,
        fromLocation: form.fromLocation,
        toLocation: form.toLocation,
        quantity: produce.availableQuantity ?? produce.quantity,
        description: form.description,
      });
      toast.success('Transport request created');
      setIsModalOpen(false);
      setForm({
        produceId: '',
        fromLocation: '',
        toLocation: '',
        contactPhone: user?.phone || '',
        dealerId: '',
        dealerName: '',
        dealerPhone: '',
        dealerLocation: '',
        description: '',
      });
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to create transport request');
    }
  };

  const handleCancel = async (id) => {
    if (confirm('Cancel this transport request?')) {
      try {
        await updateTransport(id, { status: 'cancelled' });
        toast.success('Request cancelled');
      } catch (err) {
        toast.error(err?.response?.data?.error || 'Failed to cancel request');
      }
    }
  };

  return (
    <div>
      <Topbar title="Transport Requests" />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">My Transport Requests</h2>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-green text-white rounded-lg hover:bg-green-dark">
            <Plus className="w-4 h-4" /> Request Transport
          </button>
        </div>

        {myRequests.length === 0 ? (
          <EmptyState icon={Truck} message="No transport requests yet" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold text-gray-600">Produce</th>
                  <th className="text-left p-3 font-semibold text-gray-600">Dealer</th>
                  <th className="text-left p-3 font-semibold text-gray-600">Contact Phone</th>
                  <th className="text-left p-3 font-semibold text-gray-600">From</th>
                  <th className="text-left p-3 font-semibold text-gray-600">To</th>
                  <th className="text-left p-3 font-semibold text-gray-600">Description</th>
                  <th className="text-left p-3 font-semibold text-gray-600">Status</th>
                  <th className="text-left p-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {myRequests.map((t, idx) => (
                  <tr key={t.id} className={`border-b ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="p-3 font-medium">{t.produceName}</td>
                    <td className="p-3">
                      <span className="block font-medium">{t.dealerName || '-'}</span>
                      <span className="text-xs text-gray-500">{t.dealerPhone || '-'}</span>
                    </td>
                    <td className="p-3">{t.contactPhone || t.farmerPhone || '-'}</td>
                    <td className="p-3">{t.fromLocation}</td>
                    <td className="p-3">{t.toLocation}</td>
                    <td className="p-3">{t.notes || '-'}</td>
                    <td className="p-3"><Badge status={t.status} /></td>
                    <td className="p-3">
                      {(t.status === 'pending' || t.status === 'accepted') && <button onClick={() => handleCancel(t.id)} className="px-3 py-1 text-sm text-red-500 hover:bg-red-50 rounded">Cancel</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Request Transport">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Select Produce</label>
            <select value={form.produceId} onChange={(e) => handleProduceChange(e.target.value)} className="w-full p-3 border rounded-xl">
              <option value="">Select...</option>
              {availableProduce.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} - {p.availableQuantity ?? p.quantity}{p.unit}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">You can request transport any time for your available produce.</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Dealer Name *</label>
            <input value={form.dealerName} onChange={(e) => setForm((current) => ({ ...current, dealerName: e.target.value }))} className="w-full p-3 border rounded-xl" placeholder="e.g. Dhaka Fresh Ltd" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Dealer Phone</label>
              <input value={form.dealerPhone} onChange={(e) => setForm((current) => ({ ...current, dealerPhone: e.target.value }))} className="w-full p-3 border rounded-xl" placeholder="e.g. +8801xxxxxxxxx" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Dealer Location</label>
              <input value={form.dealerLocation} onChange={(e) => setForm((current) => ({ ...current, dealerLocation: e.target.value }))} className="w-full p-3 border rounded-xl" placeholder="e.g. Dhaka" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Contact Phone *</label>
            <input value={form.contactPhone} onChange={(e) => setForm((current) => ({ ...current, contactPhone: e.target.value }))} className="w-full p-3 border rounded-xl" placeholder="e.g. +8801xxxxxxxxx" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">From Location</label>
            <input value={form.fromLocation} onChange={(e) => setForm((current) => ({ ...current, fromLocation: e.target.value }))} className="w-full p-3 border rounded-xl" placeholder="e.g. Rajshahi" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">To Location</label>
            <input value={form.toLocation} onChange={(e) => setForm((current) => ({ ...current, toLocation: e.target.value }))} className="w-full p-3 border rounded-xl" placeholder="e.g. Dhaka" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))} className="w-full p-3 border rounded-xl" rows="3" placeholder="Transport instructions, handling notes, or route details" />
          </div>
          <button onClick={handleSubmit} className="w-full py-3 bg-green text-white font-semibold rounded-xl hover:bg-green-dark">Create Request</button>
        </div>
      </Modal>
    </div>
  );
}