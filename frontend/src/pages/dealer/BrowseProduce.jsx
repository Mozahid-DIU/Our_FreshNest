import { useState } from 'react';
import { Package, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { Modal } from '../../components/ui/Modal';
import { Topbar } from '../../components/layout/Topbar';
import { EmptyState } from '../../components/ui/EmptyState';
import { ProduceCard } from '../../components/ui/ProduceCard';
import toast from 'react-hot-toast';
import { parseQuantityValue } from '../../utils/helpers';

export default function BrowseProduce() {
  const { user } = useAuth();
  const { products, addDeal } = useAppData();
  const [filter, setFilter] = useState('all');
  const [selectedProduce, setSelectedProduce] = useState(null);
  const [dealForm, setDealForm] = useState({ quantity: '', price: '', message: '' });

  const dealerProduce = products.filter((p) => p.farmerId !== user?.id);
  const categories = ['all', 'Fruit', 'Vegetable', 'Root Vegetable', 'Leafy Vegetable', 'Legume'];
  const filtered = filter === 'all' ? dealerProduce : dealerProduce.filter((p) => p.category === filter);
  const soldOutCount = filtered.filter((p) => String(p.status || '').toLowerCase() === 'sold' || parseQuantityValue(p.availableQuantity ?? p.quantity) <= 0).length;

  const handleMakeOffer = async () => {
    const remainingQty = parseQuantityValue(selectedProduce?.availableQuantity ?? selectedProduce?.quantity);
    if (!selectedProduce || remainingQty <= 0 || String(selectedProduce.status || '').toLowerCase() === 'sold') {
      toast.error('This product is sold out');
      return;
    }

    if (!dealForm.quantity || !dealForm.price) {
      toast.error('Please fill quantity and price');
      return;
    }

    if (Number(dealForm.quantity) <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }

    if (Number(dealForm.quantity) > remainingQty) {
      toast.error(`Only ${remainingQty} ${selectedProduce.unit} available`);
      return;
    }

    try {
      await addDeal({
        produceId: selectedProduce.id,
        dealerId: user.id,
        dealerName: user.name,
        farmerId: selectedProduce.farmerId,
        farmerName: selectedProduce.farmerName,
        produceName: selectedProduce.name,
        quantity: Number(dealForm.quantity),
        price: Number(dealForm.price),
        message: dealForm.message,
      });
      toast.success('Deal offer sent!');
      setSelectedProduce(null);
      setDealForm({ quantity: '', price: '', message: '' });
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to send deal');
    }
  };

  return (
    <div>
      <Topbar title="Browse Produce" />
      <div className="p-6 space-y-6">
        <section className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-green">Supply marketplace</p>
              <h2 className="mt-2 text-2xl font-bold text-forest sm:text-3xl">Compare fresh listings and send confident offers.</h2>
              <p className="mt-3 text-base leading-7 text-slate">
                Filter by produce category, check available quantity, and open a product card to submit your price and quantity offer.
              </p>
            </div>
            <div className="rounded-2xl bg-ivory px-5 py-4 text-sm text-slate">
              <p className="font-semibold text-forest">Visible listings: {filtered.length}</p>
              <p className="mt-1">Sold out in view: {soldOutCount}</p>
            </div>
          </div>
        </section>

        <div className="rounded-[2rem] border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-green">
            <Search className="h-4 w-4" />
            Category filters
          </div>
          <div className="flex gap-2 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${filter === cat ? 'bg-forest text-white shadow-sm' : 'bg-white border border-gray-200 hover:border-forest hover:text-forest'}`}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={Package} message="No produce available" />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => (
              <ProduceCard
                key={p.id}
                produce={p}
                disabled={String(p.status || '').toLowerCase() === 'sold' || parseQuantityValue(p.availableQuantity ?? p.quantity) <= 0}
                onClick={() => setSelectedProduce(p)}
              />
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={!!selectedProduce} onClose={() => setSelectedProduce(null)} title={`Make Offer - ${selectedProduce?.name}`}>
        <div className="space-y-4">
          <div className="rounded-2xl bg-ivory p-4">
            <p className="text-sm text-gray-500">Available: {selectedProduce?.availableQuantity ?? selectedProduce?.quantity} {selectedProduce?.unit}</p>
            <p className="font-bold">Price: ৳{selectedProduce?.price}/{selectedProduce?.unit}</p>
            <p className="text-sm text-gray-600 mt-1">Farmer: {selectedProduce?.farmerName} · {selectedProduce?.farmerPhone || 'Phone hidden'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Quantity *</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              max={parseQuantityValue(selectedProduce?.availableQuantity ?? selectedProduce?.quantity) || undefined}
              value={dealForm.quantity}
              onChange={(e) => setDealForm((current) => ({ ...current, quantity: e.target.value }))}
              className="w-full p-3 border rounded-xl"
              placeholder="100"
            />
            <p className="mt-1 text-xs text-gray-500">
              Max offer quantity: {parseQuantityValue(selectedProduce?.availableQuantity ?? selectedProduce?.quantity) || 0} {selectedProduce?.unit}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Your Offer (৳) *</label>
            <input type="number" value={dealForm.price} onChange={(e) => setDealForm((current) => ({ ...current, price: e.target.value }))} className="w-full p-3 border rounded-xl" placeholder="30" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Message (Optional)</label>
            <textarea value={dealForm.message} onChange={(e) => setDealForm((current) => ({ ...current, message: e.target.value }))} className="w-full p-3 border rounded-xl" rows="2" placeholder="Any message for the farmer..." />
          </div>
          <button onClick={handleMakeOffer} className="w-full rounded-xl bg-green py-3 font-semibold text-white transition hover:bg-green-dark">Send Offer</button>
        </div>
      </Modal>
    </div>
  );
}