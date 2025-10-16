import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  getUnions, 
  deleteUnion, 
  Union
} from '@api/endpoints';
import { DataTable } from '@components/DataTable/DataTable';
import { Button } from '@components/Button/Button';
import { FormField } from '@components/FormField/FormField';
import { Select } from '@components/Select/Select';
import { ConfirmDialog } from '@components/ConfirmDialog/ConfirmDialog';
import { Loading } from '@components/Loading/Loading';
import { useTable } from '@hooks/useTable';
import { formatDate } from '@utils/formatters';
import styles from './Unions.module.css';

export const UnionsList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [unions, setUnions] = useState<Union[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    union: Union | null;
  }>({ isOpen: false, union: null });

  const {
    page: currentPage,
    per_page: pageSize,
    search: searchTerm,
    sortBy: sortField,
    sortOrder: sortDirection,
    setPage: handlePageChange,
    setPerPage: handlePageSizeChange,
    setSearch: handleSearch,
    setSorting: handleSort,
    resetFilters
  } = useTable();

  const [filters, setFilters] = useState<Record<string, string>>({});
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Load unions data
  const loadUnions = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page: currentPage,
        per_page: pageSize,
        q: searchTerm,
        ...filters
      };

      const response = await getUnions(params);
      setUnions(response.data.data);
      
      // Update pagination info
      if (response.data.meta) {
        setTotalItems(response.data.meta.total);
        setTotalPages(response.data.meta.total_pages || Math.ceil(response.data.meta.total / pageSize));
      }
    } catch (err) {
      setError(t('messages.errorLoadingData'));
      console.error('Error loading unions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUnions();
  }, [currentPage, pageSize, sortField, sortDirection, searchTerm, filters]);

  // Handle delete union
  const handleDelete = async (union: Union) => {
    try {
      await deleteUnion(union.id);
      setDeleteDialog({ isOpen: false, union: null });
      await loadUnions(); // Reload data
    } catch (err) {
      setError(t('messages.errorDeletingData'));
      console.error('Error deleting union:', err);
    }
  };

  // Table columns configuration
  const columns = [
    {
      key: 'name_en',
      label: t('unions.name'),
      sortable: true,
      render: (value: unknown, row: Union) => (
        <div className={styles.unionInfo}>
          <div className={styles.unionName}>{String(value)}</div>
          <div className={styles.unionCode}>{row.union_code}</div>
        </div>
      )
    },
    {
      key: 'sector',
      label: t('unions.sector'),
      sortable: true,
      render: (value: unknown) => (
        <span className={styles.sectorBadge}>{String(value)}</span>
      )
    },
    {
      key: 'organization',
      label: t('unions.organization'),
      sortable: true
    },
    {
      key: 'established_date',
      label: t('unions.establishedDate'),
      sortable: true,
      render: (value: unknown) => formatDate(String(value))
    },
    {
      key: 'created_at',
      label: t('unions.createdAt'),
      sortable: true,
      render: (value: unknown) => formatDate(String(value))
    }
  ];

  // Row actions
  const rowActions = (union: Union) => (
    <div className={styles.rowActions}>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => navigate(`/admin/unions/${union.id}/edit`)}
      >
        {t('common.edit')}
      </Button>
      <Button
        size="sm"
        variant="danger"
        onClick={() => setDeleteDialog({ isOpen: true, union })}
      >
        {t('common.delete')}
      </Button>
    </div>
  );

  if (loading && unions.length === 0) {
    return <Loading />;
  }

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>{t('unions.title')}</h1>
          <p className={styles.subtitle}>{t('unions.subtitle')}</p>
        </div>
        <div className={styles.headerActions}>
          <Link to="/admin/unions/new">
            <Button size="lg">
              {t('unions.addUnion')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className={styles.toolbar}>
        <div className={styles.searchSection}>
          <FormField
            type="search"
            placeholder={t('unions.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className={styles.searchBox}
          />
        </div>
        
        <div className={styles.filtersSection}>
          <Select
            value={filters?.sector || ''}
            onChange={(e) => handleFilterChange('sector', e.target.value)}
            placeholder={t('unions.filterBySector')}
            className={styles.filterSelect}
            options={[
              { value: '', label: t('unions.allSectors') },
              { value: 'transport', label: t('unions.sectors.transport') },
              { value: 'communication', label: t('unions.sectors.communication') },
              { value: 'logistics', label: t('unions.sectors.logistics') }
            ]}
          />

          <Select
            value={filters?.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            placeholder={t('unions.filterByStatus')}
            className={styles.filterSelect}
            options={[
              { value: '', label: t('unions.allStatuses') },
              { value: 'active', label: t('unions.statuses.active') },
              { value: 'inactive', label: t('unions.statuses.inactive') },
              { value: 'suspended', label: t('unions.statuses.suspended') },
              { value: 'terminated', label: t('unions.statuses.terminated') }
            ]}
          />

          <Button
            variant="secondary"
            onClick={resetFilters}
            className={styles.resetButton}
          >
            {t('common.resetFilters')}
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          className={styles.errorMessage}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.div>
      )}

      {/* Data Table */}
      <div className={styles.tableContainer}>
        <DataTable
          data={unions}
          columns={columns}
          actions={rowActions}
          currentPage={currentPage}
          perPage={pageSize}
          totalItems={totalItems}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onPerPageChange={handlePageSizeChange}
          onSort={(key) => {
            const newDirection = sortField === key && sortDirection === 'asc' ? 'desc' : 'asc';
            handleSort(key, newDirection);
          }}
          sortBy={sortField}
          sortOrder={sortDirection}
          isLoading={loading}
          emptyMessage={t('unions.noUnionsFound')}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title={t('unions.deleteUnion')}
        message={t('unions.deleteConfirmation', { name: deleteDialog.union?.name_en })}
        onConfirm={() => deleteDialog.union && handleDelete(deleteDialog.union)}
        onClose={() => setDeleteDialog({ isOpen: false, union: null })}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="danger"
      />
    </motion.div>
  );
};

export default UnionsList;
