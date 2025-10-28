import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { getArchives, deleteArchive } from '@api/endpoints';
import { DataTable, Column } from '@components/DataTable/DataTable';
import { Loading } from '@components/Loading/Loading';
import { Button } from '@components/Button/Button';
import { ConfirmDialog } from '@components/ConfirmDialog/ConfirmDialog';
import { toast } from 'react-hot-toast';
import { formatDate } from '@utils/formatters';
import styles from './ArchivedMembers.module.css';

interface ArchivedMember {
  id: number;
  mem_id?: number;
  union_id?: number;
  member_code: string;
  first_name: string;
  father_name: string;
  surname: string;
  resigned_date?: string;
  reason?: string;
  archived_at?: string;
  registry_date?: string;
}

export const ArchivedMembers: React.FC = () => {
  const { t } = useTranslation();
  const [archivedMembers, setArchivedMembers] = useState<ArchivedMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; member: ArchivedMember | null }>({
    isOpen: false,
    member: null,
  });

  useEffect(() => {
    fetchArchivedMembers();
  }, []);

  const fetchArchivedMembers = async () => {
    try {
      setLoading(true);
      const response = await getArchives({ per_page: 1000 });
      console.log('📊 Archived members API response:', response);
      console.log('📊 Response data:', response.data);
      
      const membersData = response.data.data || [];
      console.log('📋 Number of archived members:', membersData.length);
      
      if (membersData.length > 0) {
        console.log('📋 First archived member:', membersData[0]);
        console.log('📋 Fields in first member:', Object.keys(membersData[0]));
        console.log('📋 resigned_date value:', membersData[0].resigned_date);
        console.log('📋 archived_at value:', membersData[0].archived_at);
      }
      
      setArchivedMembers(membersData);
    } catch (error) {
      console.error('Failed to fetch archived members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.member) return;

    try {
      await deleteArchive(deleteDialog.member.id);
      toast.success('Archived member deleted successfully');
      setDeleteDialog({ isOpen: false, member: null });
      await fetchArchivedMembers();
    } catch (error) {
      console.error('Failed to delete archived member:', error);
      toast.error('Failed to delete archived member');
    }
  };

  const columns: Column<ArchivedMember>[] = [
    {
      key: 'member_code',
      label: 'Member Code',
      sortable: true,
    },
    {
      key: 'name',
      label: 'Name',
      render: (_value: unknown, member: ArchivedMember) => (
        <span>{`${member.first_name} ${member.father_name} ${member.surname}`}</span>
      ),
    },
    {
      key: 'resigned_date',
      label: 'Resigned Date',
      sortable: true,
      render: (value: unknown) => value ? formatDate(String(value)) : '-'
    },
    {
      key: 'reason',
      label: 'Reason',
      render: (value: unknown) => <span>{String(value || '-')}</span>
    },
    {
      key: 'archived_at',
      label: 'Archived Date',
      sortable: true,
      render: (value: unknown) => value ? formatDate(String(value)) : '-'
    },
  ];

  const rowActions = (member: ArchivedMember) => (
    <>
      <Button 
        size="sm" 
        variant="secondary" 
        onClick={() => toast.info('Edit functionality coming soon')}
      >
        Edit
      </Button>
      <Button 
        size="sm" 
        variant="danger" 
        onClick={() => setDeleteDialog({ isOpen: true, member })}
      >
        Delete
      </Button>
    </>
  );

  if (loading) return <Loading />;

  return (
    <div className={styles.container}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Archived Members</h1>
            <p className={styles.subtitle}>
              View archived members who have left the organization
            </p>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={archivedMembers}
          isLoading={loading}
          emptyMessage="No archived members found"
          actions={rowActions}
        />

        <ConfirmDialog
          isOpen={deleteDialog.isOpen}
          title="Delete Archived Member"
          message={`Are you sure you want to delete archived member ${deleteDialog.member?.first_name} ${deleteDialog.member?.surname}?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteDialog({ isOpen: false, member: null })}
        />
      </motion.div>
    </div>
  );
};

export default ArchivedMembers;
