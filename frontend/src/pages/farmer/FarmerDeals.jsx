import { Check, X, ShoppingCart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { Topbar } from '../../components/layout/Topbar';
import { EmptyState } from '../../components/ui/EmptyState';
import { Badge } from '../../components/ui/Badge';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

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
      <div className="p-6 space-y-6">
        <section className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-green">Deal workspace</p>
              <h2 className="mt-2 text-2xl font-bold text-forest sm:text-3xl">Review offers with a cleaner negotiation view.</h2>
              <p className="mt-3 text-base leading-7 text-slate">
                See who is offering what, compare quantities and pricing, and respond without digging through dense tables.
              </p>
            </div>
            <Link to="/dealer/browse" className="inline-flex items-center gap-2 rounded-full border border-forest/15 bg-ivory px-5 py-3 text-sm font-semibold text-forest transition hover:-translate-y-0.5 hover:bg-white">
              Browse market
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              { label: 'Total offers', value: myDeals.length },
              { label: 'Pending offers', value: myDeals.filter((deal) => deal.status === 'pending').length },
              { label: 'Accepted offers', value: myDeals.filter((deal) => deal.status === 'accepted').length },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl bg-ivory p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate">{item.label}</p>
                <p className="mt-2 text-2xl font-bold text-forest">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        {myDeals.length === 0 ? (
          <EmptyState icon={ShoppingCart} message="No deal offers yet" />
        ) : (
          <div className="grid gap-5 xl:grid-cols-2">
            {myDeals.map((d) => {
              const produce = products.find(p => p.id === d.produceId);
              return (
                <article key={d.id} className="rounded-[1.75rem] border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-green">Deal offer</p>
                      <h4 className="mt-2 text-2xl font-bold text-forest">{d.produceName}</h4>
                      <p className="mt-2 text-sm text-slate">Dealer: {d.dealerName || 'Unknown'}</p>
                    </div>
                    <Badge status={d.status} />
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-ivory p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate">Location</p>
                      <p className="mt-1 text-sm font-semibold text-forest">{d.dealerLocation || 'Unknown location'}</p>
                    </div>
                    <div className="rounded-2xl bg-ivory p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate">Phone</p>
                      <p className="mt-1 text-sm font-semibold text-forest">{d.dealerPhone || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-gray-100 p-4">
                    <p className="text-sm text-slate">{d.quantity} {produce?.unit} @ ৳{d.price}/{produce?.unit}</p>
                    {d.message && <p className="mt-2 text-sm leading-6 text-slate">{d.message}</p>}
                  </div>

                  {d.status === 'pending' && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      <button onClick={() => handleRespond(d.id, 'accepted')} className="inline-flex items-center gap-2 rounded-full bg-green px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-dark">
                        <Check className="w-4 h-4" /> Accept
                      </button>
                      <button onClick={() => handleRespond(d.id, 'declined')} className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50">
                        <X className="w-4 h-4" /> Decline
                      </button>
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