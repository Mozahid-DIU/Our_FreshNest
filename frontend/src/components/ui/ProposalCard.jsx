import { useEffect } from 'react';
import { Clock3, MapPin, Sprout, CalendarDays, Route } from 'lucide-react';
import { Badge } from './Badge';
import { cn, formatDate } from '../../utils/helpers';
import { formatCountdown, useCountdown } from '../../hooks';

const statusLabels = {
  pendingreview: 'Pending review',
  awaitingfarmerprice: 'Awaiting farmer price',
  awaitingadminapproval: 'Awaiting admin approval',
  published: 'Active',
  expiringsoon: 'Expiring soon',
  expired: 'Expired',
  converted: 'Converted',
  completed: 'Completed',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
};

export function ProposalCard({ proposal, actions = [], className, showCountdown = false, highlightExpired = false, onExpired }) {
  const remainingMs = useCountdown(showCountdown ? proposal.expiresAt : null);
  const isExpiringSoon = showCountdown && proposal.status === 'published' && remainingMs > 0 && remainingMs <= 10 * 60 * 1000;

  useEffect(() => {
    if (showCountdown && proposal.status === 'published' && remainingMs === 0 && onExpired) {
      onExpired();
    }
  }, [remainingMs, onExpired, proposal.status, showCountdown]);

  return (
    <div className={cn('rounded-2xl border border-forest/10 bg-white p-5 shadow-sm', className)}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge status={isExpiringSoon ? 'expiringsoon' : proposal.status} label={isExpiringSoon ? statusLabels.expiringsoon : (statusLabels[proposal.status] || proposal.status)} />
            {highlightExpired && proposal.status === 'expired' && <Badge status="expired" label="Expired on dealer side" />}
          </div>
          <h4 className="text-lg font-semibold text-forest">{proposal.fruitType || proposal.fruit_type || 'Transport proposal'}</h4>
          <p className="text-sm text-slate">
            {proposal.transportProviderName || proposal.transport_provider_name || 'Transport provider'} · {proposal.transportProviderId || proposal.transport_provider_id ? `#${proposal.transportProviderId || proposal.transport_provider_id}` : 'Proposal'}
          </p>
        </div>
        {showCountdown && proposal.status === 'published' && (
          <div className={cn('rounded-xl border px-3 py-2 text-sm', isExpiringSoon ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-forest/10 bg-ivory text-forest')}>
            <div className="flex items-center gap-2">
              <Clock3 className="w-4 h-4" />
              <span className="font-medium">{remainingMs > 0 ? formatCountdown(remainingMs) : '00:00:00'}</span>
            </div>
            <p className="text-xs mt-1 uppercase tracking-wide">Dealer window</p>
          </div>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mt-5 text-sm">
        <div className="rounded-xl bg-ivory p-3">
          <p className="text-xs uppercase tracking-wide text-slate mb-1 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Current location</p>
          <p className="font-medium text-forest">{proposal.currentLocation || proposal.current_location || '-'}</p>
        </div>
        <div className="rounded-xl bg-ivory p-3">
          <p className="text-xs uppercase tracking-wide text-slate mb-1 flex items-center gap-1"><Sprout className="w-3.5 h-3.5" /> Fruit type</p>
          <p className="font-medium text-forest">{proposal.fruitType || proposal.fruit_type || '-'}</p>
        </div>
        <div className="rounded-xl bg-ivory p-3">
          <p className="text-xs uppercase tracking-wide text-slate mb-1 flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" /> Harvest date</p>
          <p className="font-medium text-forest">{formatDate(proposal.harvestDate || proposal.harvest_date)}</p>
        </div>
        <div className="rounded-xl bg-ivory p-3">
          <p className="text-xs uppercase tracking-wide text-slate mb-1 flex items-center gap-1"><Route className="w-3.5 h-3.5" /> Dealer location</p>
          <p className="font-medium text-forest">{proposal.preferredDealerLocation || proposal.preferred_dealer_location || '-'}</p>
        </div>
      </div>

      {(proposal.farmerPrice != null || proposal.farmer_price != null) && (
        <div className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">
          Farmer price: <span className="font-semibold">৳{proposal.farmerPrice ?? proposal.farmer_price}</span>
        </div>
      )}

      {proposal.notes && <p className="mt-4 text-sm text-slate leading-relaxed">{proposal.notes}</p>}

      {(proposal.transportProviderPhone || proposal.farmerPhone || proposal.convertedDealerPhone) && (
        <div className="mt-4 rounded-xl bg-ivory p-4 text-sm text-slate space-y-2">
          <p className="font-medium text-forest">Contact details</p>
          <p>
            Transporter: {proposal.transportProviderName || 'N/A'}
            {' · '}📍 {proposal.transportProviderLocation || proposal.currentLocation || 'Unknown'}
            {' · '}📞 {proposal.transportProviderPhone || 'Not provided'}
          </p>
          {!!proposal.farmerName && (
            <p>
              Farmer: {proposal.farmerName}
              {' · '}📍 {proposal.farmerLocation || 'Unknown'}
              {' · '}📞 {proposal.farmerPhone || 'Not provided'}
            </p>
          )}
          {!!proposal.convertedDealerName && (
            <p>
              Dealer: {proposal.convertedDealerName}
              {' · '}📍 {proposal.convertedDealerLocation || 'Unknown'}
              {' · '}📞 {proposal.convertedDealerPhone || 'Not provided'}
            </p>
          )}
        </div>
      )}

      {actions.length > 0 && (!showCountdown || remainingMs > 0) && (
        <div className="mt-5 flex flex-wrap gap-2">
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              disabled={action.disabled}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                action.variant === 'primary' ? 'bg-forest text-white hover:bg-forest/90' : action.variant === 'danger' ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-ivory text-forest hover:bg-forest/10'
              )}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}

      {showCountdown && proposal.status === 'published' && remainingMs === 0 && (
        <p className="mt-4 text-sm text-red-600 font-medium">Dealer window expired</p>
      )}
    </div>
  );
}