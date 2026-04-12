import { cn } from '../../utils/helpers';

export function StatCard({ icon: Icon, label, value, color = 'green' }) {
  const colors = {
    green: 'from-green-50 to-white border-green-100',
    gold: 'from-amber-50 to-white border-amber-100',
    blue: 'from-blue-50 to-white border-blue-100',
    forest: 'from-forest/10 to-white border-forest/20',
  };

  const iconColors = {
    green: 'bg-green-100 text-green-700',
    gold: 'bg-amber-100 text-amber-700',
    blue: 'bg-blue-100 text-blue-700',
    forest: 'bg-forest/15 text-forest',
  };

  return (
    <div className={cn('bg-gradient-to-br rounded-2xl p-4 border shadow-sm hover:shadow-md transition-shadow', colors[color])}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', iconColors[color])}>
            <Icon className="w-6 h-6" />
          </div>
        )}
        <div>
          <p className="text-sm text-slate">{label}</p>
          <p className="text-2xl font-bold text-forest leading-tight">{value}</p>
        </div>
      </div>
    </div>
  );
}