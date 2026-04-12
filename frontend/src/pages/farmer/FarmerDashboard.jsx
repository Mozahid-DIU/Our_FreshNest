import { useState } from 'react';
import { Package, Truck, ShoppingCart, TrendingUp, CalendarDays } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { StatCard } from '../../components/ui/StatCard';
import { Topbar } from '../../components/layout/Topbar';
import { ProposalCard } from '../../components/ui/ProposalCard';
import toast from 'react-hot-toast';
import { parseQuantityValue } from '../../utils/helpers';

export default function FarmerDashboard() {
  const { user } = useAuth();
  const { products, transport, deals, alternatives, proposals, updateProposal, decideAlternativeRequest } = useAppData();
  const [priceInputs, setPriceInputs] = useState({});
  const [alternativeInputs, setAlternativeInputs] = useState({});

  const myProducts = products.filter(p => p.farmerId === user?.id);
  const myTransport = transport.filter(t => t.farmerId === user?.id);
  const completedTransportCount = myTransport.filter((t) => t.status === 'completed').length;
  const myDeals = deals.filter(d => d.farmerId === user?.id);
  const soldOutProducts = myProducts.filter((product) => {
    const remaining = parseQuantityValue(product.availableQuantity ?? product.quantity ?? 0);
    return product.status === 'sold' || remaining <= 0;
  });
  const myProposals = proposals.filter((proposal) => proposal.farmerId === user?.id && (proposal.status === 'pendingreview' || proposal.status === 'awaitingfarmerprice'));
  const completedProposals = proposals.filter((proposal) => proposal.farmerId === user?.id && proposal.status === 'completed');
  const pendingAlternatives = alternatives.filter((item) => item.farmerId === user?.id && item.status === 'pendingfarmerdecision');

  const stats = [
    { icon: Package, label: 'My Produce', value: myProducts.length, color: 'green' },
    { icon: Truck, label: 'Transport Requests', value: myTransport.filter(t => t.status === 'pending').length, color: 'gold' },
    { icon: ShoppingCart, label: 'Active Deals', value: myDeals.filter(d => d.status === 'pending' || d.status === 'accepted').length, color: 'blue' },
    { icon: TrendingUp, label: 'Total Sales', value: completedTransportCount, color: 'forest' },
  ];

  const handleSubmitPrice = async (proposal) => {
    const value = priceInputs[proposal.id];
    if (!value) {
      toast.error('Enter a farmer price');
      return;
    }

    try {
      await updateProposal(proposal.id, {
        action: 'submit_price',
        farmer_price: Number(value),
      });
      toast.success('Price submitted to admin');
      setPriceInputs((current) => ({ ...current, [proposal.id]: '' }));
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to submit price');
    }
  };

  const handleAlternativeDecision = async (alternative, action) => {
    const input = alternativeInputs[alternative.id] || {};

    if (action === 'accept_new_price' && !input.newPricePerKg) {
      toast.error('Enter new price for this alternative request');
      return;
    }

    try {
      await decideAlternativeRequest(alternative.id, {
        action,
        newPricePerKg: input.newPricePerKg,
        notes: input.notes,
      });
      toast.success('Alternative request decision saved');
      setAlternativeInputs((current) => ({ ...current, [alternative.id]: { newPricePerKg: '', notes: '' } }));
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to process alternative request');
    }
  };

  return (
    <div>
      <Topbar title="Farmer Dashboard" />
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => <StatCard key={i} {...s} />)}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {myProducts.slice(0, 3).map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-ivory rounded-lg">
                <div>
                  <span className="font-medium block">{p.name} ({p.availableQuantity ?? p.quantity} {p.unit} available)</span>
                  <span className="text-xs text-gray-500 flex items-center gap-1 mt-1"><CalendarDays className="w-3.5 h-3.5" /> {p.harvestDate || '-'}</span>
                </div>
                <span className="text-sm text-gray-500">{p.availableQuantity ?? p.quantity} {p.unit} left • ৳{p.price}</span>
              </div>
            ))}
            {myProducts.length === 0 && <p className="text-gray-400">No produce listed yet</p>}
          </div>
        </div>

        <div className="mt-6 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Transport Proposal Requests</h3>
          <div className="space-y-4">
            {myProposals.length > 0 ? myProposals.map((proposal) => {
              const canRespond = proposal.status === 'pendingreview' || proposal.status === 'awaitingfarmerprice';
              return (
                <div key={proposal.id} className="space-y-3">
                  <ProposalCard proposal={proposal} />
                  {canRespond && (
                    <div className="flex flex-col gap-3 rounded-2xl border border-forest/10 bg-ivory p-4 sm:flex-row sm:items-end">
                      <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">Your price</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={priceInputs[proposal.id] || ''}
                          onChange={(e) => setPriceInputs((current) => ({ ...current, [proposal.id]: e.target.value }))}
                          className="w-full p-3 border rounded-xl"
                          placeholder="Enter price per kg"
                        />
                      </div>
                      <button onClick={() => handleSubmitPrice(proposal)} className="px-5 py-3 bg-forest text-white rounded-xl hover:bg-forest/90">
                        Submit price
                      </button>
                    </div>
                  )}
                </div>
              );
            }) : <p className="text-gray-400">No proposal requests yet</p>}
          </div>
        </div>

        <div className="mt-6 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Alternative Selling Requests</h3>
          <div className="space-y-4">
            {pendingAlternatives.length > 0 ? pendingAlternatives.map((item) => (
              <div key={item.id} className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 space-y-3">
                <div>
                  <p className="font-semibold text-forest">{item.produceName} • {item.quantity} kg</p>
                  <p className="text-sm text-gray-600">Dealer: {item.dealerName || 'N/A'} {item.dealerPhone ? `• ${item.dealerPhone}` : ''}</p>
                  <p className="text-sm text-gray-600">Set new price to continue selling or request return.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={alternativeInputs[item.id]?.newPricePerKg || ''}
                    onChange={(e) => setAlternativeInputs((current) => ({
                      ...current,
                      [item.id]: { ...(current[item.id] || {}), newPricePerKg: e.target.value },
                    }))}
                    className="w-full p-3 border rounded-xl"
                    placeholder="New price per kg (required)"
                  />
                  <input
                    type="text"
                    value={alternativeInputs[item.id]?.notes || ''}
                    onChange={(e) => setAlternativeInputs((current) => ({
                      ...current,
                      [item.id]: { ...(current[item.id] || {}), notes: e.target.value },
                    }))}
                    className="w-full p-3 border rounded-xl"
                    placeholder="Decision note (optional)"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleAlternativeDecision(item, 'accept_new_price')}
                    className="px-4 py-2 rounded-lg bg-forest text-white hover:bg-forest/90"
                  >
                    Continue With New Price
                  </button>
                  <button
                    onClick={() => handleAlternativeDecision(item, 'return_product')}
                    className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
                  >
                    Return Product
                  </button>
                </div>
              </div>
            )) : <p className="text-gray-400">No alternative requests pending</p>}
          </div>
        </div>

        <div className="mt-6 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Completed Proposal Status</h3>
          <div className="space-y-4">
            {completedProposals.length > 0 ? completedProposals.map((proposal) => (
              <ProposalCard key={proposal.id} proposal={proposal} />
            )) : <p className="text-gray-400">No completed proposals yet</p>}
          </div>
        </div>

        <div className="mt-6 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Sold Out Produce</h3>
          <div className="space-y-3">
            {soldOutProducts.length > 0 ? soldOutProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between rounded-lg bg-ivory p-3">
                <span className="font-medium">{product.name}</span>
                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">Sold Out</span>
              </div>
            )) : <p className="text-gray-400">No sold out produce yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}