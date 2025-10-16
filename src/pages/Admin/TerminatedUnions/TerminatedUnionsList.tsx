import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  getTerminatedUnions,
  deleteTerminatedUnion,
  TerminatedUnion,
  getUnions,
  Union,
  TerminatedUnionFilters
} from '@api/endpoints';
import { DataTable, Column } from '@components/DataTable/DataTable';
import { Button } from '@components/Button/Button';
import { FormField } from '@components/FormField/FormField';
import { Select } from '@components/Select/Select';
import { ConfirmDialog } from '@components/ConfirmDialog/ConfirmDialog';
import { Loading } from '@components/Loading/Loading';
import { useTable } from '@hooks/useTable';
import { formatDate } from '@utils/formatters';
import styles from './TerminatedUnions.module.css';

export const TerminatedUnionsList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [terminatedUnions, setTerminatedUnions] = useState<TerminatedUnion[]>([]);
  const [unions, setUnions] = useState<Union[]>([]); // For filter options
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    terminatedUnion: TerminatedUnion | null;
  }>({ isOpen: false, terminatedUnion: null });

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
    resetFilters: resetTableFilters
  } = useTable();

  const [filters, setFilters] = useState<Record<string, string>>({});
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetAllFilters = () => {
    setFilters({});
    resetTableFilters();
  };

  // Load unions for filter options
  useEffect(() => {
    const loadUnions = async () => {
      try {
        const response = await getUnions({ per_page: 1000 }); // Get all unions for filter
        setUnions(response.data.data);
      } catch (err) {
        console.error('Error loading unions:', err);
      }
    };
    loadUnions();
  }, []);

  // Load terminated unions data
  const loadTerminatedUnions = async () => {
    try {
      setLoading(true);
      setError('');

      const params: TerminatedUnionFilters = {
        page: currentPage,
        per_page: pageSize,
        q: searchTerm,
        ...filters
      };

      if (sortField && sortDirection) {
        params.sortBy = sortField;
        params.sortOrder = sortDirection;
      }

      const response = await getTerminatedUnions(params);
      setTerminatedUnions(response.data.data);

      // Update pagination info
      if (response.data.meta) {
        setTotalItems(response.data.meta.total);
        setTotalPages(response.data.meta.total_pages || Math.ceil(response.data.meta.total / pageSize));
      }
    } catch (err) {
      setError(t('messages.errorLoadingData'));
      console.error('Error loading terminated unions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTerminatedUnions();
  }, [currentPage, pageSize, searchTerm, sortField, sortDirection, filters]);

  const handleDelete = async (terminatedUnion: TerminatedUnion) => {
    if (!terminatedUnion.id) return;
    try {
      setLoading(true);
      await deleteTerminatedUnion(terminatedUnion.id);
      setDeleteDialog({ isOpen: false, terminatedUnion: null });
      loadTerminatedUnions();
    } catch (err) {
      setError(t('messages.errorDeletingData'));
      console.error('Error deleting terminated union:', err);
    } finally {
      setLoading(false);
    }
  };

  // Table columns configuration
  const columns: Column<TerminatedUnion>[] = [
    {
      key: 'union_id',
      label: t('terminatedUnions.union'),
      sortable: true,
      render: (value: unknown, row: TerminatedUnion) => (
        <div className={styles.unionInfo}>
          <div className={styles.unionName}>
            {row.union?.name_en || `Union ID: ${value}`}
          </div>
          {row.union?.union_code && (
            <div className={styles.unionCode}>{row.union.union_code}</div>
          )}
        </div>
      )
    },
    {
      key: 'termination_date',
      label: t('terminatedUnions.terminationDate'),
      sortable: true,
      render: (value: unknown) => formatDate(String(value))
    },
    {
      key: 'termination_reason',
      label: t('terminatedUnions.terminationReason'),
      sortable: true,
      render: (value: unknown) => (
        <span className={styles.reasonBadge}>{String(value)}</span>
      )
    },
    {
      key: 'notes',
      label: t('terminatedUnions.notes'),
      render: (value: unknown) => (
        <div className={styles.notes}>
          {value ? String(value) : '-'}
        </div>
      )
    },
    {
      key: 'created_at',
      label: t('terminatedUnions.createdAt'),
      sortable: true,
      render: (value: unknown) => formatDate(String(value))
    }
  ];

  // Row actions
  const rowActions = (terminatedUnion: TerminatedUnion) => (
    <div className={styles.rowActions}>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => navigate(`/admin/terminated-unions/${terminatedUnion.id}/edit`)}
      >
        {t('common.edit')}
      </Button>
      <Button
        variant="danger"
        size="sm"
        onClick={() => setDeleteDialog({ isOpen: true, terminatedUnion })}
      >
        {t('common.delete')}
      </Button>
    </div>
  );

  if (loading && terminatedUnions.length === 0) {
    return <Loading />;
  }

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{t('terminatedUnions.title')}</h1>
          <p className={styles.subtitle}>{t('terminatedUnions.subtitle')}</p>
        </div>
        <Button onClick={() => navigate('/admin/terminated-unions/new')}>
          {t('terminatedUnions.addTerminatedUnion')}
        </Button>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      <div className={styles.toolbar}>
        <FormField
          type="text"
          placeholder={t('terminatedUnions.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className={styles.searchBox}
        />

        <div className={styles.filtersSection}>
          <Select
            value={filters?.union_id || ''}
            onChange={(e) => handleFilterChange('union_id', e.target.value)}
            placeholder={t('terminatedUnions.filterByUnion')}
            className={styles.filterSelect}
            options={[
              { value: '', label: t('terminatedUnions.allUnions') },
              ...unions.map(union => ({
                value: union.id.toString(),
                label: union.name_en
              }))
            ]}
          />

          <Select
            value={filters?.termination_reason || ''}
            onChange={(e) => handleFilterChange('termination_reason', e.target.value)}
            placeholder={t('terminatedUnions.filterByReason')}
            className={styles.filterSelect}
            options={[
              { value: '', label: t('terminatedUnions.allReasons') },
              { value: 'dissolution', label: t('terminatedUnions.reasons.dissolution') },
              { value: 'merger', label: t('terminatedUnions.reasons.merger') },
              { value: 'violation', label: t('terminatedUnions.reasons.violation') },
              { value: 'insolvency', label: t('terminatedUnions.reasons.insolvency') },
              { value: 'membership', label: t('terminatedUnions.reasons.membership') },
              { value: 'other', label: t('terminatedUnions.reasons.other') }
            ]}
          />

          <div className={styles.dateFilters}>
            <FormField
              type="date"
              placeholder={t('terminatedUnions.dateFrom')}
              value={filters?.date_from || ''}
              onChange={(e) => handleFilterChange('date_from', e.target.value)}
              className={styles.dateFilter}
            />
            <FormField
              type="date"
              placeholder={t('terminatedUnions.dateTo')}
              value={filters?.date_to || ''}
              onChange={(e) => handleFilterChange('date_to', e.target.value)}
              className={styles.dateFilter}
            />
          </div>

          <Button
            variant="secondary"
            onClick={resetAllFilters}
            className={styles.resetButton}
          >
            {t('common.resetFilters')}
          </Button>
        </div>
      </div>

      <DataTable
        data={terminatedUnions}
        columns={columns}
        actions={rowActions}
        currentPage={currentPage}
        perPage={pageSize}
        totalItems={totalItems}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onPerPageChange={handlePageSizeChange}
        onSort={(key) => handleSort(key, sortDirection === 'asc' ? 'desc' : 'asc')}
        sortBy={sortField}
        sortOrder={sortDirection}
        isLoading={loading}
        emptyMessage={t('terminatedUnions.noTerminatedUnionsFound')}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title={t('terminatedUnions.deleteTerminatedUnion')}
        message={t('terminatedUnions.deleteConfirmation')}
        onConfirm={() => deleteDialog.terminatedUnion && handleDelete(deleteDialog.terminatedUnion)}
        onClose={() => setDeleteDialog({ isOpen: false, terminatedUnion: null })}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="danger"
      />
    </motion.div>
  );
};

export default TerminatedUnionsList;
