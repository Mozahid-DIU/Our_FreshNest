import { Truck, Check, Package } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { Topbar } from '../../components/layout/Topbar';
import { EmptyState } from '../../components/ui/EmptyState';
import { Badge } from '../../components/ui/Badge';
import toast from 'react-hot-toast';

export default function MyJobs() {
  const { user } = useAuth();
  const { transport, products, updateTransport } = useAppData();

  const myJobs = transport.filter(t => t.transportId === user?.id);

  const handleComplete = async (id) => {
    try {
      await updateTransport(id, { status: 'completed' });
      toast.success('Job marked as completed');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to mark complete');
    }
  };

  return (
    <div>
      <Topbar title="My Jobs" />
      <div className="p-6">
        {myJobs.length === 0 ? (
          <EmptyState icon={Truck} message="No jobs assigned yet" />
        ) : (
          <div className="space-y-4">
            {myJobs.map((t) => {
              const produce = products.find(p => p.id === t.produceId);
              return (
                <div key={t.id} className="bg-white rounded-xl p-5 border border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-lg">{t.produceName}</h4>
                      <p className="text-gray-500">Farmer: {t.farmerName}</p>
                      <p className="text-gray-500 text-sm">Dealer: {t.dealerName || 'Not provided'}</p>
                      <p className="text-gray-500 text-sm">Dealer Phone: {t.dealerPhone || 'Not provided'}</p>
                      <p className="text-gray-500 text-sm">📍 {t.farmerLocation || t.fromLocation || 'Unknown'}</p>
                      <p className="text-gray-500 text-sm">📞 {t.farmerPhone || 'Not provided'}</p>
                      <p className="mt-2 text-sm">📍 {t.fromLocation} → {t.toLocation}</p>
                      {produce && <p className="text-sm text-gray-500">📦 {produce.quantity} {produce.unit}</p>}
                    </div>
                    <div className="text-right">
                      <Badge status={t.status} />
                      {t.status === 'accepted' && (
                        <button onClick={() => handleComplete(t.id)} className="mt-3 flex items-center gap-1 px-4 py-2 bg-green text-white rounded-lg hover:bg-green-dark">
                          <Check className="w-4 h-4" /> Complete
                        </button>
                      )}
                    </div>
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