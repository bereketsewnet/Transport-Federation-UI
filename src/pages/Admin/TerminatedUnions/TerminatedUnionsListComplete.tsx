import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  getTerminatedUnions,
  restoreTerminatedUnion,
  updateTerminatedUnion,
  getTerminatedUnion,
  TerminatedUnion,
  getUnions,
  Union
} from '@api/endpoints';
import { DataTable, Column } from '@components/DataTable/DataTable';
import { Button } from '@components/Button/Button';
import { FormField } from '@components/FormField/FormField';
import { ConfirmDialog } from '@components/ConfirmDialog/ConfirmDialog';
import { Modal } from '@components/Modal/Modal';
import { Loading } from '@components/Loading/Loading';
import { formatDate } from '@utils/formatters';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Select } from '@components/Select/Select';
import { TextArea } from '@components/TextArea/TextArea';
import styles from './TerminatedUnions.module.css';

export const TerminatedUnionsListComplete: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // State management
  const [terminatedUnions, setTerminatedUnions] = useState<TerminatedUnion[]>([]);
  const [unions, setUnions] = useState<Union[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [restoreDialog, setRestoreDialog] = useState<{
    isOpen: boolean;
    terminatedUnion: TerminatedUnion | null;
  }>({ isOpen: false, terminatedUnion: null });
  const [restoring, setRestoring] = useState(false);
  const [editDialog, setEditDialog] = useState<{
    isOpen: boolean;
    terminatedUnion: TerminatedUnion | null;
  }>({ isOpen: false, terminatedUnion: null });
  const [editing, setEditing] = useState(false);
  const [loadingEditData, setLoadingEditData] = useState(false);

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
      };

      // Only add search query if it's not empty
      if (searchTerm && searchTerm.trim()) {
        params.q = searchTerm.trim();
      }

      console.log('📊 Loading terminated unions with params:', params);
      const response = await getTerminatedUnions(params);
      console.log('✅ Terminated unions response:', response);
      
      const data = response.data.data || [];
      console.log('📋 Terminated unions data:', data);
      console.log('📋 First terminated union:', data[0]);
      if (data[0]) {
        console.log('📋 First union termination_date:', data[0].termination_date);
        console.log('📋 First union terminated_date:', (data[0] as any).terminated_date);
      }
      
      setTerminatedUnions(data);
      
      // Update pagination info
      if (response.data.meta) {
        setTotalItems(response.data.meta.total || 0);
        setTotalPages(response.data.meta.total_pages || Math.ceil((response.data.meta.total || 0) / pageSize));
      }
    } catch (err: any) {
      console.error('💥 Error loading terminated unions:', err);
      console.error('💥 Error response:', err.response);
      console.error('💥 Error data:', err.response?.data);
      
      const errorMessage = err.response?.data?.message || err.message || t('messages.errorLoadingData');
      setError(errorMessage);
      toast.error(errorMessage);
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

  // Handle restore terminated union
  const handleRestore = async () => {
    if (!restoreDialog.terminatedUnion) return;
    
    try {
      setRestoring(true);
      console.log('♻️ Restoring terminated union:', restoreDialog.terminatedUnion.id);
      const response = await restoreTerminatedUnion(restoreDialog.terminatedUnion.id);
      console.log('✅ Restore response:', response.data);
      toast.success('Union restored successfully');
      setRestoreDialog({ isOpen: false, terminatedUnion: null });
      await loadTerminatedUnions(); // Reload data to remove restored union from list
    } catch (err: any) {
      console.error('💥 Error restoring terminated union:', err);
      const errorMsg = err.response?.data?.message || 'Failed to restore union';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setRestoring(false);
    }
  };

  // Table columns configuration
  const columns: Column<TerminatedUnion>[] = [
    {
      key: 'name_en',
      label: 'Union',
      sortable: true,
      render: (value: unknown, row: TerminatedUnion) => {
        // Try to get name from terminated union data first (backend copies all union data)
        if (row.name_en) {
          return row.name_en;
        }
        // Fallback: try to find from unions array
        const unionId = row.union_id;
        const union = unions.find(u => (u.id || (u as any).union_id) === unionId);
        if (union) {
          return union.name_en;
        }
        // Last resort: show union ID
        return `Union #${unionId}`;
      }
    },
    {
      key: 'terminated_date',
      label: 'Termination Date',
      sortable: true,
      render: (value: unknown, row: TerminatedUnion) => {
        // Check both field names (terminated_date and termination_date)
        // Backend might use either field name
        const dateValue = value || (row as any).terminated_date || row.termination_date;
        console.log('📅 Date value for row:', row.id, 'terminated_date:', (row as any).terminated_date, 'termination_date:', row.termination_date, 'value:', value);
        return dateValue ? formatDate(String(dateValue)) : '-';
      }
    },
    {
      key: 'termination_reason',
      label: 'Reason',
      sortable: true,
      render: (value: unknown) => (
        <span className={styles.reasonBadge}>{String(value || '-')}</span>
      )
    },
    {
      key: 'archived_at',
      label: 'Archived At',
      sortable: true,
      render: (value: unknown) => value ? formatDate(String(value)) : '-'
    }
  ];

  // Edit form schema
  interface EditFormData {
    union_id: number;
    termination_date: string;
    termination_reason: string;
  }

  const editSchema = yup.object({
    union_id: yup.number().required('Union is required').min(1, 'Please select a union'),
    termination_date: yup.string().required('Termination date is required'),
    termination_reason: yup.string().required('Termination reason is required'),
  });

  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
    watch: watchEdit,
    setValue: setEditValue,
    formState: { errors: editErrors, isSubmitting: isEditSubmitting },
  } = useForm<EditFormData>({
    resolver: yupResolver(editSchema),
    defaultValues: {
      union_id: 0,
      termination_date: new Date().toISOString().split('T')[0],
      termination_reason: '',
    },
  });

  const watchedEditValues = watchEdit();

  // Load terminated union data for editing
  const loadEditData = async (terminatedUnion: TerminatedUnion) => {
    try {
      setLoadingEditData(true);
      console.log('🔍 Loading terminated union for edit, ID:', terminatedUnion.id);
      console.log('📋 Terminated union data (from row):', terminatedUnion);
      
      // Fetch fresh data from API to ensure we have all fields
      const response = await getTerminatedUnion(terminatedUnion.id);
      const tuData = response.data;
      
      console.log('📋 Fetched terminated union data:', tuData);
      
      // Get union_id - check if it matches union.id or union.union_id
      const unionId = tuData.union_id;
      console.log('🔍 Union ID from terminated union:', unionId);
      
      // Get termination date - check both field names
      const terminationDate = (tuData as any).terminated_date || tuData.termination_date;
      console.log('📅 Raw termination date:', terminationDate);
      
      const formattedDate = terminationDate 
        ? (typeof terminationDate === 'string' 
            ? terminationDate.split('T')[0] 
            : new Date(terminationDate).toISOString().split('T')[0])
        : new Date().toISOString().split('T')[0];
      
      console.log('📅 Formatted termination date:', formattedDate);
      console.log('📝 Termination reason:', tuData.termination_reason);
      
      // Find the union to get the correct ID format
      const matchingUnion = unions.find(u => {
        const uId = u.id || (u as any).union_id;
        return uId === unionId;
      });
      
      console.log('🔍 Matching union found:', matchingUnion);
      console.log('🔍 Union ID to use:', matchingUnion ? (matchingUnion.id || (matchingUnion as any).union_id) : unionId);
      
      const finalUnionId = matchingUnion ? (matchingUnion.id || (matchingUnion as any).union_id) : unionId;
      
      console.log('✅ Setting form values:', {
        union_id: finalUnionId,
        termination_date: formattedDate,
        termination_reason: tuData.termination_reason
      });
      
      resetEdit({
        union_id: finalUnionId || 0,
        termination_date: formattedDate,
        termination_reason: tuData.termination_reason || '',
      });
      
      // Force update to ensure form reflects the values
      setTimeout(() => {
        setEditValue('union_id', finalUnionId || 0, { shouldValidate: false });
        setEditValue('termination_date', formattedDate, { shouldValidate: false });
        setEditValue('termination_reason', tuData.termination_reason || '', { shouldValidate: false });
      }, 100);
    } catch (err) {
      console.error('💥 Error loading terminated union for edit:', err);
      toast.error('Failed to load terminated union data');
    } finally {
      setLoadingEditData(false);
    }
  };

  // Handle edit dialog open
  const handleEditClick = (terminatedUnion: TerminatedUnion) => {
    setEditDialog({ isOpen: true, terminatedUnion });
    loadEditData(terminatedUnion);
  };

  // Handle edit form submission
  const handleEditSubmitForm = async (data: EditFormData) => {
    if (!editDialog.terminatedUnion) return;
    
    try {
      setEditing(true);
      const tuData = {
        union_id: Number(data.union_id),
        terminated_date: new Date(data.termination_date).toISOString().split('T')[0],
        termination_reason: String(data.termination_reason),
      } as any;

      console.log('📤 Updating terminated union:', editDialog.terminatedUnion.id, tuData);
      await updateTerminatedUnion(editDialog.terminatedUnion.id, tuData);
      toast.success('Terminated union updated successfully!');
      setEditDialog({ isOpen: false, terminatedUnion: null });
      await loadTerminatedUnions(); // Reload data
    } catch (err: any) {
      console.error('💥 Error updating terminated union:', err);
      const errorMsg = err.response?.data?.message || 'Failed to update terminated union';
      toast.error(errorMsg);
    } finally {
      setEditing(false);
    }
  };

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
            handleEditClick(terminatedUnion);
          }}
        >
          Edit
        </Button>
        <Button
          size="sm"
          variant="success"
          onClick={(e) => {
            e.stopPropagation();
            console.log('♻️ Restore clicked for terminated union ID:', terminatedUnion.id);
            setRestoreDialog({ isOpen: true, terminatedUnion });
          }}
        >
          Restore
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
        {/* Hidden for now - can be re-enabled later if needed */}
        {/* <div className={styles.headerActions}>
          <Button onClick={() => navigate('/admin/terminated-unions/new')}>
            Add Terminated Union
          </Button>
        </div> */}
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

      {/* Restore Confirmation Dialog */}
      <ConfirmDialog
        isOpen={restoreDialog.isOpen}
        title="Restore Union"
        message={`Are you sure you want to restore this union? It will be moved back to the active unions list.`}
        onConfirm={handleRestore}
        onClose={() => setRestoreDialog({ isOpen: false, terminatedUnion: null })}
        confirmText="Restore"
        cancelText={t('common.cancel')}
        variant="primary"
        isLoading={restoring}
      />

      {/* Edit Dialog */}
      <Modal
        isOpen={editDialog.isOpen}
        onClose={() => setEditDialog({ isOpen: false, terminatedUnion: null })}
        title="Edit Terminated Union"
        size="md"
        showCloseButton={!editing}
      >
        {loadingEditData ? (
          <Loading />
        ) : (
          <form onSubmit={handleEditSubmit(handleEditSubmitForm)} className={styles.editForm}>
            <div className={styles.editFormContent}>
              <div className={styles.formRow}>
                <div className={styles.formField}>
                  <label style={{ 
                    display: 'block',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 500,
                    color: 'var(--text)',
                    marginBottom: 'var(--spacing-2)'
                  }}>
                    Union *
                  </label>
                  <input
                    type="text"
                    value={(() => {
                      const unionId = watchedEditValues.union_id;
                      const union = unions.find(u => {
                        const uId = u.id || (u as any).union_id;
                        return uId === unionId;
                      });
                      return union ? union.name_en : `Union #${unionId}`;
                    })()}
                    disabled
                    style={{ 
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: 'var(--text-base)',
                      color: 'var(--text)',
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)',
                      cursor: 'not-allowed',
                      opacity: 0.7
                    }}
                  />
                  <input
                    type="hidden"
                    {...registerEdit('union_id')}
                  />
                </div>

                <FormField
                  label="Termination Date *"
                  type="date"
                  error={editErrors.termination_date?.message}
                  required
                  className={styles.formField}
                  register={registerEdit('termination_date')}
                />
              </div>

              <TextArea
                label="Termination Reason *"
                error={editErrors.termination_reason?.message}
                required
                className={styles.formField}
                rows={4}
                placeholder="Enter the reason for termination"
                register={registerEdit('termination_reason')}
              />
            </div>

            <div className={styles.editFormActions}>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setEditDialog({ isOpen: false, terminatedUnion: null })}
                disabled={editing || isEditSubmitting}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={editing || isEditSubmitting}
                isLoading={editing || isEditSubmitting}
              >
                {t('common.update')}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </motion.div>
  );
};

export default TerminatedUnionsListComplete;

