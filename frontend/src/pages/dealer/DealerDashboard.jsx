import { Package, ShoppingCart, TrendingUp } from 'lucide-react';
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
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {stats.map((s, i) => <StatCard key={i} {...s} />)}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold mb-2">Browse Produce</h3>
          <p className="text-sm text-gray-500">Use the Browse Produce page to view product cards and make offers.</p>
        </div>

        <div className="mt-6 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Received Deliveries</h3>
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

        <div className="mt-6 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Out of Stock</h3>
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

        <div className="mt-6 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Approved Transport Proposals</h3>
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

        <div className="mt-6 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Alternative Selling Updates</h3>
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