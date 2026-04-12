import { ShoppingCart } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { Topbar } from '../../components/layout/Topbar';
import { EmptyState } from '../../components/ui/EmptyState';
import { Badge } from '../../components/ui/Badge';

export default function AllDeals() {
  const { deals } = useAppData();

  return (
    <div>
      <Topbar title="All Deals" />
      <div className="p-6">
        {deals.length === 0 ? (
          <EmptyState icon={ShoppingCart} message="No deals found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold text-gray-600">ID</th>
                  <th className="text-left p-3 font-semibold text-gray-600">Produce</th>
                  <th className="text-left p-3 font-semibold text-gray-600">Farmer</th>
                  <th className="text-left p-3 font-semibold text-gray-600">Dealer</th>
                  <th className="text-left p-3 font-semibold text-gray-600">Quantity</th>
                  <th className="text-left p-3 font-semibold text-gray-600">Price</th>
                  <th className="text-left p-3 font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {deals.map((d, idx) => (
                  <tr key={d.id} className={`border-b ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="p-3">{d.id}</td>
                    <td className="p-3">{d.produceName}</td>
                    <td className="p-3">{d.farmerName || '-'}</td>
                    <td className="p-3">{d.dealerName || '-'}</td>
                    <td className="p-3">{d.quantity}</td>
                    <td className="p-3">৳{d.price}</td>
                    <td className="p-3"><Badge status={d.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}