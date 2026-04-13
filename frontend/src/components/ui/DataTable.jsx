import { useId, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import { cn } from '../../utils/helpers';

function normalizeValue(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') return value;
  if (value instanceof Date) return value.getTime();
  return String(value).toLowerCase();
}

export function DataTable({
  columns,
  data,
  onRowClick,
  keyField = 'id',
  searchPlaceholder = 'Search records...',
  searchLabel = 'Search table records',
  emptyMessage = 'No records found',
  pageSizeOptions = [10, 20, 50],
  defaultPageSize = 10,
  caption,
}) {
  const searchInputId = useId();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return data;

    return data.filter((row) =>
      columns.some((col) => {
        if (col.searchable === false) return false;
        const value = col.searchValue ? col.searchValue(row) : row[col.key];
        return String(value ?? '').toLowerCase().includes(query);
      }),
    );
  }, [columns, data, searchTerm]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    const sortColumn = columns.find((col) => col.key === sortConfig.key);
    if (!sortColumn) return filteredData;

    return [...filteredData].sort((a, b) => {
      const rawA = sortColumn.sortValue ? sortColumn.sortValue(a) : a[sortConfig.key];
      const rawB = sortColumn.sortValue ? sortColumn.sortValue(b) : b[sortConfig.key];
      const valueA = normalizeValue(rawA);
      const valueB = normalizeValue(rawB);

      if (valueA < valueB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [columns, filteredData, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pageData = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [pageSize, safePage, sortedData]);

  const handleSort = (column) => {
    if (column.sortable === false) return;

    setCurrentPage(1);
    setSortConfig((prev) => {
      if (prev.key !== column.key) {
        return { key: column.key, direction: 'asc' };
      }

      return { key: column.key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <label className="relative block w-full md:max-w-sm">
          <span className="sr-only" id={`${searchInputId}-label`}>
            {searchLabel}
          </span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
          <input
            id={searchInputId}
            type="search"
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setCurrentPage(1);
            }}
            placeholder={searchPlaceholder}
            aria-labelledby={`${searchInputId}-label`}
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm text-forest outline-none transition focus:border-green focus:ring-2 focus:ring-green/30"
          />
        </label>

        <div className="flex items-center gap-3 text-sm text-slate">
          <span>{filteredData.length} results</span>
          <label className="flex items-center gap-2">
            <span>Rows</span>
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setCurrentPage(1);
              }}
              className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm text-forest outline-none focus:border-green"
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full">
          {caption ? <caption className="sr-only">{caption}</caption> : null}
          <thead>
            <tr className="border-b bg-ivory/60">
              {columns.map((col) => {
                const isSorted = sortConfig.key === col.key;
                const canSort = col.sortable !== false;

                return (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={
                      canSort
                        ? isSorted
                          ? sortConfig.direction === 'asc'
                            ? 'ascending'
                            : 'descending'
                          : 'none'
                        : undefined
                    }
                    className={cn(
                      'p-3 text-left text-sm font-semibold text-gray-600',
                      canSort && 'select-none',
                    )}
                  >
                    {canSort ? (
                      <button
                        type="button"
                        onClick={() => handleSort(col)}
                        className="inline-flex w-full items-center gap-1 rounded-md px-1 py-0.5 text-left transition hover:bg-ivory focus:outline-none focus:ring-2 focus:ring-green/30"
                        aria-label={`Sort by ${col.label}`}
                      >
                        {col.label}
                        {isSorted && sortConfig.direction === 'desc' ? (
                          <ChevronDown className="h-4 w-4 text-green" />
                        ) : (
                          <ChevronUp className={cn('h-4 w-4', isSorted ? 'text-green' : 'text-gray-300')} />
                        )}
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1">{col.label}</span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-sm text-slate">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              pageData.map((row, idx) => {
                const isClickable = Boolean(onRowClick);
                const rowKey =
                  row[keyField] ?? (columns.map((col) => String(row[col.key] ?? '')).join('|') || `${safePage}-${idx}`);

                return (
                  <tr
                    key={rowKey}
                    onClick={() => onRowClick?.(row)}
                    onKeyDown={(event) => {
                      if (!isClickable) return;
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onRowClick?.(row);
                      }
                    }}
                    tabIndex={isClickable ? 0 : -1}
                    role={isClickable ? 'button' : undefined}
                    className={cn(
                      'border-b transition-colors',
                      idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30',
                      isClickable && 'cursor-pointer hover:bg-mint/40 focus:outline-none focus:ring-2 focus:ring-green/30',
                    )}
                  >
                    {columns.map((col) => (
                      <td key={col.key} className="p-3 text-sm text-gray-700">
                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-slate">
        <p>
          Page {safePage} of {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={safePage === 1}
            className="rounded-lg border border-gray-200 px-3 py-1.5 font-medium text-forest transition hover:bg-ivory disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={safePage === totalPages}
            className="rounded-lg border border-gray-200 px-3 py-1.5 font-medium text-forest transition hover:bg-ivory disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}