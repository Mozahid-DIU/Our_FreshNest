import { Truck, Route, AlertCircle, CheckCircle } from 'lucide-react';
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
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => <StatCard key={i} {...s} />)}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Recent Proposals</h3>
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