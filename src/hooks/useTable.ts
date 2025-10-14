import { useState, useCallback } from 'react';

export interface TableState {
  page: number;
  per_page: number;
  search: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UseTableOptions {
  initialPage?: number;
  initialPerPage?: number;
  initialSearch?: string;
}

export const useTable = (options: UseTableOptions = {}) => {
  const [tableState, setTableState] = useState<TableState>({
    page: options.initialPage || 1,
    per_page: options.initialPerPage || 20,
    search: options.initialSearch || '',
  });

  const setPage = useCallback((page: number) => {
    setTableState((prev) => ({ ...prev, page }));
  }, []);

  const setPerPage = useCallback((per_page: number) => {
    setTableState((prev) => ({ ...prev, per_page, page: 1 }));
  }, []);

  const setSearch = useCallback((search: string) => {
    setTableState((prev) => ({ ...prev, search, page: 1 }));
  }, []);

  const setSorting = useCallback((sortBy: string, sortOrder: 'asc' | 'desc') => {
    setTableState((prev) => ({ ...prev, sortBy, sortOrder }));
  }, []);

  const resetFilters = useCallback(() => {
    setTableState({
      page: 1,
      per_page: options.initialPerPage || 20,
      search: '',
    });
  }, [options.initialPerPage]);

  const nextPage = useCallback(() => {
    setTableState((prev) => ({ ...prev, page: prev.page + 1 }));
  }, []);

  const previousPage = useCallback(() => {
    setTableState((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }));
  }, []);

  return {
    ...tableState,
    setPage,
    setPerPage,
    setSearch,
    setSorting,
    resetFilters,
    nextPage,
    previousPage,
  };
};

export default useTable;

