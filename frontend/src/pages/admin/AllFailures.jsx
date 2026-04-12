import { AlertTriangle } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { Topbar } from '../../components/layout/Topbar';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDate } from '../../utils/helpers';

export default function AllFailures() {
  const { failures } = useAppData();

  return (
    <div>
      <Topbar title="All Failures" />
      <div className="p-6">
        {failures.length === 0 ? (
          <EmptyState icon={AlertTriangle} message="No delivery failures reported" />
        ) : (
          <div className="space-y-4">
            {failures.map((f) => (
              <div key={f.id} className="bg-white rounded-xl p-5 border border-red-100">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{f.produceName}</h4>
                    <p className="text-gray-600 mt-1">{f.reason}</p>
                    <p className="text-sm text-gray-400 mt-2">Reported: {formatDate(f.reportedAt)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}