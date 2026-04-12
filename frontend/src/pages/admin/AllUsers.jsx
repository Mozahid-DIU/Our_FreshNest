import { Users } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { Topbar } from '../../components/layout/Topbar';
import { EmptyState } from '../../components/ui/EmptyState';
import { Badge } from '../../components/ui/Badge';
import { getRoleColor } from '../../utils/helpers';

export default function AllUsers() {
  const { users } = useAppData();

  return (
    <div>
      <Topbar title="All Users" />
      <div className="p-6">
        {users.length === 0 ? (
          <EmptyState icon={Users} message="No users found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold text-gray-600">ID</th>
                  <th className="text-left p-3 font-semibold text-gray-600">Name</th>
                  <th className="text-left p-3 font-semibold text-gray-600">Email</th>
                  <th className="text-left p-3 font-semibold text-gray-600">Role</th>
                  <th className="text-left p-3 font-semibold text-gray-600">Location</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, idx) => (
                  <tr key={u.id} className={`border-b ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="p-3">{u.id}</td>
                    <td className="p-3 font-medium">{u.name}</td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(u.role)}`}>{u.role}</span></td>
                    <td className="p-3">{u.location || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}