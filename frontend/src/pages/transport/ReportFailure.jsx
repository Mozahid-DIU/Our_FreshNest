import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { Modal } from '../../components/ui/Modal';
import { Topbar } from '../../components/layout/Topbar';
import { EmptyState } from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

export default function ReportFailure() {
  const { user } = useAuth();
  const { transport, addFailure, addAlternativeRequest } = useAppData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAlternativeModalOpen, setIsAlternativeModalOpen] = useState(false);
  const [form, setForm] = useState({ transportId: '', reason: '' });
  const [alternativeForm, setAlternativeForm] = useState({
    quantity: '',
    currentLocation: '',
    fruitType: '',
    pickupDate: '',
    preferredDealerLocation: '',
    notes: '',
  });
  const [latestFailureId, setLatestFailureId] = useState(null);

  const acceptedJobs = transport.filter(t => t.transportId === user?.id && t.status === 'accepted');

  const handleSubmit = async () => {
    if (!form.transportId || !form.reason) {
      toast.error('Please fill all fields');
      return;
    }
    const trans = transport.find(t => t.id === Number(form.transportId));
    if (!trans) {
      toast.error('Selected job is no longer available');
      return;
    }
    try {
      const failureRecord = await addFailure({
        transportRequestId: trans.id,
        produceId: trans.produceId,
        produceName: trans.produceName,
        reason: form.reason,
        route: `${trans.fromLocation} -> ${trans.toLocation}`,
      });

      if (!failureRecord?.id) {
        toast.error('Failure saved, but alternative request could not be initialized. Please retry.');
        setIsModalOpen(false);
        setForm({ transportId: '', reason: '' });
        return;
      }

      toast.success('Failure reported');
      setIsModalOpen(false);
      setLatestFailureId(failureRecord.id);
      setAlternativeForm({
        quantity: trans.quantity || '',
        currentLocation: trans.fromLocation || '',
        fruitType: trans.produceName || '',
        pickupDate: trans.pickupDate || '',
        preferredDealerLocation: trans.toLocation || '',
        notes: '',
      });
      setIsAlternativeModalOpen(true);
      setForm({ transportId: '', reason: '' });
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to report failure');
    }
  };

  const handleCreateAlternative = async () => {
    if (!latestFailureId) {
      toast.error('Failure record missing. Please report failure again.');
      return;
    }
    const currentLocation = String(alternativeForm.currentLocation || '').trim();
    const fruitType = String(alternativeForm.fruitType || '').trim();
    const preferredDealerLocation = String(alternativeForm.preferredDealerLocation || '').trim();

    if (!alternativeForm.quantity || !currentLocation || !fruitType || !alternativeForm.pickupDate || !preferredDealerLocation) {
      toast.error('Please fill all required alternative fields');
      return;
    }

    try {
      await addAlternativeRequest(latestFailureId, {
        ...alternativeForm,
        currentLocation,
        fruitType,
        preferredDealerLocation,
      });
      toast.success('Alternative request sent to farmer');
      setIsAlternativeModalOpen(false);
      setLatestFailureId(null);
      setAlternativeForm({
        quantity: '',
        currentLocation: '',
        fruitType: '',
        pickupDate: '',
        preferredDealerLocation: '',
        notes: '',
      });
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to create alternative request');
    }
  };

  return (
    <div>
      <Topbar title="Report Failure" />
      <div className="p-6">
        {acceptedJobs.length === 0 ? (
          <EmptyState icon={AlertTriangle} message="No accepted jobs to report failure for" />
        ) : (
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <p className="text-gray-600 mb-4">You have {acceptedJobs.length} accepted job(s). Select one to report a failure.</p>
            <button onClick={() => setIsModalOpen(true)} className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600">
              Report Delivery Failure
            </button>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Report Delivery Failure">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Select Job</label>
            <select value={form.transportId} onChange={(e) => setForm({ ...form, transportId: e.target.value })} className="w-full p-3 border rounded-xl">
              <option value="">Select job...</option>
              {acceptedJobs.map(t => <option key={t.id} value={t.id}>{t.produceName} - {t.fromLocation} → {t.toLocation}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Reason for Failure</label>
            <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="w-full p-3 border rounded-xl" rows="3" placeholder="Describe the issue..."></textarea>
          </div>
          <button onClick={handleSubmit} className="w-full py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600">Submit Report</button>
        </div>
      </Modal>

      <Modal
        isOpen={isAlternativeModalOpen}
        onClose={() => {
          setIsAlternativeModalOpen(false);
          setLatestFailureId(null);
          setAlternativeForm({
            quantity: '',
            currentLocation: '',
            fruitType: '',
            pickupDate: '',
            preferredDealerLocation: '',
            notes: '',
          });
        }}
        title="Create Alternative Request"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Failure submitted. Create an alternative request so farmer can set a new price or return product.
          </p>
          <div>
            <label className="block text-sm font-medium mb-1">Quantity</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={alternativeForm.quantity}
              onChange={(e) => setAlternativeForm((current) => ({ ...current, quantity: e.target.value }))}
              className="w-full p-3 border rounded-xl"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Current Location</label>
            <input
              value={alternativeForm.currentLocation}
              onChange={(e) => setAlternativeForm((current) => ({ ...current, currentLocation: e.target.value }))}
              className="w-full p-3 border rounded-xl"
              placeholder="Current location"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fruits Type</label>
            <input
              value={alternativeForm.fruitType}
              onChange={(e) => setAlternativeForm((current) => ({ ...current, fruitType: e.target.value }))}
              className="w-full p-3 border rounded-xl"
              placeholder="Fruits type"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              value={alternativeForm.pickupDate}
              onChange={(e) => setAlternativeForm((current) => ({ ...current, pickupDate: e.target.value }))}
              className="w-full p-3 border rounded-xl"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Preferred Dealer Location</label>
            <input
              value={alternativeForm.preferredDealerLocation}
              onChange={(e) => setAlternativeForm((current) => ({ ...current, preferredDealerLocation: e.target.value }))}
              className="w-full p-3 border rounded-xl"
              placeholder="Preferred dealer location"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={alternativeForm.notes}
              onChange={(e) => setAlternativeForm((current) => ({ ...current, notes: e.target.value }))}
              className="w-full p-3 border rounded-xl"
              rows="3"
              placeholder="Alternative route or selling notes"
            />
          </div>
          <button onClick={handleCreateAlternative} className="w-full py-3 bg-forest text-white font-semibold rounded-xl hover:bg-forest/90">
            Send Alternative Request
          </button>
        </div>
      </Modal>
    </div>
  );
}