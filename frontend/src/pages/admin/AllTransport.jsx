import { Truck } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { Topbar } from '../../components/layout/Topbar';
import { EmptyState } from '../../components/ui/EmptyState';
import { Badge } from '../../components/ui/Badge';

export default function AllTransport() {
  const { transport } = useAppData();

  return (
    <div>
      <Topbar title="All Transport" />
      <div className="p-6">
        {transport.length === 0 ? (
          <EmptyState icon={Truck} message="No transport records" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold text-gray-600">ID</th>
                  <th className="text-left p-3 font-semibold text-gray-600">Produce</th>
                  <th className="text-left p-3 font-semibold text-gray-600">Farmer</th>
                  <th className="text-left p-3 font-semibold text-gray-600">Transport</th>
                  <th className="text-left p-3 font-semibold text-gray-600">Route</th>
                  <th className="text-left p-3 font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {transport.map((t, idx) => (
                  <tr key={t.id} className={`border-b ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="p-3">{t.id}</td>
                    <td className="p-3">{t.produceName}</td>
                    <td className="p-3">{t.farmerName || '-'}</td>
                    <td className="p-3">{t.transportName || '-'}</td>
                    <td className="p-3">{t.fromLocation} → {t.toLocation}</td>
                    <td className="p-3"><Badge status={t.status} /></td>
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