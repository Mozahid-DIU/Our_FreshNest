import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, ShoppingCart, TrendingUp, CalendarDays, ArrowRight, Sprout, ClipboardList } from 'lucide-react';
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

  const myProducts = products.filter((product) => product.farmerId === user?.id);
  const myTransport = transport.filter((item) => item.farmerId === user?.id);
  const myDeals = deals.filter((deal) => deal.farmerId === user?.id);
  const myProposals = proposals.filter((proposal) => proposal.farmerId === user?.id && (proposal.status === 'pendingreview' || proposal.status === 'awaitingfarmerprice'));
  const completedProposals = proposals.filter((proposal) => proposal.farmerId === user?.id && proposal.status === 'completed');
  const pendingAlternatives = alternatives.filter((item) => item.farmerId === user?.id && item.status === 'pendingfarmerdecision');

  const completedTransportCount = myTransport.filter((item) => item.status === 'completed').length;
  const activeRequests = myTransport.filter((item) => item.status === 'pending' || item.status === 'accepted').length;
  const activeDeals = myDeals.filter((deal) => deal.status === 'pending' || deal.status === 'accepted').length;
  const soldOutProducts = myProducts.filter((product) => {
    const remaining = parseQuantityValue(product.availableQuantity ?? product.quantity ?? 0);
    return product.status === 'sold' || remaining <= 0;
  });
  const totalAvailable = myProducts.reduce((sum, product) => sum + Number(product.availableQuantity ?? product.quantity ?? 0), 0);
  const topProducts = myProducts.slice(0, 3);

  const stats = [
    { icon: Package, label: 'My Produce', value: myProducts.length, color: 'green' },
    { icon: Truck, label: 'Transport Requests', value: activeRequests, color: 'gold' },
    { icon: ShoppingCart, label: 'Active Deals', value: activeDeals, color: 'blue' },
    { icon: TrendingUp, label: 'Completed Trips', value: completedTransportCount, color: 'forest' },
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
      <div className="p-6 space-y-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,_rgba(255,255,255,0.95),_rgba(235,245,238,0.88))] p-6 shadow-[0_24px_70px_rgba(27,67,50,0.08)] lg:p-8">
          <div className="absolute -right-16 -top-12 h-48 w-48 rounded-full bg-green/10 blur-3xl" />
          <div className="relative grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-green/15 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-green">
                <Sprout className="h-4 w-4" />
                Farmer workspace
              </div>
              <div>
                <h2 className="text-3xl font-bold text-forest sm:text-4xl">Welcome back, {user?.name || 'Farmer'}.</h2>
                <p className="mt-3 max-w-2xl text-base leading-7 text-slate sm:text-lg">
                  Manage produce, respond to proposals, and keep your supply flowing with a cleaner operational overview.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to="/farmer/produce" className="inline-flex items-center gap-2 rounded-full bg-green px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(39,174,96,0.2)] transition hover:-translate-y-0.5 hover:bg-green-dark">
                  View produce
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/farmer/transport" className="inline-flex items-center gap-2 rounded-full border border-forest/15 bg-white px-5 py-3 text-sm font-semibold text-forest shadow-sm transition hover:-translate-y-0.5 hover:bg-forest hover:text-white">
                  Transport requests
                </Link>
                <Link to="/farmer/guide" className="inline-flex items-center gap-2 rounded-full border border-forest/15 bg-ivory px-5 py-3 text-sm font-semibold text-forest transition hover:-translate-y-0.5 hover:bg-white">
                  Storage guide
                </Link>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/70 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <p className="text-sm font-semibold text-forest">Today's summary</p>
                  <p className="text-sm text-slate">Quick operational snapshot</p>
                </div>
                <div className="rounded-full bg-green/10 px-3 py-1 text-xs font-semibold text-green">Live</div>
              </div>
              <div className="mt-4 grid gap-3">
                <div className="rounded-2xl bg-gradient-to-br from-forest to-green-dark p-4 text-white">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/70">Active flow</p>
                  <p className="mt-2 text-3xl font-bold">{activeRequests + activeDeals}</p>
                  <p className="text-sm text-white/75">current tasks & negotiations</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => <StatCard key={index} {...stat} />)}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-green">Recent activity</p>
                <h3 className="mt-2 text-xl font-bold text-forest">Recently listed produce</h3>
              </div>
              <Link to="/farmer/produce" className="text-sm font-semibold text-green hover:underline">View all</Link>
            </div>
            <div className="mt-5 space-y-3">
              {topProducts.map((product) => (
                <div key={product.id} className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-ivory p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <span className="block font-semibold text-forest">{product.name}</span>
                    <span className="mt-1 flex items-center gap-1 text-xs text-slate"><CalendarDays className="h-3.5 w-3.5" /> {product.harvestDate || '-'}</span>
                  </div>
                  <div className="text-sm text-slate sm:text-right">
                    <p>{product.availableQuantity ?? product.quantity} {product.unit} available</p>
                    <p className="font-semibold text-forest">৳{product.price}/{product.unit}</p>
                  </div>
                </div>
              ))}
              {myProducts.length === 0 && <p className="text-gray-400">No produce listed yet</p>}
            </div>
          </div>

          <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-green">Focus areas</p>
            <h3 className="mt-2 text-xl font-bold text-forest">What to work on next</h3>
            <div className="mt-5 space-y-3">
              {[
                { label: 'List new produce', value: myProducts.length ? 'Keep stock fresh' : 'Add your first item', icon: ClipboardList },
                { label: 'Review transport', value: myTransport.length ? 'Track request status' : 'No requests yet', icon: Truck },
                { label: 'Check deals', value: myDeals.length ? 'Respond to offers' : 'No offers yet', icon: ShoppingCart },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 rounded-2xl bg-ivory p-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-green shadow-sm">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-forest">{item.label}</p>
                    <p className="text-sm text-slate">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-green">Transport proposals</p>
          <h3 className="mt-2 text-xl font-bold text-forest">Requests waiting for your decision</h3>
          <div className="mt-5 space-y-4">
            {myProposals.length > 0 ? myProposals.map((proposal) => {
              const canRespond = proposal.status === 'pendingreview' || proposal.status === 'awaitingfarmerprice';
              return (
                <div key={proposal.id} className="space-y-3 rounded-[1.75rem] border border-gray-100 bg-ivory p-4 sm:p-5">
                  <ProposalCard proposal={proposal} />
                  {canRespond && (
                    <div className="flex flex-col gap-3 rounded-2xl border border-forest/10 bg-ivory p-4 sm:flex-row sm:items-end">
                      <div className="flex-1">
                        <label className="mb-1 block text-sm font-medium">Your price</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={priceInputs[proposal.id] || ''}
                          onChange={(event) => setPriceInputs((current) => ({ ...current, [proposal.id]: event.target.value }))}
                          className="w-full rounded-xl border p-3"
                          placeholder="Enter price per kg"
                        />
                      </div>
                      <button onClick={() => handleSubmitPrice(proposal)} className="rounded-xl bg-forest px-5 py-3 text-white transition hover:bg-forest/90">
                        Submit price
                      </button>
                    </div>
                  )}
                </div>
              );
            }) : <p className="text-gray-400">No proposal requests yet</p>}
          </div>
        </div>

        <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-green">Alternative selling</p>
          <h3 className="mt-2 text-xl font-bold text-forest">Counter offers and return decisions</h3>
          <div className="mt-5 space-y-4">
            {pendingAlternatives.length > 0 ? pendingAlternatives.map((item) => (
              <div key={item.id} className="rounded-[1.75rem] border border-amber-200 bg-amber-50/40 p-5 space-y-4 shadow-sm">
                <div>
                  <p className="font-semibold text-forest">{item.produceName} • {item.quantity} kg</p>
                  <p className="text-sm text-gray-600">Dealer: {item.dealerName || 'N/A'} {item.dealerPhone ? `• ${item.dealerPhone}` : ''}</p>
                  <p className="text-sm text-gray-600">Set new price to continue selling or request return.</p>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={alternativeInputs[item.id]?.newPricePerKg || ''}
                    onChange={(event) => setAlternativeInputs((current) => ({
                      ...current,
                      [item.id]: { ...(current[item.id] || {}), newPricePerKg: event.target.value },
                    }))}
                    className="w-full rounded-xl border p-3"
                    placeholder="New price per kg (required)"
                  />
                  <input
                    type="text"
                    value={alternativeInputs[item.id]?.notes || ''}
                    onChange={(event) => setAlternativeInputs((current) => ({
                      ...current,
                      [item.id]: { ...(current[item.id] || {}), notes: event.target.value },
                    }))}
                    className="w-full rounded-xl border p-3"
                    placeholder="Decision note (optional)"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleAlternativeDecision(item, 'accept_new_price')}
                    className="rounded-xl bg-forest px-4 py-2 text-white transition hover:bg-forest/90"
                  >
                    Continue With New Price
                  </button>
                  <button
                    onClick={() => handleAlternativeDecision(item, 'return_product')}
                    className="rounded-xl bg-red-500 px-4 py-2 text-white transition hover:bg-red-600"
                  >
                    Return Product
                  </button>
                </div>
              </div>
            )) : <p className="text-gray-400">No alternative requests pending</p>}
          </div>
        </div>

        <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-green">Completed proposals</p>
          <h3 className="mt-2 text-xl font-bold text-forest">Closed negotiation history</h3>
          <div className="mt-5 space-y-4">
            {completedProposals.length > 0 ? completedProposals.map((proposal) => (
              <ProposalCard key={proposal.id} proposal={proposal} />
            )) : <p className="text-gray-400">No completed proposals yet</p>}
          </div>
        </div>

        <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-green">Sold out produce</p>
          <h3 className="mt-2 text-xl font-bold text-forest">Items ready for re-listing later</h3>
          <div className="mt-5 space-y-3">
            {soldOutProducts.length > 0 ? soldOutProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between rounded-2xl bg-ivory p-4">
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
