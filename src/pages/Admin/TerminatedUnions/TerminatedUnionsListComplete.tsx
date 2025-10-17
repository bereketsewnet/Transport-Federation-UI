import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  getTerminatedUnions,
  deleteTerminatedUnion,
  TerminatedUnion,
  getUnions,
  Union
} from '@api/endpoints';
import { DataTable, Column } from '@components/DataTable/DataTable';
import { Button } from '@components/Button/Button';
import { FormField } from '@components/FormField/FormField';
import { ConfirmDialog } from '@components/ConfirmDialog/ConfirmDialog';
import { Loading } from '@components/Loading/Loading';
import { formatDate } from '@utils/formatters';
import { toast } from 'react-hot-toast';
import styles from './TerminatedUnions.module.css';

export const TerminatedUnionsListComplete: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // State management
  const [terminatedUnions, setTerminatedUnions] = useState<TerminatedUnion[]>([]);
  const [unions, setUnions] = useState<Union[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    terminatedUnion: TerminatedUnion | null;
  }>({ isOpen: false, terminatedUnion: null });

  // Filter and pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

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

  const resetFilters = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Load terminated unions data
  const loadTerminatedUnions = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params: any = {
        page: currentPage,
        per_page: pageSize,
        q: searchTerm
      };

      console.log('📊 Loading terminated unions with params:', params);
      const response = await getTerminatedUnions(params);
      console.log('✅ Terminated unions response:', response);
      
      const data = response.data.data || [];
      console.log('📋 Terminated unions loaded:', data.length);
      console.log('📋 First terminated union:', data[0]);
      
      setTerminatedUnions(data);
      
      // Update pagination info
      if (response.data.meta) {
        setTotalItems(response.data.meta.total || 0);
        setTotalPages(response.data.meta.total_pages || Math.ceil((response.data.meta.total || 0) / pageSize));
      }
    } catch (err: any) {
      console.error('💥 Error loading terminated unions:', err);
      setError(t('messages.errorLoadingData'));
      toast.error(t('messages.errorLoadingData'));
    } finally {
      setLoading(false);
    }
  };

  // Load unions for reference
  const loadUnions = async () => {
    try {
      console.log('🔄 Loading unions for reference...');
      const response = await getUnions({ per_page: 1000 });
      const rawUnions = response.data.data || [];
      console.log('✅ Unions loaded:', rawUnions.length);
      setUnions(rawUnions);
    } catch (err) {
      console.error('💥 Error loading unions:', err);
    }
  };

  useEffect(() => {
    loadTerminatedUnions();
  }, [currentPage, pageSize, searchTerm]);

  useEffect(() => {
    loadUnions();
  }, []);

  // Handle delete terminated union
  const handleDelete = async () => {
    if (!deleteDialog.terminatedUnion) return;
    
    try {
      console.log('🗑️ Deleting terminated union:', deleteDialog.terminatedUnion.id);
      await deleteTerminatedUnion(deleteDialog.terminatedUnion.id);
      toast.success(t('messages.deleteSuccess'));
      setDeleteDialog({ isOpen: false, terminatedUnion: null });
      await loadTerminatedUnions(); // Reload data
    } catch (err) {
      console.error('💥 Error deleting terminated union:', err);
      setError(t('messages.errorDeletingData'));
      toast.error(t('messages.errorDeletingData'));
    }
  };

  // Table columns configuration
  const columns: Column<TerminatedUnion>[] = [
    {
      key: 'union_id',
      label: 'Union',
      sortable: true,
      render: (value: unknown, row: TerminatedUnion) => {
        const unionId = Number(value);
        const union = unions.find(u => (u.id || (u as any).union_id) === unionId);
        return union ? union.name_en : `Union #${unionId}`;
      }
    },
    {
      key: 'termination_date',
      label: 'Termination Date',
      sortable: true,
      render: (value: unknown) => value ? formatDate(String(value)) : 'N/A'
    },
    {
      key: 'termination_reason',
      label: 'Reason',
      sortable: true,
      render: (value: unknown) => (
        <span className={styles.reasonBadge}>{String(value || 'N/A')}</span>
      )
    },
    {
      key: 'notes',
      label: 'Notes',
      render: (value: unknown) => (
        <div className={styles.notes}>
          {value ? String(value).substring(0, 100) + (String(value).length > 100 ? '...' : '') : 'No notes'}
        </div>
      )
    },
    {
      key: 'created_at',
      label: 'Archived At',
      sortable: true,
      render: (value: unknown) => value ? formatDate(String(value)) : 'N/A'
    }
  ];

  // Row actions
  const rowActions = (terminatedUnion: TerminatedUnion) => {
    console.log('🔧 Rendering actions for terminated union:', terminatedUnion);
    console.log('🆔 Terminated Union ID:', terminatedUnion.id, 'Type:', typeof terminatedUnion.id);
    
    return (
      <div className={styles.rowActions}>
        <Button
          size="sm"
          variant="secondary"
          onClick={(e) => {
            e.stopPropagation();
            console.log('✏️ Edit clicked for terminated union ID:', terminatedUnion.id);
            navigate(`/admin/terminated-unions/${terminatedUnion.id}/edit`);
          }}
        >
          {t('common.edit')}
        </Button>
        <Button
          size="sm"
          variant="danger"
          onClick={(e) => {
            e.stopPropagation();
            console.log('🗑️ Delete clicked for terminated union ID:', terminatedUnion.id);
            setDeleteDialog({ isOpen: true, terminatedUnion });
          }}
        >
          {t('common.delete')}
        </Button>
      </div>
    );
  };

  if (loading && terminatedUnions.length === 0) {
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
          <h1 className={styles.title}>Terminated Unions</h1>
          <p className={styles.subtitle}>Manage terminated union records</p>
        </div>
        <div className={styles.headerActions}>
          <Button onClick={() => navigate('/admin/terminated-unions/new')}>
            Add Terminated Union
          </Button>
        </div>
      </div>

      {/* Search - Single Row */}
      <div className={styles.toolbar}>
        <FormField
          type="search"
          placeholder="Search terminated unions..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className={styles.searchBox}
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
          data={terminatedUnions}
          columns={columns}
          actions={rowActions}
          currentPage={currentPage}
          perPage={pageSize}
          totalItems={totalItems}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onPerPageChange={handlePageSizeChange}
          isLoading={loading}
          emptyMessage="No terminated unions found"
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Terminated Union"
        message="Are you sure you want to delete this terminated union record?"
        onConfirm={handleDelete}
        onClose={() => setDeleteDialog({ isOpen: false, terminatedUnion: null })}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="danger"
      />
    </motion.div>
  );
};

export default TerminatedUnionsListComplete;

