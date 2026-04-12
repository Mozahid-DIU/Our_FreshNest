import { cn } from '../../utils/helpers';

export function DataTable({ columns, data, onRowClick }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            {columns.map((col) => (
              <th key={col.key} className="text-left p-3 text-sm font-semibold text-gray-600">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={row.id || idx} className={cn('border-b hover:bg-gray-50', idx % 2 === 0 && 'bg-white')} onClick={() => onRowClick?.(row)}>
              {columns.map((col) => (
                <td key={col.key} className="p-3 text-sm">{col.render ? col.render(row[col.key], row) : row[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}