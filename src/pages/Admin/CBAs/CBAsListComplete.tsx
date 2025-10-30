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
import { DataTable, Column } from '@components/DataTable/DataTable';
import { Button } from '@components/Button/Button';
import { FormField } from '@components/FormField/FormField';
import { Select } from '@components/Select/Select';
import { ConfirmDialog } from '@components/ConfirmDialog/ConfirmDialog';
import { Loading } from '@components/Loading/Loading';
import { formatDate } from '@utils/formatters';
import { toast } from 'react-hot-toast';
import styles from './CBAs.module.css';

export const CBAsListComplete: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // State management
  const [cbas, setCBAs] = useState<CBA[]>([]);
  const [unions, setUnions] = useState<Union[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    cba: CBA | null;
  }>({ isOpen: false, cba: null });

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

  // Load CBAs data
  const loadCBAs = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params: any = {
        page: currentPage,
        per_page: pageSize,
        q: searchTerm,
        // do not send our derived status to API; we'll filter client-side
        ...Object.fromEntries(Object.entries(filters).filter(([k]) => !(k === 'status' && ['Signed','Ongoing','Not-Signed'].includes(String(filters.status))))),
        // keep legacy backend status if user typed one manually
        ...(filters.status && ['signed','expired','pending'].includes(String(filters.status).toLowerCase()) ? { status: filters.status } : {})
      };

      console.log('📊 Loading CBAs with params:', params);
      const response = await getCBAs(params);
      console.log('✅ CBAs response:', response);
      
      let cbasData: CBA[] = response.data.data || [];

      // helper to unify status using DB value first, otherwise derive from dates
      const unifyStatus = (cba: any): 'Signed'|'Ongoing'|'Not-Signed' => {
        const raw = String(cba?.status || '').toLowerCase();
        if (raw === 'signed') return 'Signed';
        if (raw === 'ongoing') return 'Ongoing';
        if (raw === 'not-signed' || raw === 'notsigned' || raw === 'not_signed') return 'Not-Signed';
        const today = new Date();
        const startStr = cba?.registration_date || cba?.start_date;
        const endStr = cba?.next_end_date || cba?.end_date;
        const start = startStr ? new Date(startStr) : null;
        const end = endStr ? new Date(endStr) : null;
        if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) return 'Not-Signed';
        if (start > today) return 'Signed';
        if (start <= today && end >= today) return 'Ongoing';
        return 'Not-Signed';
      };

      // client-side filter for new statuses
      if (filters.status && ['Signed','Ongoing','Not-Signed'].includes(String(filters.status))) {
        const wanted = String(filters.status) as 'Signed'|'Ongoing'|'Not-Signed';
        cbasData = cbasData.filter(c => unifyStatus(c) === wanted);
      }
      console.log('📋 CBAs loaded:', cbasData.length);
      console.log('📋 First CBA:', cbasData[0]);
      
      setCBAs(cbasData);
      
      // Update pagination info
      if (response.data.meta) {
        setTotalItems(response.data.meta.total || 0);
        setTotalPages(response.data.meta.total_pages || Math.ceil((response.data.meta.total || 0) / pageSize));
      }
    } catch (err: any) {
      console.error('💥 Error loading CBAs:', err);
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
    loadCBAs();
  }, [currentPage, pageSize, sortField, sortDirection, searchTerm, filters]);

  useEffect(() => {
    loadUnions();
  }, []);

  // Handle delete CBA
  const handleDelete = async () => {
    if (!deleteDialog.cba) return;
    
    try {
      console.log('🗑️ Deleting CBA:', deleteDialog.cba.id);
      await deleteCBA(deleteDialog.cba.id);
      toast.success(t('messages.deleteSuccess'));
      setDeleteDialog({ isOpen: false, cba: null });
      await loadCBAs(); // Reload data
    } catch (err) {
      console.error('💥 Error deleting CBA:', err);
      setError(t('messages.errorDeletingData'));
      toast.error(t('messages.errorDeletingData'));
    }
  };

  // Table columns configuration
  const columns: Column<CBA>[] = [
    {
      key: 'union_id',
      label: t('cbas.union'),
      sortable: true,
      render: (value: unknown) => {
        const unionId = Number(value);
        const union = unions.find(u => (u.id || (u as any).union_id) === unionId);
        return union ? union.name_en : `Union #${unionId}`;
      }
    },
    {
      key: 'duration_years',
      label: 'Duration (Years)',
      sortable: true,
      render: (value: unknown) => `${value || 0} years`
    },
    {
      key: 'status',
      label: t('cbas.status'),
      sortable: true,
      render: (_value: unknown, row: any) => {
        const normalized = (() => {
          const raw = String(row?.status || '').toLowerCase();
          if (raw === 'signed') return 'Signed';
          if (raw === 'ongoing') return 'Ongoing';
          if (raw === 'not-signed' || raw === 'notsigned' || raw === 'not_signed') return 'Not-Signed';
          const today = new Date();
          const startStr = row?.registration_date || row?.start_date;
          const endStr = row?.next_end_date || row?.end_date;
          const start = startStr ? new Date(startStr) : null;
          const end = endStr ? new Date(endStr) : null;
          if (start && end && !isNaN(start.getTime()) && !isNaN(end.getTime())) {
            if (start > today) return 'Signed';
            if (start <= today && end >= today) return 'Ongoing';
          }
          return 'Not-Signed';
        })();
        const badgeClass = `${styles.statusBadge} ${normalized === 'Ongoing' ? styles.active : normalized === 'Signed' ? styles.pending : styles.expired}`;
        return <span className={badgeClass}>{normalized}</span>;
      }
    },
    {
      key: 'registration_date',
      label: t('cbas.registrationDate'),
      sortable: true,
      render: (value: unknown) => value ? formatDate(String(value)) : 'N/A'
    },
    {
      key: 'next_end_date',
      label: 'Next End Date',
      sortable: true,
      render: (value: unknown) => value ? formatDate(String(value)) : 'N/A'
    },
    {
      key: 'round',
      label: 'Round',
      sortable: true,
      render: (value: unknown) => (
        <span className={styles.roundBadge}>{String(value || 'N/A')}</span>
      )
    }
  ];

  // Row actions
  const rowActions = (cba: CBA) => {
    console.log('🔧 Rendering actions for CBA:', cba);
    console.log('🆔 CBA ID:', cba.id, 'Type:', typeof cba.id);
    
    return (
      <div className={styles.rowActions}>
        <Button
          size="sm"
          variant="secondary"
          onClick={(e) => {
            e.stopPropagation();
            console.log('✏️ Edit clicked for CBA ID:', cba.id);
            navigate(`/admin/cbas/${cba.id}/edit`);
          }}
        >
          {t('common.edit')}
        </Button>
        <Button
          size="sm"
          variant="danger"
          onClick={(e) => {
            e.stopPropagation();
            console.log('🗑️ Delete clicked for CBA ID:', cba.id);
            setDeleteDialog({ isOpen: true, cba });
          }}
        >
          {t('common.delete')}
        </Button>
      </div>
    );
  };

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
          <p className={styles.subtitle}>Manage Collective Bargaining Agreements</p>
        </div>
        <div className={styles.headerActions}>
          <Button onClick={() => navigate('/admin/cbas/new')}>
            {t('cbas.addCBA')}
          </Button>
        </div>
      </div>

      {/* Search and Filters - Single Row */}
      <div className={styles.toolbar}>
        <FormField
          type="search"
          placeholder="Search CBAs..."
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
          value={filters?.status || ''}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          placeholder="Filter by Status"
          className={styles.filterSelect}
          options={[
            { value: '', label: 'All Statuses' },
            { value: 'Signed', label: 'Signed' },
            { value: 'Ongoing', label: 'Ongoing' },
            { value: 'Not-Signed', label: 'Not-Signed' }
          ]}
        />

        <Select
          value={filters?.round || ''}
          onChange={(e) => handleFilterChange('round', e.target.value)}
          placeholder="Filter by Round"
          className={styles.filterSelect}
          options={[
            { value: '', label: 'All Rounds' },
            { value: '1st', label: '1st Round' },
            { value: '2nd', label: '2nd Round' },
            { value: '3rd', label: '3rd Round' },
            { value: '4th', label: '4th Round' }
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
          emptyMessage="No CBAs found"
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title={t('cbas.deleteCBA')}
        message="Are you sure you want to delete this CBA?"
        onConfirm={handleDelete}
        onClose={() => setDeleteDialog({ isOpen: false, cba: null })}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="danger"
      />
    </motion.div>
  );
};

export default CBAsListComplete;

