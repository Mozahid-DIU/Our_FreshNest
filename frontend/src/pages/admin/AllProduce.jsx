import { useMemo } from 'react';
import { Package } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { Topbar } from '../../components/layout/Topbar';
import { EmptyState } from '../../components/ui/EmptyState';
import { Badge } from '../../components/ui/Badge';
import { DataTable } from '../../components/ui/DataTable';
import { getProduceEmoji } from '../../utils/produceDB';

export default function AllProduce() {
  const { products } = useAppData();

  const columns = useMemo(
    () => [
      { key: 'id', label: 'ID', sortable: true },
      {
        key: 'name',
        label: 'Produce',
        sortable: true,
        searchValue: (row) => `${row.name} ${row.category || ''}`,
        render: (value) => (
          <span>
            <span className="mr-2">{getProduceEmoji(value)}</span>
            {value}
          </span>
        ),
      },
      {
        key: 'farmerName',
        label: 'Farmer',
        sortable: true,
        render: (value) => value || '-',
      },
      {
        key: 'quantity',
        label: 'Quantity',
        sortable: true,
        sortValue: (row) => Number(row.quantity || 0),
        render: (value, row) => `${value} ${row.unit}`,
      },
      {
        key: 'price',
        label: 'Price',
        sortable: true,
        sortValue: (row) => Number(row.price || 0),
        render: (value) => `৳${value}`,
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
      <Topbar title="All Produce" />
      <div className="p-6">
        {products.length === 0 ? (
          <EmptyState icon={Package} message="No produce found" />
        ) : (
          <DataTable
            columns={columns}
            data={products}
            searchPlaceholder="Search produce, farmer, status"
            emptyMessage="No produce items match your search"
            caption="All produce records"
          />
        )}
      </div>
    </div>
  );
}