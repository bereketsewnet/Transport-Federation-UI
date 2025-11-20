import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  getCBAs, 
  deleteCBA, 
  CBA,
  getUnions,
  Union
} from '@api/endpoints';
import { DataTable } from '@components/DataTable/DataTable';
import { Button } from '@components/Button/Button';
import { FormField } from '@components/FormField/FormField';
import { Select } from '@components/Select/Select';
import { ConfirmDialog } from '@components/ConfirmDialog/ConfirmDialog';
import { Loading } from '@components/Loading/Loading';
// import { useTable } from '@hooks/useTable';
import { formatDate } from '@utils/formatters';
import styles from './CBAs.module.css';

export const CBAsListFixed: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // State management
  const [cbas, setCbas] = useState<CBA[]>([]);
  const [unions, setUnions] = useState<Union[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    cba: CBA | null;
  }>({ isOpen: false, cba: null });

  // Local filter state
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filter handlers
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    setSortField(field);
    setSortDirection(direction);
  };

  const resetFilters = () => {
    setFilters({});
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Load CBAs data
  const loadCBAs = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page: currentPage,
        per_page: pageSize,
        q: searchTerm,
        ...filters
      };

      const response = await getCBAs(params);
      
      setCbas(response.data.data || []);
      
      // Update pagination info
      if (response.data.meta) {
        setTotalItems(response.data.meta.total || 0);
        setTotalPages(response.data.meta.total_pages || Math.ceil((response.data.meta.total || 0) / pageSize));
      }
    } catch (err: any) {
      setError(t('messages.errorLoadingData'));
    } finally {
      setLoading(false);
    }
  };

  // Load unions for filter
  const loadUnions = async () => {
    try {
      const response = await getUnions({ per_page: 1000 });
      const rawUnions = response.data.data || [];
      setUnions(rawUnions);
    } catch (err) { 
    }
  };

  useEffect(() => {
    loadCBAs();
    loadUnions();
  }, [currentPage, pageSize, sortField, sortDirection, searchTerm, filters]);

  // Handle delete CBA
  const handleDelete = async (cba: CBA) => {
    try {
      await deleteCBA(cba.id);
      setDeleteDialog({ isOpen: false, cba: null });
      await loadCBAs(); // Reload data
    } catch (err) {
      setError(t('messages.errorDeletingData'));
    }
  };

  // Table columns configuration
  const columns = [
    {
      key: 'title',
      label: t('cbas.title'),
      sortable: true,
      render: (value: unknown, row: CBA) => (
        <div className={styles.cbaInfo}>
          <div className={styles.cbaTitle}>{String(value)}</div>
          <div className={styles.cbaDescription}>{row.description}</div>
        </div>
      )
    },
    {
      key: 'union_id',
      label: t('cbas.union'),
      sortable: true,
      render: (value: unknown) => {
        const union = unions.find(u => u.id === value);
        return union ? union.name_en : 'Unknown Union';
      }
    },
    {
      key: 'start_date',
      label: t('cbas.startDate'),
      sortable: true,
      render: (value: unknown) => formatDate(String(value))
    },
    {
      key: 'end_date',
      label: t('cbas.endDate'),
      sortable: true,
      render: (value: unknown) => formatDate(String(value))
    },
    {
      key: 'status',
      label: t('cbas.status'),
      sortable: true,
      render: (value: unknown) => (
        <span className={`${styles.statusBadge} ${styles[String(value)]}`}>
          {String(value)}
        </span>
      )
    }
  ];

  // Row actions
  const rowActions = (cba: CBA) => (
    <div className={styles.rowActions}>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => navigate(`/admin/cbas/${cba.id}/edit`)}
      >
        {t('common.edit')}
      </Button>
      <Button
        size="sm"
        variant="danger"
        onClick={() => setDeleteDialog({ isOpen: true, cba })}
      >
        {t('common.delete')}
      </Button>
    </div>
  );

  if (loading && cbas.length === 0) {
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
          <h1 className={styles.title}>{t('cbas.title')}</h1>
          <p className={styles.subtitle}>{t('cbas.subtitle')}</p>
        </div>
        <div className={styles.headerActions}>
          <Button
            onClick={() => navigate('/admin/cbas/new')}
            className={styles.addButton}
          >
            {t('cbas.addCBA')}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterRow}>
          <FormField
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={t('cbas.searchCBAs')}
            className={styles.searchBox}
          />

          <Select
            value={filters?.union_id || ''}
            onChange={(e) => handleFilterChange('union_id', e.target.value)}
            placeholder={t('cbas.filterByUnion')}
            className={styles.filterSelect}
            options={[
              { value: '', label: t('cbas.allUnions') },
              ...unions
                .filter(u => u && (u.id || (u as any).union_id) && u.name_en)
                .map(union => ({
                  value: ((union.id || (union as any).union_id)).toString(),
                  label: union.name_en
                }))
            ]}
          />

          <Select
            value={filters?.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            placeholder={t('cbas.filterByStatus')}
            className={styles.filterSelect}
            options={[
              { value: '', label: t('cbas.allStatuses') },
              { value: 'active', label: t('cbas.statuses.active') },
              { value: 'expired', label: t('cbas.statuses.expired') },
              { value: 'pending', label: t('cbas.statuses.pending') }
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
          data={cbas}
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
          emptyMessage={t('cbas.noCBAsFound')}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title={t('cbas.deleteCBA')}
        message={t('cbas.deleteConfirmation', { title: deleteDialog.cba?.title })}
        onConfirm={() => deleteDialog.cba && handleDelete(deleteDialog.cba)}
        onClose={() => setDeleteDialog({ isOpen: false, cba: null })}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="danger"
      />
    </motion.div>
  );
};

export default CBAsListFixed;
