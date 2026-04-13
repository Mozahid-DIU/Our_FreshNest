import { Link } from 'react-router-dom';
import { ShoppingCart, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { Topbar } from '../../components/layout/Topbar';
import { EmptyState } from '../../components/ui/EmptyState';
import { Badge } from '../../components/ui/Badge';

export default function MyDeals() {
  const { user } = useAuth();
  const { deals, products } = useAppData();

  const myDeals = deals.filter(d => d.dealerId === user?.id);
  const acceptedCount = myDeals.filter((deal) => deal.status === 'accepted').length;
  const pendingCount = myDeals.filter((deal) => deal.status === 'pending').length;

  return (
    <div>
      <Topbar title="My Deals" />
      <div className="p-6 space-y-6">
        <section className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-green">Deal tracker</p>
              <h2 className="mt-2 text-2xl font-bold text-forest sm:text-3xl">Track all your negotiation outcomes in one place.</h2>
              <p className="mt-3 text-base leading-7 text-slate">
                Review offer status, quantity, price, and notes so you can quickly identify which deals are moving forward.
              </p>
            </div>
            <Link to="/dealer/browse" className="inline-flex items-center gap-2 rounded-full border border-forest/15 bg-ivory px-5 py-3 text-sm font-semibold text-forest transition hover:-translate-y-0.5 hover:bg-white">
              New offer
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              { label: 'Total deals', value: myDeals.length },
              { label: 'Accepted', value: acceptedCount },
              { label: 'Pending', value: pendingCount },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl bg-ivory p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate">{item.label}</p>
                <p className="mt-2 text-2xl font-bold text-forest">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        {myDeals.length === 0 ? (
          <EmptyState icon={ShoppingCart} message="No deals yet" />
        ) : (
          <div className="grid gap-5 xl:grid-cols-2">
            {myDeals.map((d) => {
              const produce = products.find(p => p.id === d.produceId);
              return (
                <article key={d.id} className="rounded-[1.75rem] border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-green">Offer details</p>
                      <h4 className="mt-2 text-2xl font-bold text-forest">{d.produceName}</h4>
                      <p className="mt-2 text-sm text-slate">Farmer: {d.farmerName}</p>
                    </div>
                    <Badge status={d.status} />
                  </div>

                  <div className="mt-5 rounded-2xl bg-ivory p-4 text-sm text-slate">
                    <p>{d.quantity} {produce?.unit} @ ৳{d.price}/{produce?.unit}</p>
                    {d.message && <p className="mt-2 leading-6">{d.message}</p>}
                  </div>

                  {d.status === 'accepted' && (
                    <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      <CheckCircle2 className="h-4 w-4" />
                      Deal accepted
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