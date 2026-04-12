import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { Home, Package, Truck, ShoppingCart, Users, AlertTriangle, Box, Route, FileText, LogOut, Menu, X } from 'lucide-react';
import { cn } from '../../utils/helpers';

const roleNavs = {
  farmer: [
    { path: '/farmer', label: 'Dashboard', icon: Home },
    { path: '/farmer/produce', label: 'My Produce', icon: Package },
    { path: '/farmer/transport', label: 'Transport Requests', icon: Truck },
    { path: '/farmer/deals', label: 'My Deals', icon: ShoppingCart },
    { path: '/farmer/guide', label: 'Storage Guide', icon: Box },
  ],
  transport: [
    { path: '/transport', label: 'Dashboard', icon: Home },
    { path: '/transport/browse', label: 'Browse Requests', icon: Route },
    { path: '/transport/jobs', label: 'My Jobs', icon: Truck },
    { path: '/transport/failure', label: 'Report Failure', icon: AlertTriangle },
  ],
  dealer: [
    { path: '/dealer', label: 'Dashboard', icon: Home },
    { path: '/dealer/browse', label: 'Browse Produce', icon: Package },
    { path: '/dealer/deals', label: 'My Deals', icon: ShoppingCart },
  ],
  admin: [
    { path: '/admin', label: 'Overview', icon: Home },
    { path: '/admin/users', label: 'All Users', icon: Users },
    { path: '/admin/produce', label: 'All Produce', icon: Package },
    { path: '/admin/transport', label: 'Transport', icon: Truck },
    { path: '/admin/deals', label: 'Deals', icon: ShoppingCart },
    { path: '/admin/failures', label: 'Failures', icon: AlertTriangle },
  ],
};

const roleColors = {
  farmer: 'bg-green',
  transport: 'bg-gold',
  dealer: 'bg-slate',
  admin: 'bg-forest',
};

export function Sidebar() {
  const { user, logout, isDemo } = useAuth();
  const { logout: appLogout } = useAppData();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = user ? roleNavs[user.role] || [] : [];
  const accentColor = roleColors[user?.role] || 'bg-gray-500';

  const isNavItemActive = (itemPath) => {
    const currentPath = location.pathname;
    if (currentPath === itemPath) return true;

    const roleRoot = user?.role ? `/${user.role}` : '';
    const isRoleDashboard = itemPath === roleRoot;
    if (isRoleDashboard) return false;

    return currentPath.startsWith(`${itemPath}/`);
  };

  const handleLogout = () => {
    logout();
    appLogout();
    navigate('/login');
  };

  return (
    <>
      <button className="md:hidden fixed top-4 left-4 z-50 p-2.5 bg-white/90 backdrop-blur rounded-xl shadow-lg border border-white" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <aside className={cn('fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-white to-foam/70 border-r border-forest/10 z-40 flex flex-col shadow-[0_12px_42px_rgba(13,40,24,0.08)] transition-transform duration-200', isOpen ? 'translate-x-0' : '-translate-x-full', 'md:translate-x-0')}>
        <div className="p-5 border-b border-forest/10">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🌿</span>
            <div>
              <h1 className="font-serif font-bold text-forest text-lg leading-none">FreshNest</h1>
              <p className="text-xs text-slate mt-1">Post-Harvest System</p>
            </div>
          </Link>
        </div>

        {user && (
          <div className="p-4 border-b border-forest/10 bg-white/60">
            <div className="flex items-center gap-3">
              <div className={cn('w-10 h-10 rounded-full flex items-center justify-center text-white font-bold', accentColor)}>
                {user.name?.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-forest">{user.name}</p>
                <p className="text-xs text-slate capitalize">{user.role}</p>
              </div>
            </div>
            {isDemo && <span className="mt-2 inline-block px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">Demo Mode</span>}
          </div>
        )}

        <nav className="flex-1 p-3 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = isNavItemActive(item.path);
              return (
                <li key={item.path}>
                  <Link to={item.path} onClick={() => setIsOpen(false)} className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200', isActive ? 'bg-forest text-white shadow-[0_8px_24px_rgba(13,40,24,0.25)]' : 'text-slate hover:bg-white hover:shadow-sm')}>
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-3 border-t border-forest/10">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 w-full text-red-600 hover:bg-red-50 rounded-xl transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {isOpen && <div className="md:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setIsOpen(false)} />}
    </>
  );
}

export default Sidebar;