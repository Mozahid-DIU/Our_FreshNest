import { useState } from 'react';
import { Users, Package, Truck, ShoppingCart, AlertTriangle } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { StatCard } from '../../components/ui/StatCard';
import { Topbar } from '../../components/layout/Topbar';
import { ProposalCard } from '../../components/ui/ProposalCard';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { users, products, transport, deals, failures, proposals, updateProposal } = useAppData();
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [farmerId, setFarmerId] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const recentProposals = proposals.slice(0, 5);

  const stats = [
    { icon: Users, label: 'Total Users', value: users.length, color: 'forest' },
    { icon: Package, label: 'Total Produce', value: products.length, color: 'green' },
    { icon: Truck, label: 'Transport Jobs', value: transport.length, color: 'gold' },
    { icon: ShoppingCart, label: 'Total Deals', value: deals.length, color: 'blue' },
    { icon: AlertTriangle, label: 'Failures', value: failures.length, color: 'forest' },
  ];

  const farmers = users.filter((user) => user.role === 'farmer');

  const handleRequestPrice = async () => {
    if (!selectedProposal || !farmerId) {
      toast.error('Select a farmer first');
      return;
    }

    await updateProposal(selectedProposal.id, {
      action: 'request_price',
      farmer_id: Number(farmerId),
      admin_notes: adminNotes,
    });
    toast.success('Price requested from farmer');
    setSelectedProposal(null);
    setFarmerId('');
    setAdminNotes('');
  };

  const handleApprove = async (proposal) => {
    await updateProposal(proposal.id, { action: 'approve' });
    toast.success('Proposal approved and published');
  };

  return (
    <div>
      <Topbar title="Admin Dashboard" />
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {stats.map((s, i) => <StatCard key={i} {...s} />)}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h3 className="text-lg font-semibold mb-4">Recent Produce</h3>
            <div className="space-y-3">
              {products.slice(0, 5).map(p => (
                <div key={p.id} className="flex justify-between p-3 bg-ivory rounded-lg">
                  <span className="font-medium">{p.name}</span>
                  <span className="text-sm text-gray-500">{p.quantity} {p.unit}</span>
                </div>
              ))}
              {products.length === 0 && <p className="text-gray-400">No produce</p>}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h3 className="text-lg font-semibold mb-4">Recent Deals</h3>
            <div className="space-y-3">
              {deals.slice(0, 5).map(d => (
                <div key={d.id} className="flex justify-between p-3 bg-ivory rounded-lg">
                  <span className="font-medium">{d.produceName}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${d.status === 'accepted' ? 'bg-green-100 text-green-800' : d.status === 'declined' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>{d.status}</span>
                </div>
              ))}
              {deals.length === 0 && <p className="text-gray-400">No deals</p>}
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Transport Proposals</h3>
          <div className="space-y-4">
            {recentProposals.length > 0 ? recentProposals.map((proposal) => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                actions={[
                  ...(proposal.status === 'pendingreview' || proposal.status === 'awaitingfarmerprice'
                    ? [{
                        label: 'Ask farmer for price',
                        variant: 'secondary',
                        onClick: () => {
                          setSelectedProposal(proposal);
                          setFarmerId(String(proposal.farmerId || ''));
                          setAdminNotes(proposal.adminNotes || '');
                        },
                      }]
                    : []),
                  ...(proposal.status === 'awaitingadminapproval'
                    ? [{
                        label: 'Approve & publish',
                        variant: 'primary',
                        onClick: () => handleApprove(proposal),
                        disabled: !proposal.farmerPrice,
                      }]
                    : []),
                ]}
              />
            )) : <EmptyState message="No transport proposals yet" />}
          </div>
        </div>

        <Modal isOpen={!!selectedProposal} onClose={() => setSelectedProposal(null)} title="Request farmer price">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Farmer</label>
              <select value={farmerId} onChange={(e) => setFarmerId(e.target.value)} className="w-full p-3 border rounded-xl">
                <option value="">Select farmer...</option>
                {farmers.map((farmer) => (
                  <option key={farmer.id} value={farmer.id}>{farmer.name} - {farmer.location || 'No location'}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Admin notes</label>
              <textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} className="w-full p-3 border rounded-xl" rows="3" placeholder="Add context for the farmer" />
            </div>
            <button onClick={handleRequestPrice} className="w-full py-3 bg-forest text-white rounded-xl hover:bg-forest/90">Send price request</button>
          </div>
        </Modal>
      </div>
    </div>
  );
}