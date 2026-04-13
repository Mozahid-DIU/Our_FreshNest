import { useMemo } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { Topbar } from '../../components/layout/Topbar';
import { EmptyState } from '../../components/ui/EmptyState';
import { Badge } from '../../components/ui/Badge';
import { DataTable } from '../../components/ui/DataTable';

export default function AllDeals() {
  const { deals } = useAppData();

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
        key: 'dealerName',
        label: 'Dealer',
        sortable: true,
        render: (value) => value || '-',
      },
      {
        key: 'quantity',
        label: 'Quantity',
        sortable: true,
        sortValue: (row) => Number(row.quantity || 0),
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
      <Topbar title="All Deals" />
      <div className="p-6">
        {deals.length === 0 ? (
          <EmptyState icon={ShoppingCart} message="No deals found" />
        ) : (
          <DataTable
            columns={columns}
            data={deals}
            searchPlaceholder="Search by produce, farmer, dealer, status"
            emptyMessage="No deals match your search"
            caption="All deal records"
          />
        )}
      </div>
    </div>
  );
}