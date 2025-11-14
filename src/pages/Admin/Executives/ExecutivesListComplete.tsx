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
import { DataTable, Column } from '@components/DataTable/DataTable';
import { Button } from '@components/Button/Button';
import { FormField } from '@components/FormField/FormField';
import { Select } from '@components/Select/Select';
import { ConfirmDialog } from '@components/ConfirmDialog/ConfirmDialog';
import { Loading } from '@components/Loading/Loading';
import { formatDate } from '@utils/formatters';
import { toast } from 'react-hot-toast';
import styles from './Executives.module.css';

export const ExecutivesListComplete: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // State management
  const [executives, setExecutives] = useState<UnionExecutive[]>([]);
  const [unions, setUnions] = useState<Union[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    executive: UnionExecutive | null;
  }>({ isOpen: false, executive: null });

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

  // Calculate if executive is currently active
  const isExecutiveActive = (executive: UnionExecutive): boolean => {
    const appointedDate = new Date(executive.appointed_date);
    const termYears = executive.term_length_years || 0;
    const endDate = new Date(appointedDate);
    endDate.setFullYear(endDate.getFullYear() + termYears);
    
    const now = new Date();
    return now <= endDate;
  };

  // Load executives data
  const loadExecutives = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params: any = {
        page: currentPage,
        per_page: pageSize,
        q: searchTerm,
        ...filters
      };

      console.log('📊 Loading Executives with params:', params);
      const response = await getUnionExecutives(params);
      console.log('✅ Executives response:', response);
      
      const executivesData = response.data.data || [];
      console.log('📋 Executives loaded:', executivesData.length);
      console.log('📋 First executive:', executivesData[0]);
      
      setExecutives(executivesData);
      
      // Update pagination info
      if (response.data.meta) {
        setTotalItems(response.data.meta.total || 0);
        setTotalPages(response.data.meta.total_pages || Math.ceil((response.data.meta.total || 0) / pageSize));
      }
    } catch (err: any) {
      console.error('💥 Error loading executives:', err);
      setError(t('messages.errorLoadingData'));
      toast.error(t('messages.errorLoadingData'));
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
  }, [currentPage, pageSize, sortField, sortDirection, searchTerm, filters]);

  useEffect(() => {
    loadUnions();
  }, []);

  // Handle delete executive
  const handleDelete = async () => {
    if (!deleteDialog.executive) return;
    
    try {
      console.log('🗑️ Deleting executive:', deleteDialog.executive.id);
      await deleteUnionExecutive(deleteDialog.executive.id);
      toast.success(t('messages.deleteSuccess'));
      setDeleteDialog({ isOpen: false, executive: null });
      await loadExecutives(); // Reload data
    } catch (err) {
      console.error('💥 Error deleting executive:', err);
      setError(t('messages.errorDeletingData'));
      toast.error(t('messages.errorDeletingData'));
    }
  };

  // Table columns configuration
  const columns: Column<UnionExecutive>[] = [
    {
      key: 'position',
      label: t('executives.position'),
      sortable: true,
      render: (value: unknown, row: UnionExecutive) => (
        <div className={styles.executiveInfo}>
          <div className={styles.executivePosition}>{String(value || 'N/A')}</div>
          <div className={styles.executiveMember}>Member Code: {row.member_code}</div>
        </div>
      )
    },
    {
      key: 'union_id',
      label: t('executives.union'),
      sortable: true,
      render: (value: unknown) => {
        const unionId = Number(value);
        const union = unions.find(u => (u.id || (u as any).union_id) === unionId);
        return union ? union.name_en : `Union #${unionId}`;
      }
    },
    {
      key: 'appointed_date',
      label: t('executives.appointedDate'),
      sortable: true,
      render: (value: unknown) => value ? formatDate(String(value)) : 'N/A'
    },
    {
      key: 'term_length_years',
      label: 'Term (Years)',
      sortable: true,
      render: (value: unknown) => `${value || 0} years`
    },
    {
      key: 'status',
      label: t('executives.status'),
      sortable: false,
      render: (_value: unknown, row: UnionExecutive) => {
        const isActive = isExecutiveActive(row);
        return (
          <span className={`${styles.statusBadge} ${isActive ? styles.active : styles.inactive}`}>
            {isActive ? 'Active' : 'Expired'}
          </span>
        );
      }
    }
  ];

  // Row actions - Edit and Delete
  const rowActions = (executive: UnionExecutive) => {
    console.log('🔧 Rendering actions for executive:', executive);
    console.log('🆔 Executive ID:', executive.id, 'Type:', typeof executive.id);
    
    return (
      <div className={styles.rowActions}>
        <Button
          size="sm"
          variant="secondary"
          onClick={(e) => {
            e.stopPropagation();
            console.log('✏️ Edit clicked for executive ID:', executive.id);
            navigate(`/admin/executives/${executive.id}/edit`);
          }}
        >
          {t('common.edit')}
        </Button>
        <Button
          size="sm"
          variant="danger"
          onClick={(e) => {
            e.stopPropagation();
            console.log('🗑️ Delete clicked for executive ID:', executive.id);
            setDeleteDialog({ isOpen: true, executive });
          }}
        >
          {t('common.delete')}
        </Button>
      </div>
    );
  };

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
          <p className={styles.subtitle}>Manage union executive members</p>
        </div>
        <div className={styles.headerActions}>
          <Button onClick={() => navigate('/admin/executives/new')}>
            {t('executives.addExecutive')}
          </Button>
        </div>
      </div>

      {/* Search and Filters - Single Row */}
      <div className={styles.toolbar}>
        <FormField
          type="search"
          placeholder="Search executives..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className={styles.searchBox}
        />
        
        <Select
          value={filters?.union_id || ''}
          onChange={(e) => handleFilterChange('union_id', e.target.value)}
          placeholder="Filter by Union"
          className={styles.filterSelect}
          options={[
            { value: '', label: 'All Unions' },
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
          placeholder="Filter by Position"
          className={styles.filterSelect}
          options={[
            { value: '', label: 'All Positions' },
            { value: 'Chairman', label: 'Chairman' },
            { value: 'Vice', label: 'Vice' },
            { value: 'General Secretary', label: 'General Secretary' },
            { value: 'Assistant General Secretary', label: 'Assistant General Secretary' },
            { value: 'Executive-Member', label: 'Executive-Member' },
            { value: 'Finance Head', label: 'Finance Head' },
            { value: 'Assistant Accountant', label: 'Assistant Accountant' },
            { value: 'Cashier', label: 'Cashier' },
            { value: "Women's Representative", label: "Women's Representative" },
            { value: 'General Audit', label: 'General Audit' },
            { value: 'Audit Secretary', label: 'Audit Secretary' },
            { value: 'Audit Member', label: 'Audit Member' }
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
          emptyMessage="No executives found"
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title={t('executives.deleteExecutive')}
        message="Are you sure you want to delete this executive?"
        onConfirm={handleDelete}
        onClose={() => setDeleteDialog({ isOpen: false, executive: null })}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="danger"
      />
    </motion.div>
  );
};

export default ExecutivesListComplete;

