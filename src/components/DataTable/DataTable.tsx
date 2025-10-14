import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../Button/Button';
import { Loading } from '../Loading/Loading';
import { cn } from '@utils/helpers';
import styles from './DataTable.module.css';

export interface Column<T> {
  key: string;
  label: string;
  render?: (value: unknown, row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  actions?: (row: T) => React.ReactNode;
  // Pagination props
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  perPage?: number;
  onPageChange?: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
  // Sorting
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string) => void;
}

export const DataTable = <T extends { id: number | string }>({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No data available',
  onRowClick,
  actions,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  perPage = 20,
  onPageChange,
  onPerPageChange,
  sortBy,
  sortOrder,
  onSort,
}: DataTableProps<T>) => {
  const handleSort = (key: string) => {
    if (onSort) {
      onSort(key);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Loading size="lg" message="Loading data..." />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  const startItem = (currentPage - 1) * perPage + 1;
  const endItem = Math.min(currentPage * perPage, totalItems);

  return (
    <div className={styles.container}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(styles.th, column.sortable && styles.sortable)}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className={styles.thContent}>
                    <span>{column.label}</span>
                    {column.sortable && sortBy === column.key && (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        className={cn(styles.sortIcon, sortOrder === 'desc' && styles.sortDesc)}
                      >
                        <path d="M8 4L12 8L4 8L8 4Z" fill="currentColor" />
                      </svg>
                    )}
                  </div>
                </th>
              ))}
              {actions && <th className={styles.th}>Actions</th>}
            </tr>
          </thead>
          <tbody className={styles.tbody}>
            {data.map((row, index) => (
              <motion.tr
                key={row.id}
                className={cn(styles.tr, onRowClick && styles.clickable)}
                onClick={() => onRowClick?.(row)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.2 }}
              >
                {columns.map((column) => {
                  const value = (row as Record<string, unknown>)[column.key];
                  return (
                    <td key={column.key} className={styles.td}>
                      {column.render ? column.render(value, row) : String(value ?? '')}
                    </td>
                  );
                })}
                {actions && (
                  <td
                    className={styles.td}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className={styles.actions}>{actions(row)}</div>
                  </td>
                )}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <div className={styles.paginationInfo}>
            <span>
              Showing {startItem} to {endItem} of {totalItems} results
            </span>
            {onPerPageChange && (
              <select
                value={perPage}
                onChange={(e) => onPerPageChange(Number(e.target.value))}
                className={styles.perPageSelect}
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            )}
          </div>
          <div className={styles.paginationControls}>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className={styles.pageNumbers}>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange?.(pageNum)}
                    className={cn(styles.pageButton, currentPage === pageNum && styles.active)}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;

