import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { DataTable, Column } from '@components/DataTable/DataTable';
import { Button } from '@components/Button/Button';
import { FormField } from '@components/FormField/FormField';
import { ConfirmDialog } from '@components/ConfirmDialog/ConfirmDialog';
import useTable from '@hooks/useTable';
import { useExportCsv } from '@hooks/useExportCsv';
import { getMembers, deleteMember, archiveMember, Member } from '@api/endpoints';
import { formatDate } from '@utils/formatters';
import { toast } from 'react-hot-toast';
import styles from './MembersList.module.css';

export const MembersList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { exportToCsv } = useExportCsv();
  const { page, per_page, search, setPage, setPerPage, setSearch } = useTable();
  
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [archiveId, setArchiveId] = useState<number | null>(null);

  // Fetch members
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['members', { page, per_page, q: search }],
    queryFn: () => getMembers({ page, per_page, q: search }),
  });

  const members = data?.data?.data || [];
  const meta = data?.data?.meta;

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      await deleteMember(deleteId);
      toast.success(t('messages.deleteSuccess'));
      refetch();
      setDeleteId(null);
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleArchive = async () => {
    if (!archiveId) return;
    
    try {
      await archiveMember(archiveId, 'Member left organization');
      toast.success(t('messages.archiveSuccess'));
      refetch();
      setArchiveId(null);
    } catch (error) {
      console.error('Archive error:', error);
    }
  };

  const handleExport = () => {
    exportToCsv('members', members, [
      'id',
      'member_code',
      'first_name',
      'father_name',
      'surname',
      'sex',
      'email',
      'phone',
    ]);
  };

  const columns: Column<Member>[] = [
    {
      key: 'member_code',
      label: t('members.memberCode'),
      sortable: true,
    },
    {
      key: 'first_name',
      label: t('members.firstName'),
      sortable: true,
    },
    {
      key: 'father_name',
      label: t('members.fatherName'),
    },
    {
      key: 'sex',
      label: t('members.sex'),
      render: (value) => (
        <span className={styles.badge}>{value as string}</span>
      ),
    },
    {
      key: 'email',
      label: t('members.email'),
    },
    {
      key: 'phone',
      label: t('members.phone'),
    },
    {
      key: 'registry_date',
      label: t('members.registryDate'),
      render: (value) => formatDate(value as string),
    },
  ];

  const renderActions = (row: Member) => (
    <div className={styles.rowActions}>
      <Button size="sm" variant="ghost" onClick={() => navigate(`/admin/members/${row.id}`)}>
        {t('common.view')}
      </Button>
      <Button size="sm" variant="ghost" onClick={() => setArchiveId(row.id)}>
        Archive
      </Button>
      <Button size="sm" variant="danger" onClick={() => setDeleteId(row.id)}>
        {t('common.delete')}
      </Button>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{t('members.title')}</h1>
          <p className={styles.subtitle}>Manage all federation members</p>
        </div>
        <Button onClick={() => navigate('/admin/members/new')}>
          {t('members.addMember')}
        </Button>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <FormField
            type="search"
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="secondary" onClick={handleExport}>
          {t('common.export')}
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={members}
        isLoading={isLoading}
        actions={renderActions}
        currentPage={page}
        totalPages={meta?.total_pages || 1}
        totalItems={meta?.total || 0}
        perPage={per_page}
        onPageChange={setPage}
        onPerPageChange={setPerPage}
        emptyMessage="No members found"
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title={t('members.deleteMember')}
        message={t('members.deleteConfirm')}
        variant="danger"
        confirmText={t('common.delete')}
      />

      {/* Archive Confirmation */}
      <ConfirmDialog
        isOpen={!!archiveId}
        onClose={() => setArchiveId(null)}
        onConfirm={handleArchive}
        title={t('members.archiveMember')}
        message={t('members.archiveConfirm')}
        confirmText="Archive"
      />
    </div>
  );
};

export default MembersList;

