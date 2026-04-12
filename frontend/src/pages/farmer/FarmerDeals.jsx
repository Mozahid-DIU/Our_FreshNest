import { Check, X, ShoppingCart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { Topbar } from '../../components/layout/Topbar';
import { EmptyState } from '../../components/ui/EmptyState';
import { Badge } from '../../components/ui/Badge';
import toast from 'react-hot-toast';

export default function FarmerDeals() {
  const { user } = useAuth();
  const { deals, products, updateDeal } = useAppData();

  const myDeals = deals.filter(d => d.farmerId === user?.id);

  const handleRespond = async (id, status) => {
    try {
      await updateDeal(id, { status });
      toast.success(`Deal ${status}`);
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to update deal');
    }
  };

  return (
    <div>
      <Topbar title="My Deals" />
      <div className="p-6">
        {myDeals.length === 0 ? (
          <EmptyState icon={ShoppingCart} message="No deal offers yet" />
        ) : (
          <div className="space-y-4">
            {myDeals.map((d) => {
              const produce = products.find(p => p.id === d.produceId);
              return (
                <div key={d.id} className="bg-white rounded-xl p-4 border border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-lg">{d.produceName}</h4>
                      <p className="text-gray-500 text-sm">Dealer: {d.dealerName || 'Unknown'}</p>
                      <p className="text-gray-500 text-sm">📍 {d.dealerLocation || 'Unknown location'}</p>
                      <p className="text-gray-500 text-sm">📞 {d.dealerPhone || 'Not provided'}</p>
                      <p className="mt-2">{d.quantity} {produce?.unit} @ ৳{d.price}/{produce?.unit}</p>
                      {d.message && <p className="text-gray-500 text-sm mt-1">Message: {d.message}</p>}
                    </div>
                    <Badge status={d.status} />
                  </div>
                  {d.status === 'pending' && (
                    <div className="mt-4 flex gap-2">
                      <button onClick={() => handleRespond(d.id, 'accepted')} className="flex items-center gap-1 px-4 py-2 bg-green text-white rounded-lg hover:bg-green-dark">
                        <Check className="w-4 h-4" /> Accept
                      </button>
                      <button onClick={() => handleRespond(d.id, 'declined')} className="flex items-center gap-1 px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50">
                        <X className="w-4 h-4" /> Decline
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}