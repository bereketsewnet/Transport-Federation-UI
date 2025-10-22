import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
// import { useTable } from '@hooks/useTable';
import { formatDate } from '@utils/formatters';
import styles from './Executives.module.css';

export const ExecutivesListFixed: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // State management
  const [executives, setExecutives] = useState<UnionExecutive[]>([]);
  const [unions, setUnions] = useState<Union[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    executive: UnionExecutive | null;
  }>({ isOpen: false, executive: null });

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

      console.log('🔍 Loading Executives with params:', params);
      const response = await getUnionExecutives(params);
      console.log('✅ Executives response:', response);
      
      setExecutives(response.data.data || []);
      
      // Update pagination info
      if (response.data.meta) {
        setTotalItems(response.data.meta.total || 0);
        setTotalPages(response.data.meta.total_pages || Math.ceil((response.data.meta.total || 0) / pageSize));
      }
    } catch (err: any) {
      console.error('💥 Error loading executives:', err);
      setError(t('messages.errorLoadingData'));
    } finally {
      setLoading(false);
    }
  };

  // Load unions for filter
  const loadUnions = async () => {
    try {
      console.log('🔄 Loading unions for filter...');
      const response = await getUnions({ per_page: 1000 });
      const rawUnions = response.data.data || [];
      console.log('✅ Unions loaded:', rawUnions.length);
      console.log('📋 First union:', rawUnions[0]);
      setUnions(rawUnions);
    } catch (err) {
      console.error('💥 Error loading unions:', err);
    }
  };

  useEffect(() => {
    loadExecutives();
    loadUnions();
  }, [currentPage, pageSize, sortField, sortDirection, searchTerm, filters]);

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

  // Table columns configuration
  const columns = [
    {
      key: 'position',
      label: t('executives.position'),
      sortable: true,
      render: (value: unknown, row: UnionExecutive) => (
        <div className={styles.executiveInfo}>
          <div className={styles.executivePosition}>{String(value)}</div>
          <div className={styles.executiveMember}>Member ID: {row.mem_id}</div>
        </div>
      )
    },
    {
      key: 'union_id',
      label: t('executives.union'),
      sortable: true,
      render: (value: unknown) => {
        const union = unions.find(u => u.id === value);
        return union ? union.name_en : 'Unknown Union';
      }
    },
    {
      key: 'appointed_date',
      label: t('executives.appointedDate'),
      sortable: true,
      render: (value: unknown) => formatDate(String(value))
    },
    {
      key: 'end_date',
      label: t('executives.endDate'),
      sortable: true,
      render: (value: unknown) => formatDate(String(value))
    },
    {
      key: 'status',
      label: t('executives.status'),
      sortable: true,
      render: (value: unknown) => (
        <span className={`${styles.statusBadge} ${styles[String(value)]}`}>
          {String(value)}
        </span>
      )
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
          <Button
            onClick={() => navigate('/admin/executives/new')}
            className={styles.addButton}
          >
            {t('executives.addExecutive')}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterRow}>
          <FormField
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={t('executives.searchExecutives')}
            className={styles.searchBox}
          />

          <Select
            value={filters?.union_id || ''}
            onChange={(e) => handleFilterChange('union_id', e.target.value)}
            placeholder={t('executives.filterByUnion')}
            className={styles.filterSelect}
            options={[
              { value: '', label: t('executives.allUnions') },
              ...unions
                .filter(u => u && (u.id || (u as any).union_id) && u.name_en)
                .map(union => ({
                  value: ((union.id || (union as any).union_id)).toString(),
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
              { value: 'president', label: t('executives.positions.president') },
              { value: 'vice_president', label: t('executives.positions.vicePresident') },
              { value: 'secretary', label: t('executives.positions.secretary') },
              { value: 'treasurer', label: t('executives.positions.treasurer') }
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

export default ExecutivesListFixed;
