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
import { formatDate } from '@utils/formatters';
import { toast } from 'react-hot-toast';
import styles from './Unions.module.css';

type UnionRow = Union & { id: number };

export const UnionsListComplete: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // State management
  const [unions, setUnions] = useState<UnionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    union: UnionRow | null;
  }>({ isOpen: false, union: null });

  // Filter and pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filter handlers
  const handleFilterChange = (key: string, value: string) => {
    console.log(`🔧 Filter changed: ${key} = ${value}`);
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSearch = (value: string) => {
    console.log('🔍 Search:', value);
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

  // Load unions data
  const loadUnions = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params: any = {
        page: currentPage,
        per_page: pageSize,
        q: searchTerm,
        ...filters
      };

      console.log('📊 Loading unions with params:', params);
      const response = await getUnions(params);
      console.log('✅ Unions response:', response);
      
      const rawUnions = response.data.data || [];
      
      // Transform unions to add 'id' field if needed
      const transformedUnions: UnionRow[] = rawUnions.map(u => ({
        ...u,
        id: u.id || (u as any).union_id // Handle both id and union_id
      }));
      
      console.log('📋 Transformed unions:', transformedUnions.length, 'unions');
      console.log('📋 First union:', transformedUnions[0]);
      
      setUnions(transformedUnions);
      
      // Update pagination info
      if (response.data.meta) {
        setTotalItems(response.data.meta.total || 0);
        setTotalPages(response.data.meta.total_pages || Math.ceil((response.data.meta.total || 0) / pageSize));
      }
    } catch (err: any) {
      console.error('💥 Error loading unions:', err);
      setError(t('messages.errorLoadingData'));
      toast.error(t('messages.errorLoadingData'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUnions();
  }, [currentPage, pageSize, sortField, sortDirection, searchTerm, filters]);

  // Handle delete union
  const handleDelete = async () => {
    if (!deleteDialog.union) return;
    
    try {
      console.log('🗑️ Deleting union:', deleteDialog.union.id);
      await deleteUnion(deleteDialog.union.id);
      toast.success(t('messages.deleteSuccess'));
      setDeleteDialog({ isOpen: false, union: null });
      await loadUnions(); // Reload data
    } catch (err) {
      console.error('💥 Error deleting union:', err);
      setError(t('messages.errorDeletingData'));
      toast.error(t('messages.errorDeletingData'));
    }
  };

  // Table columns configuration
  const columns = [
    {
      key: 'name_en',
      label: t('unions.name'),
      sortable: true,
      render: (value: unknown, row: UnionRow) => (
        <div className={styles.unionInfo}>
          <div className={styles.unionName}>{String(value || 'N/A')}</div>
          <div className={styles.unionCode}>{row.union_code || 'N/A'}</div>
        </div>
      )
    },
    {
      key: 'sector',
      label: t('unions.sector'),
      sortable: true,
      render: (value: unknown) => (
        <span className={styles.sectorBadge}>{String(value || 'N/A')}</span>
      )
    },
    {
      key: 'organization',
      label: t('unions.organization'),
      sortable: true,
      render: (value: unknown) => String(value || 'N/A')
    },
    {
      key: 'established_date',
      label: t('unions.establishedDate'),
      sortable: true,
      render: (value: unknown) => value ? formatDate(String(value)) : 'N/A'
    },
    {
      key: 'created_at',
      label: t('unions.createdAt'),
      sortable: true,
      render: (value: unknown) => value ? formatDate(String(value)) : 'N/A'
    }
  ];

  // Row actions
  const rowActions = (union: UnionRow) => {
    console.log('🔧 Rendering actions for union:', union);
    console.log('🆔 Union ID:', union.id, 'Type:', typeof union.id);
    
    return (
      <div className={styles.rowActions}>
        <Button
          size="sm"
          variant="secondary"
          onClick={(e) => {
            e.stopPropagation();
            console.log('✏️ Edit clicked for union ID:', union.id);
            navigate(`/admin/unions/${union.id}/edit`);
          }}
        >
          {t('common.edit')}
        </Button>
        <Button
          size="sm"
          variant="danger"
          onClick={(e) => {
            e.stopPropagation();
            console.log('🗑️ Delete clicked for union ID:', union.id);
            setDeleteDialog({ isOpen: true, union });
          }}
        >
          {t('common.delete')}
        </Button>
      </div>
    );
  };

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

      {/* Search and Filters - Single Row */}
      <div className={styles.toolbar}>
        <FormField
          type="search"
          placeholder={t('unions.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className={styles.searchBox}
        />
        
        <Select
          value={filters?.sector || ''}
          onChange={(e) => handleFilterChange('sector', e.target.value)}
          placeholder={t('unions.filterBySector')}
          className={styles.filterSelect}
          options={[
            { value: '', label: t('unions.allSectors') },
            { value: 'Transport', label: 'Transport' },
            { value: 'Communication', label: 'Communication' },
            { value: 'Logistics', label: 'Logistics' },
            { value: 'Aviation', label: 'Aviation' },
            { value: 'Maritime', label: 'Maritime' }
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
        message={t('unions.deleteConfirmation', { name: deleteDialog.union?.name_en || '' })}
        onConfirm={handleDelete}
        onClose={() => setDeleteDialog({ isOpen: false, union: null })}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="danger"
      />
    </motion.div>
  );
};

export default UnionsListComplete;

