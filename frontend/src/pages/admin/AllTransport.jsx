import { useMemo } from 'react';
import { Truck } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { Topbar } from '../../components/layout/Topbar';
import { EmptyState } from '../../components/ui/EmptyState';
import { Badge } from '../../components/ui/Badge';
import { DataTable } from '../../components/ui/DataTable';

export default function AllTransport() {
  const { transport } = useAppData();

  const columns = useMemo(
    () => [
      { key: 'id', label: 'ID', sortable: true },
      { key: 'produceName', label: 'Produce', sortable: true },
      {
        key: 'farmerName',
        label: 'Farmer',
        sortable: true,
        render: (value) => value || '-',
      },
      {
        key: 'transportName',
        label: 'Transport',
        sortable: true,
        render: (value) => value || '-',
      },
      {
        key: 'route',
        label: 'Route',
        sortable: false,
        searchValue: (row) => `${row.fromLocation || ''} ${row.toLocation || ''}`,
        render: (_, row) => `${row.fromLocation || '-'} -> ${row.toLocation || '-'}`,
      },
      {
        key: 'status',
        label: 'Status',
        sortable: true,
        render: (value) => <Badge status={value} />,
      },
    ],
    [],
  );

  return (
    <div>
      <Topbar title="All Transport" />
      <div className="p-6">
        {transport.length === 0 ? (
          <EmptyState icon={Truck} message="No transport records" />
        ) : (
          <DataTable
            columns={columns}
            data={transport}
            searchPlaceholder="Search produce, people, route, status"
            emptyMessage="No transport records match your search"
            caption="All transport records"
          />
        )}
      </div>
    </div>
  );
}