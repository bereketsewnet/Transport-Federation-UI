import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  getMembers, 
  deleteMember, 
  archiveMember,
  Member,
  getUnions,
  Union
} from '@api/endpoints';
import { Button } from '@components/Button/Button';
import { FormField } from '@components/FormField/FormField';
import { Select } from '@components/Select/Select';
import { ConfirmDialog } from '@components/ConfirmDialog/ConfirmDialog';
import { Loading } from '@components/Loading/Loading';
import { formatDate } from '@utils/formatters';
import { toast } from 'react-hot-toast';
import styles from './MembersList.module.css';

export const MembersListSimple: React.FC = () => {
  // const { t } = useTranslation();
  const navigate = useNavigate();
  
  // State management
  const [members, setMembers] = useState<Member[]>([]);
  const [unions, setUnions] = useState<Union[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnion, setSelectedUnion] = useState('');
  const [selectedSex, setSelectedSex] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    member: Member | null;
  }>({ isOpen: false, member: null });
  const [archiveDialog, setArchiveDialog] = useState<{
    isOpen: boolean;
    member: Member | null;
  }>({ isOpen: false, member: null });

  // Load members data
  const loadMembers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params: any = {
        page: 1,
        per_page: 100
      };

      if (searchTerm) params.q = searchTerm;
      if (selectedUnion) params.union_id = selectedUnion;
      if (selectedSex) params.sex = selectedSex;

      console.log('🔍 Loading Members with params:', params);
      const response = await getMembers(params);
      console.log('✅ Members response:', response);
      
      const membersData = response.data.data || [];
      setMembers(membersData);
    } catch (err: any) {
      console.error('💥 Error loading members:', err);
      setError('Failed to load members');
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  // Load unions for filter
  const loadUnions = async () => {
    try {
      const response = await getUnions({ per_page: 100 });
      const unionsData = response.data.data || [];
      setUnions(unionsData);
    } catch (err) {
      console.error('Error loading unions:', err);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [searchTerm, selectedUnion, selectedSex]);

  useEffect(() => {
    loadUnions();
  }, []);

  // Handle delete member
  const handleDelete = async () => {
    if (!deleteDialog.member || !deleteDialog.member.id) return;
    
    try {
      await deleteMember(deleteDialog.member.id);
      toast.success('Member deleted successfully');
      setDeleteDialog({ isOpen: false, member: null });
      await loadMembers();
    } catch (err) {
      toast.error('Failed to delete member');
      console.error('Error deleting member:', err);
    }
  };

  // Handle archive member
  const handleArchive = async () => {
    if (!archiveDialog.member || !archiveDialog.member.id) return;
    
    try {
      await archiveMember(archiveDialog.member.id, 'Member left organization');
      toast.success('Member archived successfully');
      setArchiveDialog({ isOpen: false, member: null });
      await loadMembers();
    } catch (err) {
      toast.error('Failed to archive member');
      console.error('Error archiving member:', err);
    }
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
          <h1 className={styles.title}>Members</h1>
          <p className={styles.subtitle}>Manage all federation members</p>
        </div>
        <div className={styles.headerActions}>
          <Button
            onClick={() => navigate('/admin/members/new')}
            className={styles.addButton}
          >
            Add Member
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterRow}>
          <FormField
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search members..."
            className={styles.searchBox}
          />

          <Select
            value={selectedUnion}
            onChange={(e) => setSelectedUnion(e.target.value)}
            placeholder="Filter by Union"
            className={styles.filterSelect}
            options={[
              { value: '', label: 'All Unions' },
              ...unions.filter(u => u && u.id).map((union, _idx) => ({
                value: union.id.toString(),
                label: union.name_en || 'Unknown Union'
              }))
            ]}
          />

          <Select
            value={selectedSex}
            onChange={(e) => setSelectedSex(e.target.value)}
            placeholder="Filter by Sex"
            className={styles.filterSelect}
            options={[
              { value: '', label: 'All Sexes' },
              { value: 'Male', label: 'Male' },
              { value: 'Female', label: 'Female' }
            ]}
          />

          <Button
            variant="secondary"
            onClick={() => {
              setSearchTerm('');
              setSelectedUnion('');
              setSelectedSex('');
            }}
            className={styles.resetButton}
          >
            Reset Filters
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

      {/* Members Table */}
      <div className={styles.tableContainer}>
        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <div className={styles.tableCell}>Member Code</div>
            <div className={styles.tableCell}>Name</div>
            <div className={styles.tableCell}>Sex</div>
            <div className={styles.tableCell}>Email</div>
            <div className={styles.tableCell}>Phone</div>
            <div className={styles.tableCell}>Registry Date</div>
            <div className={styles.tableCell}>Actions</div>
          </div>
          
          {members.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No members found</p>
            </div>
          ) : (
            members.filter(m => m && m.id).map((member) => (
              <div key={member.id} className={styles.tableRow}>
                <div className={styles.tableCell}>
                  {member.member_code || 'N/A'}
                </div>
                <div className={styles.tableCell}>
                  {member.first_name} {member.father_name} {member.surname || ''}
                </div>
                <div className={styles.tableCell}>
                  <span className={`${styles.badge} ${styles[member.sex?.toLowerCase() || 'unknown']}`}>
                    {member.sex || 'Unknown'}
                  </span>
                </div>
                <div className={styles.tableCell}>
                  {member.email || 'N/A'}
                </div>
                <div className={styles.tableCell}>
                  {member.phone || 'N/A'}
                </div>
                <div className={styles.tableCell}>
                  {member.registry_date ? formatDate(member.registry_date) : 'N/A'}
                </div>
                <div className={styles.tableCell}>
                  <div className={styles.rowActions}>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => navigate(`/admin/members/${member.id}`)}
                    >
                      View
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
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Member"
        message={`Are you sure you want to delete ${deleteDialog.member?.first_name} ${deleteDialog.member?.father_name}?`}
        onConfirm={handleDelete}
        onClose={() => setDeleteDialog({ isOpen: false, member: null })}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Archive Confirmation Dialog */}
      <ConfirmDialog
        isOpen={archiveDialog.isOpen}
        title="Archive Member"
        message={`Are you sure you want to archive ${archiveDialog.member?.first_name} ${archiveDialog.member?.father_name}?`}
        onConfirm={handleArchive}
        onClose={() => setArchiveDialog({ isOpen: false, member: null })}
        confirmText="Archive"
        cancelText="Cancel"
      />
    </motion.div>
  );
};

export default MembersListSimple;
