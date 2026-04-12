import { getBadgeColor, cn } from '../../utils/helpers';

export function Badge({ status, label, className }) {
  const displayLabel = label || (status ? status.charAt(0).toUpperCase() + status.slice(1) : '');
  return (
    <span className={cn('px-2 py-1 rounded-full text-xs font-medium', getBadgeColor(status), className)}>
      {displayLabel}
    </span>
  );
}