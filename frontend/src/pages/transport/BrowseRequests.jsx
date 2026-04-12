import { Route } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { Topbar } from '../../components/layout/Topbar';
import { EmptyState } from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

export default function BrowseRequests() {
  const { user } = useAuth();
  const { transport, products, updateTransport } = useAppData();

  const pendingRequests = transport.filter(t => t.status === 'pending' && !t.transportId);

  const handleAccept = async (id) => {
    try {
      await updateTransport(id, { transportId: user.id, transportName: user.name, status: 'accepted' });
      toast.success('Job accepted!');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to accept job');
    }
  };

  return (
    <div>
      <Topbar title="Browse Requests" />
      <div className="p-6">
        {pendingRequests.length === 0 ? (
          <EmptyState icon={Route} message="No pending transport requests" />
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((t) => {
              const produce = products.find(p => p.id === t.produceId);
              return (
                <div key={t.id} className="bg-white rounded-xl p-5 border border-gray-100">
                  <div className="flex justify-between">
                    <div>
                      <h4 className="font-semibold text-lg">{t.produceName}</h4>
                      <p className="text-gray-500">Farmer: {t.farmerName}</p>
                      <p className="text-gray-500 text-sm">Dealer: {t.dealerName || 'Not provided'}</p>
                      <p className="text-gray-500 text-sm">Dealer Phone: {t.dealerPhone || 'Not provided'}</p>
                      <p className="text-gray-500 text-sm">📍 {t.farmerLocation || t.fromLocation || 'Unknown'}</p>
                      <p className="mt-2 text-sm">
                        📍 {t.fromLocation} → {t.toLocation}
                      </p>
                      {produce && <p className="text-sm text-gray-500">📦 {produce.quantity} {produce.unit}</p>}
                    </div>
                    <button onClick={() => handleAccept(t.id)} className="px-4 py-2 bg-gold text-white rounded-lg hover:bg-amber-600 self-start">
                      Accept Job
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}