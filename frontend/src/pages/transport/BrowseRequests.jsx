import { Route, MapPin, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { Topbar } from '../../components/layout/Topbar';
import { EmptyState } from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

export default function BrowseRequests() {
  const { user } = useAuth();
  const { transport, products, updateTransport } = useAppData();

  const pendingRequests = transport.filter(t => t.status === 'pending' && !t.transportId);
  const longHaulCount = pendingRequests.filter((item) => String(item.fromLocation || '').toLowerCase() !== String(item.toLocation || '').toLowerCase()).length;

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
      <div className="p-6 space-y-6">
        <section className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-green">Open cargo board</p>
              <h2 className="mt-2 text-2xl font-bold text-forest sm:text-3xl">Find the next route for your carrying vehicle.</h2>
              <p className="mt-3 text-base leading-7 text-slate">
                Browse available transport requests, review route details, and accept jobs that match your lane and schedule.
              </p>
            </div>
            <div className="rounded-2xl bg-ivory px-5 py-4 text-sm text-slate">
              <p className="font-semibold text-forest">Pending requests: {pendingRequests.length}</p>
              <p className="mt-1">Cross-location routes: {longHaulCount}</p>
            </div>
          </div>
        </section>

        {pendingRequests.length === 0 ? (
          <EmptyState icon={Route} message="No pending transport requests" />
        ) : (
          <div className="grid gap-5 xl:grid-cols-2">
            {pendingRequests.map((t) => {
              const produce = products.find(p => p.id === t.produceId);
              return (
                <article key={t.id} className="rounded-[1.75rem] border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-green">Request</p>
                      <h4 className="mt-2 text-2xl font-bold text-forest">{t.produceName}</h4>
                      <p className="mt-2 text-sm text-gray-500">Farmer: {t.farmerName}</p>
                    </div>
                    <button onClick={() => handleAccept(t.id)} className="self-start rounded-full bg-gold px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600">
                      Accept Job
                    </button>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-ivory p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate">Dealer</p>
                      <p className="mt-1 text-sm font-semibold text-forest">{t.dealerName || 'Not provided'}</p>
                      <p className="mt-1 flex items-center gap-1 text-sm text-slate"><Phone className="h-3.5 w-3.5" /> {t.dealerPhone || 'Not provided'}</p>
                    </div>
                    <div className="rounded-2xl bg-ivory p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate">Pickup point</p>
                      <p className="mt-1 text-sm font-semibold text-forest">{t.farmerLocation || t.fromLocation || 'Unknown'}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-gray-100 p-4">
                      <p className="flex items-center gap-1 text-xs uppercase tracking-[0.18em] text-slate"><MapPin className="h-3.5 w-3.5 text-green" /> From</p>
                      <p className="mt-2 text-sm font-semibold text-forest">{t.fromLocation}</p>
                    </div>
                    <div className="rounded-2xl border border-gray-100 p-4">
                      <p className="flex items-center gap-1 text-xs uppercase tracking-[0.18em] text-slate"><MapPin className="h-3.5 w-3.5 text-green" /> To</p>
                      <p className="mt-2 text-sm font-semibold text-forest">{t.toLocation}</p>
                    </div>
                  </div>

                  {produce && (
                    <div className="mt-4 rounded-2xl bg-forest p-4 text-white">
                      <p className="text-xs uppercase tracking-[0.18em] text-white/70">Cargo</p>
                      <p className="mt-2 text-sm">{produce.quantity} {produce.unit}</p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}