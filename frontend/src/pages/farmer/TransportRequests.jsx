import { useState } from 'react';
import { Plus, Truck, MapPin, Route, Clock3 } from 'lucide-react';
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
  const acceptedDeals = deals
    .filter((d) => d.farmerId === user?.id && d.status === 'accepted')
    .sort((a, b) => new Date(b.respondedAt || b.createdAt || 0).getTime() - new Date(a.respondedAt || a.createdAt || 0).getTime());
  const acceptedDealsByProductId = acceptedDeals.reduce((acc, deal) => {
    const key = Number(deal.produceId);
    if (!key) return acc;
    if (!acc[key]) acc[key] = deal;
    return acc;
  }, {});
  const availableProduce = products.filter((p) => {
    if (p.farmerId !== user?.id) return false;
    const hasAcceptedBooking = Boolean(acceptedDealsByProductId[Number(p.id)]);
    if (hasAcceptedBooking) return true;
    return p.status !== 'sold' && (p.availableQuantity ?? p.quantity) > 0;
  });

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

  const getBookedQuantityForProduce = (produceId) => {
    const matchedDeal = acceptedDealsByProductId[Number(produceId)];
    return matchedDeal ? Number(matchedDeal.quantity || 0) : null;
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

    const bookedQuantity = getBookedQuantityForProduce(form.produceId);

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
        quantity: bookedQuantity || produce.availableQuantity || produce.quantity,
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
      <div className="p-6 space-y-6">
        <section className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-green">Transport workspace</p>
              <h2 className="mt-2 text-2xl font-bold text-forest sm:text-3xl">Keep your deliveries organized and visible.</h2>
              <p className="mt-3 text-base leading-7 text-slate">
                Create a request when produce is ready and track the route, contact, and current decision in one place.
              </p>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 rounded-full bg-green px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(39,174,96,0.2)] transition hover:-translate-y-0.5 hover:bg-green-dark">
              <Plus className="w-4 h-4" /> Request Transport
            </button>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              { label: 'Total requests', value: myRequests.length },
              { label: 'Active requests', value: myRequests.filter((request) => request.status === 'pending' || request.status === 'accepted').length },
              { label: 'Available produce', value: availableProduce.length },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl bg-ivory p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate">{item.label}</p>
                <p className="mt-2 text-2xl font-bold text-forest">{item.value}</p>
              </div>
            ))}
          </div>
          </section>

        {myRequests.length === 0 ? (
          <EmptyState icon={Truck} message="No transport requests yet" />
        ) : (
          <div className="grid gap-5 xl:grid-cols-2">
            {myRequests.map((request) => (
              <article key={request.id} className="rounded-[1.75rem] border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-green">
                      <Route className="h-4 w-4" /> Request
                    </div>
                    <h3 className="mt-3 text-xl font-bold text-forest">{request.produceName}</h3>
                    <p className="mt-1 text-sm text-slate">{request.quantity} units ready for pickup</p>
                  </div>
                  <Badge status={request.status} />
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-ivory p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate">Dealer</p>
                    <p className="mt-1 font-semibold text-forest">{request.dealerName || '-'}</p>
                    <p className="text-sm text-slate">{request.dealerPhone || '-'}</p>
                  </div>
                  <div className="rounded-2xl bg-ivory p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate">Contact</p>
                    <p className="mt-1 font-semibold text-forest">{request.contactPhone || request.farmerPhone || '-'}</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-gray-100 p-4">
                    <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate"><MapPin className="h-4 w-4 text-green" /> From</p>
                    <p className="mt-2 font-semibold text-forest">{request.fromLocation}</p>
                  </div>
                  <div className="rounded-2xl border border-gray-100 p-4">
                    <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate"><MapPin className="h-4 w-4 text-green" /> To</p>
                    <p className="mt-2 font-semibold text-forest">{request.toLocation}</p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-forest p-4 text-white">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/70">Description</p>
                  <p className="mt-2 text-sm leading-6 text-white/88">{request.notes || request.description || 'No extra instructions provided.'}</p>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm text-slate">
                    <Clock3 className="h-4 w-4" /> Track status from the dashboard
                  </div>
                  {(request.status === 'pending' || request.status === 'accepted') && <button onClick={() => handleCancel(request.id)} className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50">Cancel request</button>}
                </div>
              </article>
            ))}
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
                  {(() => {
                    const bookedQty = getBookedQuantityForProduce(p.id);
                    if (bookedQty) return `${p.name} - booked ${bookedQty}${p.unit}`;
                    return `${p.name} - ${p.availableQuantity ?? p.quantity}${p.unit}`;
                  })()}
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