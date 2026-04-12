import { ShoppingCart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { Topbar } from '../../components/layout/Topbar';
import { EmptyState } from '../../components/ui/EmptyState';
import { Badge } from '../../components/ui/Badge';

export default function MyDeals() {
  const { user } = useAuth();
  const { deals, products } = useAppData();

  const myDeals = deals.filter(d => d.dealerId === user?.id);

  return (
    <div>
      <Topbar title="My Deals" />
      <div className="p-6">
        {myDeals.length === 0 ? (
          <EmptyState icon={ShoppingCart} message="No deals yet" />
        ) : (
          <div className="space-y-4">
            {myDeals.map((d) => {
              const produce = products.find(p => p.id === d.produceId);
              return (
                <div key={d.id} className="bg-white rounded-xl p-5 border border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-lg">{d.produceName}</h4>
                      <p className="text-gray-500 text-sm">Farmer: {d.farmerName}</p>
                      <p className="mt-2">{d.quantity} {produce?.unit} @ ৳{d.price}/{produce?.unit}</p>
                      {d.message && <p className="text-gray-500 text-sm mt-1">Message: {d.message}</p>}
                    </div>
                    <Badge status={d.status} />
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