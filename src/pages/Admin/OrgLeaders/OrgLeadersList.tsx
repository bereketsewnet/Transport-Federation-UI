import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  getOrgLeaders,
  deleteOrgLeader,
  getUnions,
  OrgLeader,
  Union
} from '@api/endpoints';
import { DataTable, Column } from '@components/DataTable/DataTable';
import { Button } from '@components/Button/Button';
import { FormField } from '@components/FormField/FormField';
import { Select } from '@components/Select/Select';
import { ConfirmDialog } from '@components/ConfirmDialog/ConfirmDialog';
import { Loading } from '@components/Loading/Loading';
import { useTable } from '@hooks/useTable';
import { toast } from 'react-hot-toast';
import styles from './OrgLeaders.module.css';

type LeaderFilters = Record<string, string>;

const SECTOR_OPTIONS = [
  'Aviation',
  'Railway',
  'Urban Transport',
  'Road',
  'Maritime',
  'Communication',
] as const;

export const OrgLeadersList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [leaders, setLeaders] = useState<OrgLeader[]>([]);
  const [unions, setUnions] = useState<Union[]>([]);
  const [filters, setFilters] = useState<LeaderFilters>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    leader: OrgLeader | null;
  }>({ isOpen: false, leader: null });
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  const {
    page: currentPage,
    per_page: pageSize,
    search: searchTerm,
    sortBy,
    sortOrder,
    setPage,
    setPerPage,
    setSearch,
    setSorting,
    resetFilters: resetTableState,
  } = useTable();

  const combinedFilters = useMemo(() => {
    return {
      page: currentPage,
      per_page: pageSize,
      q: searchTerm,
      ...filters,
    };
  }, [currentPage, pageSize, searchTerm, filters]);

  const loadLeaders = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await getOrgLeaders(combinedFilters);
      const data = response.data.data || [];
      setLeaders(data);

      if (response.data.meta) {
        setTotalItems(response.data.meta.total || data.length);
        setTotalPages(
          response.data.meta.total_pages ||
            Math.max(1, Math.ceil((response.data.meta.total || data.length) / pageSize))
        );
      } else {
        setTotalItems(data.length);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('💥 Error loading organization leaders:', err);
      setError(t('messages.errorLoadingData'));
      toast.error(t('messages.errorLoadingData'));
    } finally {
      setLoading(false);
    }
  };

  const loadUnions = async () => {
    try {
      const response = await getUnions({ per_page: 500 });
      setUnions(response.data.data || []);
    } catch (err) {
      console.error('💥 Error loading unions for org leaders:', err);
    }
  };

  useEffect(() => {
    loadLeaders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combinedFilters]);

  useEffect(() => {
    loadUnions();
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteDialog.leader) return;
    try {
      await deleteOrgLeader(deleteDialog.leader.id);
      toast.success(t('messages.deleteSuccess'));
      setDeleteDialog({ isOpen: false, leader: null });
      await loadLeaders();
    } catch (err) {
      console.error('💥 Error deleting organization leader:', err);
      toast.error(t('messages.errorDeletingData'));
    }
  };

  const resetFilters = () => {
    setFilters({});
    resetTableState();
  };

  const getUnionName = (unionId: number) => {
    const union = unions.find((u) => (u.id || (u as any).union_id) === unionId);
    return union ? union.name_en : `Union #${unionId}`;
  };

  const columns: Column<OrgLeader>[] = [
    {
      key: 'full_name',
      label: t('orgLeaders.table.name'),
      render: (_value, row) => (
        <div className={styles.leaderDetails}>
          <span className={styles.leaderName}>
            {[row.title, row.first_name, row.father_name, row.surname].filter(Boolean).join(' ')}
          </span>
          <span>{row.position}</span>
        </div>
      ),
    },
    {
      key: 'union_id',
      label: t('orgLeaders.table.union'),
      render: (value) => {
        const unionId = Number(value);
        return getUnionName(unionId);
      },
      sortable: true,
    },
    {
      key: 'phone',
      label: t('orgLeaders.table.phone'),
      render: (value) => (value ? String(value) : '—'),
    },
    {
      key: 'email',
      label: t('orgLeaders.table.email'),
      render: (value) => (value ? String(value) : '—'),
    },
    {
      key: 'sector',
      label: t('orgLeaders.table.sector'),
      render: (value, row) => value || row.sector || row.union?.sector || '—',
    },
    {
      key: 'organization',
      label: t('orgLeaders.table.organization'),
      render: (value, row) => value || row.organization || row.union?.organization || '—',
    },
  ];

  const rowActions = (leader: OrgLeader) => (
    <div className={styles.rowActions}>
      <Button
        size="sm"
        variant="secondary"
        onClick={(event) => {
          event.stopPropagation();
          navigate(`/admin/org-leaders/${leader.id}/edit`);
        }}
      >
        {t('common.edit')}
      </Button>
      <Button
        size="sm"
        variant="danger"
        onClick={(event) => {
          event.stopPropagation();
          setDeleteDialog({ isOpen: true, leader });
        }}
      >
        {t('common.delete')}
      </Button>
    </div>
  );

  if (loading && leaders.length === 0) {
    return <Loading />;
  }

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>{t('orgLeaders.title')}</h1>
          <p className={styles.subtitle}>{t('orgLeaders.subtitle')}</p>
        </div>
        <div className={styles.headerActions}>
          <Link to="/admin/org-leaders/new">
            <Button size="lg">{t('orgLeaders.addLeader')}</Button>
          </Link>
        </div>
      </div>

      <div className={styles.toolbar}>
        <FormField
          type="search"
          placeholder={t('orgLeaders.searchPlaceholder')}
          value={searchTerm}
          onChange={(event) => setSearch(event.target.value)}
          className={styles.searchBox}
        />

        <Select
          value={filters.union_id || ''}
          onChange={(event) => handleFilterChange('union_id', event.target.value)}
          placeholder={t('orgLeaders.filterByUnion')}
          className={styles.filterSelect}
          options={[
            { value: '', label: t('orgLeaders.allUnions') },
            ...unions
              .filter((u) => (u.id || (u as any).union_id) && u.name_en)
              .map((union) => ({
                value: ((union.id || (union as any).union_id) as number).toString(),
                label: union.name_en,
              })),
          ]}
        />

        <Select
          value={filters.sector || ''}
          onChange={(event) => handleFilterChange('sector', event.target.value)}
          placeholder={t('orgLeaders.filterBySector')}
          className={styles.filterSelect}
          options={[
            { value: '', label: t('orgLeaders.allSectors') },
            ...SECTOR_OPTIONS.map((sector) => ({
              value: sector,
              label: sector,
            })),
          ]}
        />

        <Button variant="secondary" onClick={resetFilters} className={styles.resetButton}>
          {t('common.resetFilters')}
        </Button>
      </div>

      {error && (
        <motion.div
          className={styles.errorMessage}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.div>
      )}

      <div className={styles.tableContainer}>
        <DataTable
          data={leaders}
          columns={columns}
          actions={rowActions}
          currentPage={currentPage}
          perPage={pageSize}
          totalItems={totalItems}
          totalPages={totalPages}
          onPageChange={setPage}
          onPerPageChange={setPerPage}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={(key) => {
            const nextOrder = sortBy === key && sortOrder === 'asc' ? 'desc' : 'asc';
            setSorting(key, nextOrder);
          }}
          isLoading={loading}
          emptyMessage={t('orgLeaders.emptyState')}
        />
      </div>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title={t('orgLeaders.deleteTitle')}
        message={t('orgLeaders.deleteConfirmation')}
        onConfirm={handleDelete}
        onClose={() => setDeleteDialog({ isOpen: false, leader: null })}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="danger"
      />
    </motion.div>
  );
};

export default OrgLeadersList;

