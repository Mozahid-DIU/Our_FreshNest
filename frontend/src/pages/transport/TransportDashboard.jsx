import { Link } from 'react-router-dom';
import { Truck, Route, AlertCircle, CheckCircle, ArrowRight, Package } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { StatCard } from '../../components/ui/StatCard';
import { Topbar } from '../../components/layout/Topbar';
import { ProposalCard } from '../../components/ui/ProposalCard';
import toast from 'react-hot-toast';

export default function TransportDashboard() {
  const { user } = useAuth();
  const { transport, failures, proposals, updateProposal } = useAppData();

  const myJobs = transport.filter(t => t.transportId === user?.id);
  const pendingJobs = myJobs.filter(t => t.status === 'accepted');
  const completedJobs = myJobs.filter(t => t.status === 'completed');
  const myProposals = proposals.filter(p => p.transportProviderId === user?.id);

  const stats = [
    { icon: Route, label: 'Total Jobs', value: myJobs.length, color: 'green' },
    { icon: Truck, label: 'Active Jobs', value: pendingJobs.length, color: 'gold' },
    { icon: CheckCircle, label: 'Completed', value: completedJobs.length, color: 'blue' },
    { icon: AlertCircle, label: 'Failures', value: failures.filter(f => f.transportId === user?.id).length, color: 'forest' },
  ];

  const handleCompleteProposal = async (proposalId) => {
    try {
      await updateProposal(proposalId, { action: 'complete' });
      toast.success('Proposal marked completed');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to complete proposal');
    }
  };

  return (
    <div>
      <Topbar title="Transport Dashboard" />
      <div className="p-6 space-y-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,_rgba(255,255,255,0.96),_rgba(235,245,238,0.88))] p-6 shadow-[0_24px_70px_rgba(27,67,50,0.08)] lg:p-8">
          <div className="absolute -right-16 -top-12 h-48 w-48 rounded-full bg-green/10 blur-3xl" />
          <div className="relative grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-green/15 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-green">
                <Truck className="h-4 w-4" />
                Fleet control
              </div>
              <div>
                <h2 className="text-3xl font-bold text-forest sm:text-4xl">Welcome back, {user?.name || 'Transporter'}.</h2>
                <p className="mt-3 max-w-2xl text-base leading-7 text-slate sm:text-lg">
                  Keep your cargo route, accepted jobs, and completion status in one operational dashboard built for carrying vehicles.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to="/transport/browse" className="inline-flex items-center gap-2 rounded-full bg-green px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(39,174,96,0.2)] transition hover:-translate-y-0.5 hover:bg-green-dark">
                  Browse requests
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/transport/jobs" className="inline-flex items-center gap-2 rounded-full border border-forest/15 bg-white px-5 py-3 text-sm font-semibold text-forest shadow-sm transition hover:-translate-y-0.5 hover:bg-forest hover:text-white">
                  My jobs
                </Link>
                <Link to="/transport/failure" className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50/60 px-5 py-3 text-sm font-semibold text-red-700 transition hover:-translate-y-0.5 hover:bg-red-100">
                  Report failure
                </Link>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/70 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <p className="text-sm font-semibold text-forest">Vehicle lane status</p>
                  <p className="text-sm text-slate">Active routing snapshot</p>
                </div>
                <div className="rounded-full bg-green/10 px-3 py-1 text-xs font-semibold text-green">Live</div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-ivory p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate">Active vehicles</p>
                  <p className="mt-2 text-3xl font-bold text-forest">{pendingJobs.length}</p>
                  <p className="text-sm text-slate">accepted trips in route</p>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-forest to-green-dark p-4 text-white">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/70">Delivered cargo</p>
                  <p className="mt-2 text-3xl font-bold">{completedJobs.length}</p>
                  <p className="text-sm text-white/75">completed handoffs</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => <StatCard key={i} {...s} />)}
        </div>

        <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 text-blue-700"><Package className="h-5 w-5" /></div>
              <h3 className="text-lg font-semibold">Recent Proposals</h3>
            </div>
            <div className="space-y-3">
              {myProposals.slice(0, 3).map((proposal) => (
                <ProposalCard
                  key={proposal.id}
                  proposal={proposal}
                  actions={proposal.status === 'converted' ? [{
                    label: 'Mark completed',
                    variant: 'primary',
                    onClick: () => handleCompleteProposal(proposal.id),
                  }] : []}
                />
              ))}
              {myProposals.length === 0 && <p className="text-gray-400">No proposals yet</p>}
            </div>
        </div>
      </div>
    </div>
  );
}