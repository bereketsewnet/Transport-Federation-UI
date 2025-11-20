import React, { useEffect, useMemo, useState } from 'react';
// import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { getArchives, deleteArchive, restoreArchive } from '@api/endpoints';
import { DataTable, Column } from '@components/DataTable/DataTable';
import { Loading } from '@components/Loading/Loading';
import { Button } from '@components/Button/Button';
import { ConfirmDialog } from '@components/ConfirmDialog/ConfirmDialog';
import { toast } from 'react-hot-toast';
import { formatDate } from '@utils/formatters';
import { FormField } from '@components/FormField/FormField';
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
  // const { t } = useTranslation();
  const [archivedMembers, setArchivedMembers] = useState<ArchivedMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; member: ArchivedMember | null }>({
    isOpen: false,
    member: null,
  });
  const [restoringId, setRestoringId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const showDeleteButton = false;

  useEffect(() => {
    fetchArchivedMembers();
  }, []);

  const fetchArchivedMembers = async () => {
    try {
      setLoading(true);
      const response = await getArchives({ per_page: 1000 });
      
      const membersData: ArchivedMember[] = (response.data.data || []).map((item: any) => ({
        id: Number(item.id),
        mem_id: item.mem_id !== undefined ? Number(item.mem_id) : undefined,
        union_id: item.union_id !== undefined ? Number(item.union_id) : undefined,
        member_code: String(item.member_code || ''),
        first_name: String(item.first_name || ''),
        father_name: String(item.father_name || ''),
        surname: String(item.surname || ''),
        resigned_date: item.resigned_date ? String(item.resigned_date) : undefined,
        reason: item.reason ? String(item.reason) : undefined,
        archived_at: item.archived_at ? String(item.archived_at) : undefined,
        registry_date: item.registry_date ? String(item.registry_date) : undefined,
      }));

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

  const handleRestore = async (member: ArchivedMember) => {
    if (!member.id) {
      return;
    }

    try {
      setRestoringId(member.id);
      const response = await restoreArchive(member.id);
      const message = response.data?.message || 'Member restored successfully';
      toast.success(message);
      await fetchArchivedMembers();
    } catch (error: any) {
      console.error('Failed to restore archived member:', error);
      const message =
        error?.response?.data?.message || 'Failed to restore archived member';
      toast.error(message);
    } finally {
      setRestoringId(null);
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
    <div className={styles.rowActions}>
      <Button
        size="sm"
        variant="secondary"
        className={styles.hiddenActionButton}
        style={{ display: 'none' }}
        onClick={() => toast.success('Edit functionality coming soon')}
      >
        Edit
      </Button>
      <Button
        size="sm"
        variant="success"
        className={styles.restoreButton}
        disabled={restoringId === member.id}
        onClick={() => handleRestore(member)}
      >
        {restoringId === member.id ? 'Restoring...' : 'Restore'}
      </Button>
      {showDeleteButton && (
        <Button 
          size="sm" 
          variant="danger" 
          onClick={() => setDeleteDialog({ isOpen: true, member })}
        >
          Delete
        </Button>
      )}
    </div>
  );

  const filteredMembers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return archivedMembers;
    }

    return archivedMembers.filter((member) => {
      const code = (member.member_code || '').toLowerCase();
      const fullName = `${member.first_name || ''} ${member.father_name || ''} ${member.surname || ''}`.toLowerCase();
      return code.includes(term) || fullName.includes(term);
    });
  }, [archivedMembers, search]);

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

        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <FormField
              type="search"
              placeholder="Search archived members by name or member code..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredMembers}
          isLoading={loading}
          emptyMessage="No archived members found"
          actions={rowActions}
        />

        <ConfirmDialog
          isOpen={deleteDialog.isOpen}
          title="Delete Archived Member"
          message={`Are you sure you want to delete archived member ${deleteDialog.member?.first_name} ${deleteDialog.member?.surname}?`}
          onConfirm={handleDelete}
          onClose={() => setDeleteDialog({ isOpen: false, member: null })}
        />
      </motion.div>
    </div>
  );
};

export default ArchivedMembers;
