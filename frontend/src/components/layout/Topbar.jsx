import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/helpers';

export function Topbar({ title }) {
  const { isDemo } = useAuth();
  const todayStr = formatDate(new Date().toISOString());

  return (
    <div className="bg-gradient-to-r from-white via-white to-foam/70 border-b border-forest/10 px-6 py-4 flex items-center justify-between">
      <h2 className="text-2xl font-serif font-semibold text-forest tracking-tight">{title}</h2>
      <div className="flex items-center gap-4">
        {isDemo && <span className="px-3 py-1 bg-amber-100 text-amber-800 text-sm rounded-full font-medium">Demo Mode</span>}
        <span className="text-slate font-medium">{todayStr}</span>
      </div>
    </div>
  );
}