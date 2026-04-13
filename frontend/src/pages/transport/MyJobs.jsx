import { Link } from 'react-router-dom';
import { Truck, Check, ArrowRight, MapPin, Phone } from 'lucide-react';
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
  const acceptedCount = myJobs.filter((item) => item.status === 'accepted').length;
  const completedCount = myJobs.filter((item) => item.status === 'completed').length;

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
      <div className="p-6 space-y-6">
        <section className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-green">Job command center</p>
              <h2 className="mt-2 text-2xl font-bold text-forest sm:text-3xl">Track every carried shipment from pickup to delivery.</h2>
              <p className="mt-3 text-base leading-7 text-slate">
                Keep route details, farmer/dealer info, and completion updates organized for each active vehicle assignment.
              </p>
            </div>
            <Link to="/transport/browse" className="inline-flex items-center gap-2 rounded-full border border-forest/15 bg-ivory px-5 py-3 text-sm font-semibold text-forest transition hover:-translate-y-0.5 hover:bg-white">
              Find more jobs
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              { label: 'Assigned jobs', value: myJobs.length },
              { label: 'In transit', value: acceptedCount },
              { label: 'Completed', value: completedCount },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl bg-ivory p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate">{item.label}</p>
                <p className="mt-2 text-2xl font-bold text-forest">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        {myJobs.length === 0 ? (
          <EmptyState icon={Truck} message="No jobs assigned yet" />
        ) : (
          <div className="grid gap-5 xl:grid-cols-2">
            {myJobs.map((t) => {
              const produce = products.find(p => p.id === t.produceId);
              return (
                <article key={t.id} className="rounded-[1.75rem] border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-green">Assigned route</p>
                      <h4 className="mt-2 text-2xl font-bold text-forest">{t.produceName}</h4>
                      <p className="mt-2 text-sm text-gray-500">Farmer: {t.farmerName}</p>
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

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-ivory p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate">Dealer</p>
                      <p className="mt-1 text-sm font-semibold text-forest">{t.dealerName || 'Not provided'}</p>
                      <p className="mt-1 flex items-center gap-1 text-sm text-slate"><Phone className="h-3.5 w-3.5" /> {t.dealerPhone || 'Not provided'}</p>
                    </div>
                    <div className="rounded-2xl bg-ivory p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate">Farmer contact</p>
                      <p className="mt-1 text-sm font-semibold text-forest">{t.farmerName || 'Not provided'}</p>
                      <p className="mt-1 flex items-center gap-1 text-sm text-slate"><Phone className="h-3.5 w-3.5" /> {t.farmerPhone || 'Not provided'}</p>
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

                  {produce && <div className="mt-4 rounded-2xl bg-forest p-4 text-sm text-white">Cargo: {produce.quantity} {produce.unit}</div>}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}