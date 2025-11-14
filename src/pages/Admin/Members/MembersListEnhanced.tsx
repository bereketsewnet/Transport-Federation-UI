import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  getMembers, 
  deleteMember, 
  archiveMember,
  Member,
  getUnions,
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
import styles from './MembersList.module.css';

export const MembersListEnhanced: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // State management
  const [members, setMembers] = useState<Member[]>([]);
  const [unions, setUnions] = useState<Union[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    member: Member | null;
  }>({ isOpen: false, member: null });
  const [archiveDialog, setArchiveDialog] = useState<{
    isOpen: boolean;
    member: Member | null;
  }>({ isOpen: false, member: null });

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

  // Load members data
  const loadMembers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page: currentPage,
        per_page: pageSize,
        q: searchTerm,
        ...filters
      };

      console.log('🔍 Loading Members with params:', params);
      const response = await getMembers(params);
      console.log('✅ Members response:', response);
      
      const membersData = response.data.data || [];
      // Filter out any invalid members
      const validMembers = membersData.filter(member => member && member.id);
      setMembers(validMembers);
      
      // Update pagination info
      if (response.data.meta) {
        setTotalItems(response.data.meta.total || 0);
        setTotalPages(response.data.meta.total_pages || Math.ceil((response.data.meta.total || 0) / pageSize));
      }
    } catch (err: any) {
      console.error('💥 Error loading members:', err);
      setError(t('messages.errorLoadingData'));
      toast.error(t('messages.errorLoadingData'));
    } finally {
      setLoading(false);
    }
  };

  // Load unions for filter
  const loadUnions = async () => {
    try {
      const response = await getUnions({ per_page: 100 });
      const unionsData = response.data.data || [];
      // Filter out any invalid unions
      const validUnions = unionsData.filter(union => union && union.id && union.name_en);
      setUnions(validUnions);
    } catch (err) {
      console.error('Error loading unions:', err);
      setUnions([]); // Set empty array on error
    }
  };

  useEffect(() => {
    loadMembers();
  }, [currentPage, pageSize, sortField, sortDirection, searchTerm, filters]);

  useEffect(() => {
    loadUnions();
  }, []);

  // Handle delete member
  const handleDelete = async () => {
    if (!deleteDialog.member || !deleteDialog.member.id) return;
    
    try {
      await deleteMember(deleteDialog.member.id);
      toast.success(t('messages.deleteSuccess'));
      setDeleteDialog({ isOpen: false, member: null });
      await loadMembers(); // Reload data
    } catch (err) {
      setError(t('messages.errorDeletingData'));
      toast.error(t('messages.errorDeletingData'));
      console.error('Error deleting member:', err);
    }
  };

  // Handle archive member
  const handleArchive = async () => {
    if (!archiveDialog.member || !archiveDialog.member.id) return;
    
    try {
      await archiveMember(archiveDialog.member.id, 'Member left organization');
      toast.success(t('messages.archiveSuccess'));
      setArchiveDialog({ isOpen: false, member: null });
      await loadMembers(); // Reload data
    } catch (err) {
      setError(t('messages.errorArchivingData'));
      toast.error(t('messages.errorArchivingData'));
      console.error('Error archiving member:', err);
    }
  };

  // Table columns configuration
  const columns = [
    {
      key: 'member_code',
      label: t('members.memberCode'),
      sortable: true,
      render: (value: unknown) => (
        <div className={styles.memberInfo}>
          <div className={styles.memberCode}>{String(value || 'N/A')}</div>
        </div>
      )
    },
    {
      key: 'first_name',
      label: t('members.name'),
      sortable: true,
      render: (_value: unknown, row: any) => (
        <div className={styles.memberName}>
          <div className={styles.fullName}>
            {row?.first_name || ''} {row?.father_name || ''} {row?.surname || ''}
          </div>
        </div>
      )
    },
    {
      key: 'sex',
      label: t('members.sex'),
      sortable: true,
      render: (value: unknown) => {
        const sexValue = String(value || 'Unknown');
        return (
          <span className={`${styles.badge} ${styles[sexValue.toLowerCase()]}`}>
            {sexValue}
          </span>
        );
      }
    },
    {
      key: 'phone',
      label: t('members.phone'),
      render: (value: unknown) => String(value || 'N/A')
    },
    {
      key: 'registry_date',
      label: t('members.registryDate'),
      sortable: true,
      render: (value: unknown) => value ? formatDate(String(value)) : 'N/A'
    }
  ];

  // Row actions
  const rowActions = (member: any) => {
    if (!member || !member.id) {
      return <div className={styles.rowActions}>Invalid member</div>;
    }
    
    return (
      <div className={styles.rowActions}>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => navigate(`/admin/members/${member.id}`)}
        >
          {t('common.view')}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setArchiveDialog({ isOpen: true, member })}
        >
          Archive
        </Button>
        <Button
          size="sm"
          variant="danger"
          onClick={() => setDeleteDialog({ isOpen: true, member })}
        >
          {t('common.delete')}
        </Button>
      </div>
    );
  };

  if (loading && members.length === 0) {
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
          <h1 className={styles.title}>{t('members.title')}</h1>
          <p className={styles.subtitle}>{t('members.subtitle')}</p>
        </div>
        <div className={styles.headerActions}>
          <Button
            onClick={() => navigate('/admin/members/new')}
            className={styles.addButton}
          >
            {t('members.addMember')}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterRow}>
          <FormField
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={t('members.searchMembers')}
            className={styles.searchBox}
          />

          <Select
            value={filters?.union_id || ''}
            onChange={(e) => handleFilterChange('union_id', e.target.value)}
            placeholder={t('members.filterByUnion')}
            className={styles.filterSelect}
            options={[
              { value: '', label: t('members.allUnions') },
              ...unions.filter(union => union && union.id).map(union => ({
                value: union.id.toString(),
                label: union.name_en || 'Unknown Union'
              }))
            ]}
          />

          <Select
            value={filters?.sex || ''}
            onChange={(e) => handleFilterChange('sex', e.target.value)}
            placeholder={t('members.filterBySex')}
            className={styles.filterSelect}
            options={[
              { value: '', label: t('members.allSexes') },
              { value: 'Male', label: t('members.male') },
              { value: 'Female', label: t('members.female') }
            ]}
          />

          <Select
            value={filters?.education || ''}
            onChange={(e) => handleFilterChange('education', e.target.value)}
            placeholder={t('members.filterByEducation')}
            className={styles.filterSelect}
            options={[
              { value: '', label: t('members.allEducation') },
              { value: 'Degree', label: 'Degree' },
              { value: 'Diploma', label: 'Diploma' },
              { value: 'Certificate', label: 'Certificate' },
              { value: 'High School', label: 'High School' }
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
          data={members.filter(member => member && member.id)}
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
          emptyMessage={t('members.noMembersFound')}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title={t('members.deleteMember')}
        message={t('members.deleteConfirmation', { name: `${deleteDialog.member?.first_name} ${deleteDialog.member?.father_name}` })}
        onConfirm={handleDelete}
        onClose={() => setDeleteDialog({ isOpen: false, member: null })}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="danger"
      />

      {/* Archive Confirmation Dialog */}
      <ConfirmDialog
        isOpen={archiveDialog.isOpen}
        title={t('members.archiveMember')}
        message={t('members.archiveConfirmation', { name: `${archiveDialog.member?.first_name} ${archiveDialog.member?.father_name}` })}
        onConfirm={handleArchive}
        onClose={() => setArchiveDialog({ isOpen: false, member: null })}
        confirmText="Archive"
        cancelText={t('common.cancel')}
      />
    </motion.div>
  );
};

export default MembersListEnhanced;
