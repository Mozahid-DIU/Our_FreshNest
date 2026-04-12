import { Package } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { Topbar } from '../../components/layout/Topbar';
import { EmptyState } from '../../components/ui/EmptyState';
import { Badge } from '../../components/ui/Badge';
import { getProduceEmoji } from '../../utils/produceDB';

export default function AllProduce() {
  const { products } = useAppData();

  return (
    <div>
      <Topbar title="All Produce" />
      <div className="p-6">
        {products.length === 0 ? (
          <EmptyState icon={Package} message="No produce found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold text-gray-600">ID</th>
                  <th className="text-left p-3 font-semibold text-gray-600">Produce</th>
                  <th className="text-left p-3 font-semibold text-gray-600">Farmer</th>
                  <th className="text-left p-3 font-semibold text-gray-600">Quantity</th>
                  <th className="text-left p-3 font-semibold text-gray-600">Price</th>
                  <th className="text-left p-3 font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, idx) => (
                  <tr key={p.id} className={`border-b ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="p-3">{p.id}</td>
                    <td className="p-3"><span className="mr-2">{getProduceEmoji(p.name)}</span>{p.name}</td>
                    <td className="p-3">{p.farmerName || '-'}</td>
                    <td className="p-3">{p.quantity} {p.unit}</td>
                    <td className="p-3">৳{p.price}</td>
                    <td className="p-3"><Badge status={p.status} /></td>
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