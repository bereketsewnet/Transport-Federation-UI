import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { useTable } from '@hooks/useTable';
import { formatDate } from '@utils/formatters';
import styles from './CBAs.module.css';

export const CBAsList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [cbas, setCbas] = useState<CBA[]>([]);
  const [unions, setUnions] = useState<Union[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    cba: CBA | null;
  }>({ isOpen: false, cba: null });

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
      setCbas(response.data.data);
      
      // Update pagination info
      if (response.data.meta) {
        setTotalItems(response.data.meta.total);
        setTotalPages(response.data.meta.total_pages || Math.ceil(response.data.meta.total / pageSize));
      }
    } catch (err) {
      setError(t('messages.errorLoadingData'));
      console.error('Error loading CBAs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load unions for filter
  const loadUnions = async () => {
    try {
      const response = await getUnions({ per_page: 100 });
      setUnions(response.data.data);
    } catch (err) {
      console.error('Error loading unions:', err);
    }
  };

  useEffect(() => {
    loadCBAs();
  }, [currentPage, pageSize, sortField, sortDirection, searchTerm, filters]);

  useEffect(() => {
    loadUnions();
  }, []);

  // Handle delete CBA
  const handleDelete = async (cba: CBA) => {
    try {
      await deleteCBA(cba.id);
      setDeleteDialog({ isOpen: false, cba: null });
      await loadCBAs(); // Reload data
    } catch (err) {
      setError(t('messages.errorDeletingData'));
      console.error('Error deleting CBA:', err);
    }
  };

  // Get union name by ID
  const getUnionName = (unionId: number) => {
    const union = unions.find(u => u.id === unionId);
    return union ? union.name_en : `Union ${unionId}`;
  };

  // Check if CBA is expired
  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  // Get days until expiration
  const getDaysUntilExpiration = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Table columns configuration
  const columns = [
    {
      key: 'union_id',
      label: t('cbas.union'),
      sortable: true,
      render: (value: unknown, row: CBA) => (
        <div className={styles.unionInfo}>
          <div className={styles.unionName}>{getUnionName(Number(value))}</div>
          <div className={styles.cbaId}>CBA #{row.id}</div>
        </div>
      )
    },
    {
      key: 'title',
      label: t('cbas.title'),
      sortable: true,
      render: (value: unknown) => (
        <div className={styles.titleInfo}>
          <div className={styles.titleText}>{String(value)}</div>
        </div>
      )
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
      render: (value: unknown) => {
        const endDate = String(value);
        const daysLeft = getDaysUntilExpiration(endDate);
        const expired = isExpired(endDate);
        
        return (
          <div className={styles.dateInfo}>
            <div className={styles.endDate}>{formatDate(endDate)}</div>
            <div className={`${styles.statusBadge} ${expired ? styles.expired : styles.active}`}>
              {expired ? t('cbas.statuses.expired') : `${daysLeft} ${t('cbas.daysLeft')}`}
            </div>
          </div>
        );
      }
    },
    {
      key: 'status',
      label: t('cbas.status'),
      sortable: true,
      render: (value: unknown) => (
        <span className={`${styles.statusBadge} ${styles[String(value)]}`}>
          {t(`cbas.statuses.${String(value)}`)}
        </span>
      )
    },
    {
      key: 'created_at',
      label: t('cbas.createdAt'),
      sortable: true,
      render: (value: unknown) => formatDate(String(value))
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
        variant="secondary"
        onClick={() => navigate(`/admin/cbas/${cba.id}/view`)}
      >
        {t('common.view')}
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
          <Link to="/admin/cbas/new">
            <Button size="lg">
              {t('cbas.addCBA')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className={styles.toolbar}>
        <div className={styles.searchSection}>
          <FormField
            type="search"
            placeholder={t('cbas.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className={styles.searchBox}
          />
        </div>
        
        <div className={styles.filtersSection}>
          <Select
            value={filters.union_id || ''}
            onChange={(e) => handleFilterChange('union_id', e.target.value)}
            placeholder={t('cbas.filterByUnion')}
            className={styles.filterSelect}
            options={[
              { value: '', label: t('cbas.allUnions') },
              ...unions.map(union => ({
                value: union.id.toString(),
                label: union.name_en
              }))
            ]}
          />

          <Select
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            placeholder={t('cbas.filterByStatus')}
            className={styles.filterSelect}
            options={[
              { value: '', label: t('cbas.allStatuses') },
              { value: 'active', label: t('cbas.statuses.active') },
              { value: 'expired', label: t('cbas.statuses.expired') },
              { value: 'pending', label: t('cbas.statuses.pending') },
              { value: 'negotiating', label: t('cbas.statuses.negotiating') }
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

export default CBAsList;
