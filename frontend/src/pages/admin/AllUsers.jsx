import { useMemo } from 'react';
import { Users } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { Topbar } from '../../components/layout/Topbar';
import { EmptyState } from '../../components/ui/EmptyState';
import { DataTable } from '../../components/ui/DataTable';
import { getRoleColor } from '../../utils/helpers';

export default function AllUsers() {
  const { users } = useAppData();

  const columns = useMemo(
    () => [
      { key: 'id', label: 'ID', sortable: true },
      { key: 'name', label: 'Name', sortable: true },
      { key: 'email', label: 'Email', sortable: true },
      {
        key: 'role',
        label: 'Role',
        sortable: true,
        render: (value) => (
          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium capitalize ${getRoleColor(value)}`}>
            {value}
          </span>
        ),
      },
      {
        key: 'location',
        label: 'Location',
        sortable: true,
        render: (value) => value || '-',
      },
    ],
    [],
  );

  return (
    <div>
      <Topbar title="All Users" />
      <div className="p-6">
        {users.length === 0 ? (
          <EmptyState icon={Users} message="No users found" />
        ) : (
          <DataTable
            columns={columns}
            data={users}
            searchPlaceholder="Search by name, email, role, or location"
            emptyMessage="No users match your search"
            caption="All system users"
          />
        )}
      </div>
    </div>
  );
}