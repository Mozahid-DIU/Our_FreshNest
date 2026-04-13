import { Link } from 'react-router-dom';
import { Package, ShoppingCart, TrendingUp, ArrowRight, Truck, ClipboardCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { StatCard } from '../../components/ui/StatCard';
import { Topbar } from '../../components/layout/Topbar';
import { ProposalCard } from '../../components/ui/ProposalCard';
import { EmptyState } from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import { parseQuantityValue } from '../../utils/helpers';

export default function DealerDashboard() {
  const { user } = useAuth();
  const { products, deals, transport, alternatives, proposals, updateProposal, loadAllData } = useAppData();

  const availableProduce = products.filter((p) => p.status !== 'sold' && parseQuantityValue(p.availableQuantity ?? p.quantity) > 0);
  const myDeals = deals.filter(d => d.dealerId === user?.id);
  const activeDeals = myDeals.filter(d => d.status === 'accepted');
  const myAcceptedProductIds = new Set(activeDeals.map((deal) => Number(deal.produceId)).filter(Boolean));
  const receivedDeliveries = transport.filter((item) => item.status === 'completed' && Number(item.dealerId) === Number(user?.id));
  const outOfStockProduce = products.filter((product) => {
    if (!myAcceptedProductIds.has(Number(product.id))) return false;
    const remaining = parseQuantityValue(product.availableQuantity ?? product.quantity);
    return product.status === 'sold' || remaining <= 0;
  });
  const activeProposals = proposals.filter((proposal) => proposal.status === 'published');
  const acceptedAlternatives = alternatives.filter(
    (item) => item.dealerId === user?.id && item.status === 'acceptednewprice'
  );

  const stats = [
    { icon: Package, label: 'Available Produce', value: availableProduce.length, color: 'green' },
    { icon: ShoppingCart, label: 'My Deals', value: myDeals.length, color: 'gold' },
    { icon: TrendingUp, label: 'Received', value: receivedDeliveries.length, color: 'blue' },
  ];

  const handleAccept = async (proposal) => {
    try {
      await updateProposal(proposal.id, { action: 'accept' });
      toast.success('Proposal accepted and route updated');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to accept proposal');
    }
  };

  return (
    <div>
      <Topbar title="Dealer Dashboard" />
      <div className="p-6 space-y-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,_rgba(255,255,255,0.96),_rgba(236,244,239,0.88))] p-6 shadow-[0_24px_70px_rgba(27,67,50,0.08)] lg:p-8">
          <div className="absolute -right-16 -top-12 h-48 w-48 rounded-full bg-green/10 blur-3xl" />
          <div className="relative grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-green/15 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-green">
                <ShoppingCart className="h-4 w-4" />
                Dealer workspace
              </div>
              <div>
                <h2 className="text-3xl font-bold text-forest sm:text-4xl">Welcome back, {user?.name || 'Dealer'}.</h2>
                <p className="mt-3 max-w-2xl text-base leading-7 text-slate sm:text-lg">
                  Monitor incoming supply, manage accepted deals, and follow delivery and proposal updates from one clear view.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to="/dealer/browse" className="inline-flex items-center gap-2 rounded-full bg-green px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(39,174,96,0.2)] transition hover:-translate-y-0.5 hover:bg-green-dark">
                  Browse produce
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/dealer/deals" className="inline-flex items-center gap-2 rounded-full border border-forest/15 bg-white px-5 py-3 text-sm font-semibold text-forest shadow-sm transition hover:-translate-y-0.5 hover:bg-forest hover:text-white">
                  My deals
                </Link>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/70 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <p className="text-sm font-semibold text-forest">Supply pulse</p>
                  <p className="text-sm text-slate">Current availability snapshot</p>
                </div>
                <div className="rounded-full bg-green/10 px-3 py-1 text-xs font-semibold text-green">Live</div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-ivory p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate">Available produce</p>
                  <p className="mt-2 text-3xl font-bold text-forest">{availableProduce.length}</p>
                  <p className="text-sm text-slate">items open for offers</p>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-forest to-green-dark p-4 text-white">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/70">Accepted deals</p>
                  <p className="mt-2 text-3xl font-bold">{activeDeals.length}</p>
                  <p className="text-sm text-white/75">orders in active flow</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {stats.map((s, i) => <StatCard key={i} {...s} />)}
        </div>

        <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-green">Quick action</p>
              <h3 className="mt-2 text-xl font-bold text-forest">Discover produce and make offers</h3>
              <p className="mt-1 text-sm text-gray-500">Open the browse page to see current listings and submit price offers.</p>
            </div>
            <Link to="/dealer/browse" className="inline-flex items-center gap-2 rounded-full border border-forest/15 bg-ivory px-4 py-2.5 text-sm font-semibold text-forest transition hover:-translate-y-0.5 hover:bg-white">
              Open browse
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green/10 text-green"><Truck className="h-5 w-5" /></div>
            <h3 className="text-lg font-semibold">Received Deliveries</h3>
          </div>
          <div className="space-y-3">
            {receivedDeliveries.length > 0 ? receivedDeliveries.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-ivory p-4">
                <div>
                  <p className="font-medium">{item.produceName}</p>
                  <p className="text-sm text-gray-500">From {item.farmerName || 'Farmer'} • {item.quantity || 'N/A'}</p>
                </div>
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">Received</span>
              </div>
            )) : <EmptyState message="No received deliveries yet" />}
          </div>
        </div>

        <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-100 text-red-700"><Package className="h-5 w-5" /></div>
            <h3 className="text-lg font-semibold">Out of Stock</h3>
          </div>
          <div className="space-y-3">
            {outOfStockProduce.length > 0 ? outOfStockProduce.map((product) => (
              <div key={product.id} className="flex items-center justify-between rounded-xl border border-red-100 bg-red-50/60 p-4">
                <div>
                  <p className="font-medium text-red-900">{product.name}</p>
                  <p className="text-sm text-red-700">Available: 0 {product.unit}</p>
                </div>
                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">Out of Stock</span>
              </div>
            )) : <EmptyState message="No out of stock produce yet" />}
          </div>
        </div>

        <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 text-blue-700"><ClipboardCheck className="h-5 w-5" /></div>
            <h3 className="text-lg font-semibold">Approved Transport Proposals</h3>
          </div>
          <div className="space-y-4">
            {activeProposals.length > 0 ? activeProposals.map((proposal) => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                showCountdown
                onExpired={loadAllData}
                actions={[
                  {
                    label: 'Accept proposal',
                    variant: 'primary',
                    onClick: () => handleAccept(proposal),
                  },
                ]}
              />
            )) : <EmptyState message="No active proposals right now" />}
          </div>
        </div>

        <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold">Alternative Selling Updates</h3>
          <div className="space-y-3">
            {acceptedAlternatives.length > 0 ? acceptedAlternatives.slice(0, 6).map((item) => (
              <div key={item.id} className="rounded-xl border border-forest/10 bg-ivory p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{item.produceName} • {item.quantity} kg</p>
                  <p className="text-sm text-gray-500">
                    Farmer set new price • ৳{item.finalPricePerKg || 'N/A'}/kg
                  </p>
                </div>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">Accepted</span>
              </div>
            )) : <EmptyState message="No alternative selling updates yet" />}
          </div>
        </div>
      </div>
    </div>
  );
}