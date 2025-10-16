import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  getUnionExecutives, 
  deleteUnionExecutive, 
  UnionExecutive,
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
import styles from './Executives.module.css';

export const ExecutivesList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [executives, setExecutives] = useState<UnionExecutive[]>([]);
  const [unions, setUnions] = useState<Union[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    executive: UnionExecutive | null;
  }>({ isOpen: false, executive: null });

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

  // Load executives data
  const loadExecutives = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page: currentPage,
        per_page: pageSize,
        q: searchTerm,
        ...filters
      };

      const response = await getUnionExecutives(params);
      setExecutives(response.data.data);
      
      // Update pagination info
      if (response.data.meta) {
        setTotalItems(response.data.meta.total);
        setTotalPages(response.data.meta.total_pages || Math.ceil(response.data.meta.total / pageSize));
      }
    } catch (err) {
      setError(t('messages.errorLoadingData'));
      console.error('Error loading executives:', err);
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
    loadExecutives();
  }, [currentPage, pageSize, sortField, sortDirection, searchTerm, filters]);

  useEffect(() => {
    loadUnions();
  }, []);

  // Handle delete executive
  const handleDelete = async (executive: UnionExecutive) => {
    try {
      await deleteUnionExecutive(executive.id);
      setDeleteDialog({ isOpen: false, executive: null });
      await loadExecutives(); // Reload data
    } catch (err) {
      setError(t('messages.errorDeletingData'));
      console.error('Error deleting executive:', err);
    }
  };

  // Get union name by ID
  const getUnionName = (unionId: number) => {
    const union = unions.find(u => u.id === unionId);
    return union ? union.name_en : `Union ${unionId}`;
  };

  // Calculate remaining term
  const getRemainingTerm = (appointedDate: string, termLength: number) => {
    const appointed = new Date(appointedDate);
    const endDate = new Date(appointed);
    endDate.setFullYear(endDate.getFullYear() + termLength);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} days` : 'Expired';
  };

  // Table columns configuration
  const columns = [
    {
      key: 'position',
      label: t('executives.position'),
      sortable: true,
      render: (value: unknown, row: UnionExecutive) => (
        <div className={styles.positionInfo}>
          <div className={styles.positionName}>{String(value)}</div>
          <div className={styles.unionName}>{getUnionName(row.union_id)}</div>
        </div>
      )
    },
    {
      key: 'mem_id',
      label: t('executives.member'),
      sortable: true,
      render: (value: unknown) => (
        <span className={styles.memberId}>#{String(value)}</span>
      )
    },
    {
      key: 'appointed_date',
      label: t('executives.appointedDate'),
      sortable: true,
      render: (value: unknown) => formatDate(String(value))
    },
    {
      key: 'term_length_years',
      label: t('executives.termLength'),
      sortable: true,
      render: (value: unknown, row: UnionExecutive) => (
        <div className={styles.termInfo}>
          <span className={styles.termLength}>{String(value)} years</span>
          <span className={styles.remainingTerm}>
            {getRemainingTerm(row.appointed_date, Number(value))}
          </span>
        </div>
      )
    },
    {
      key: 'created_at',
      label: t('executives.createdAt'),
      sortable: true,
      render: (value: unknown) => formatDate(String(value))
    }
  ];

  // Row actions
  const rowActions = (executive: UnionExecutive) => (
    <div className={styles.rowActions}>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => navigate(`/admin/executives/${executive.id}/edit`)}
      >
        {t('common.edit')}
      </Button>
      <Button
        size="sm"
        variant="danger"
        onClick={() => setDeleteDialog({ isOpen: true, executive })}
      >
        {t('common.delete')}
      </Button>
    </div>
  );

  if (loading && executives.length === 0) {
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
          <h1 className={styles.title}>{t('executives.title')}</h1>
          <p className={styles.subtitle}>{t('executives.subtitle')}</p>
        </div>
        <div className={styles.headerActions}>
          <Link to="/admin/executives/new">
            <Button size="lg">
              {t('executives.addExecutive')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className={styles.toolbar}>
        <div className={styles.searchSection}>
          <FormField
            type="search"
            placeholder={t('executives.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className={styles.searchBox}
          />
        </div>
        
        <div className={styles.filtersSection}>
          <Select
            value={filters?.union_id || ''}
            onChange={(e) => handleFilterChange('union_id', e.target.value)}
            placeholder={t('executives.filterByUnion')}
            className={styles.filterSelect}
            options={[
              { value: '', label: t('executives.allUnions') },
              ...unions.map(union => ({
                value: union.id.toString(),
                label: union.name_en
              }))
            ]}
          />

          <Select
            value={filters?.position || ''}
            onChange={(e) => handleFilterChange('position', e.target.value)}
            placeholder={t('executives.filterByPosition')}
            className={styles.filterSelect}
            options={[
              { value: '', label: t('executives.allPositions') },
              { value: 'chairman', label: t('executives.positions.chairman') },
              { value: 'vice_chairman', label: t('executives.positions.viceChairman') },
              { value: 'secretary', label: t('executives.positions.secretary') },
              { value: 'treasurer', label: t('executives.positions.treasurer') },
              { value: 'member', label: t('executives.positions.member') }
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
          data={executives}
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
          emptyMessage={t('executives.noExecutivesFound')}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title={t('executives.deleteExecutive')}
        message={t('executives.deleteConfirmation', { position: deleteDialog.executive?.position })}
        onConfirm={() => deleteDialog.executive && handleDelete(deleteDialog.executive)}
        onClose={() => setDeleteDialog({ isOpen: false, executive: null })}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="danger"
      />
    </motion.div>
  );
};

export default ExecutivesList;
