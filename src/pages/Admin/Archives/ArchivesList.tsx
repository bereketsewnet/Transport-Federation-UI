import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  getArchives,
  deleteArchive,
  restoreArchive,
  Archive,
  ArchiveFilters
} from '@api/endpoints';
import { DataTable, Column } from '@components/DataTable/DataTable';
import { Button } from '@components/Button/Button';
import { FormField } from '@components/FormField/FormField';
import { Select } from '@components/Select/Select';
import { ConfirmDialog } from '@components/ConfirmDialog/ConfirmDialog';
import { Loading } from '@components/Loading/Loading';
import { useTable } from '@hooks/useTable';
import { formatDate, formatFileSize } from '@utils/formatters';
import { toast } from 'react-hot-toast';
import styles from './Archives.module.css';

export const ArchivesList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [archives, setArchives] = useState<Archive[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    archive: Archive | null;
  }>({ isOpen: false, archive: null });
  const [restoringId, setRestoringId] = useState<number | null>(null);

  const {
    page: currentPage,
    per_page: pageSize,
    search: searchTerm,
    sortBy: sortField,
    sortOrder: sortDirection,
    setPage: handlePageChange,
    setPerPage: handlePageSizeChange,
    setSearch: handleSearch,
    setSorting: handleSort,
    resetFilters: resetTableFilters
  } = useTable();

  const [filters, setFilters] = useState<Record<string, string>>({});
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetAllFilters = () => {
    setFilters({});
    resetTableFilters();
  };

  // Load archives data
  const loadArchives = async () => {
    try {
      setLoading(true);
      setError('');

      const params: ArchiveFilters = {
        page: currentPage,
        per_page: pageSize,
        q: searchTerm,
        ...filters
      };

      if (sortField && sortDirection) {
        params.sortBy = sortField;
        params.sortOrder = sortDirection;
      }

      console.log('📊 Loading archives with params:', params);
      const response = await getArchives(params);
      console.log('✅ Archives response:', response);
      
      const archivesData = response.data.data || [];
      console.log('📋 Archives loaded:', archivesData.length, 'items');
      console.log('📋 First archive:', archivesData[0]);
      
      setArchives(archivesData);

      // Update pagination info
      if (response.data.meta) {
        setTotalItems(response.data.meta.total || 0);
        setTotalPages(response.data.meta.total_pages || Math.ceil((response.data.meta.total || 0) / pageSize));
      }
    } catch (err) {
      console.error('💥 Error loading archives:', err);
      setError(t('messages.errorLoadingData'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArchives();
  }, [currentPage, pageSize, searchTerm, sortField, sortDirection, filters]);

  const handleDelete = async (archive: Archive) => {
    if (!archive.id) return;
    try {
      setLoading(true);
      await deleteArchive(archive.id);
      setDeleteDialog({ isOpen: false, archive: null });
      loadArchives();
    } catch (err) {
      setError(t('messages.errorDeletingData'));
      console.error('Error deleting archive:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (archive: Archive) => {
    if (!archive.id) {
      return;
    }

    try {
      setRestoringId(archive.id);
      const response = await restoreArchive(archive.id);
      const message =
        response.data?.message ||
        t('archives.restoreSuccess');

      toast.success(message);
      await loadArchives();
    } catch (err: any) {
      console.error('Error restoring archive:', err);
      toast.error(err?.response?.data?.message || t('archives.restoreError'));
    } finally {
      setRestoringId(null);
    }
  };
  const handleDownload = (archive: Archive) => {
    if (archive.file_url) {
      window.open(archive.file_url, '_blank');
    }
  };

  // Table columns configuration
  const columns: Column<Archive>[] = [
    {
      key: 'title',
      label: t('archives.title'),
      sortable: true,
      render: (value: unknown, row: Archive) => (
        <div className={styles.archiveInfo}>
          <div className={styles.archiveTitle}>{String(value)}</div>
          {row.description && (
            <div className={styles.archiveDescription}>{row.description}</div>
          )}
        </div>
      )
    },
    {
      key: 'category',
      label: t('archives.category'),
      sortable: true,
      render: (value: unknown) => (
        <span className={styles.categoryBadge}>{String(value)}</span>
      )
    },
    {
      key: 'document_type',
      label: t('archives.documentType'),
      sortable: true,
      render: (value: unknown) => (
        <span className={styles.typeBadge}>{String(value)}</span>
      )
    },
    {
      key: 'file_name',
      label: t('archives.fileName'),
      render: (value: unknown, row: Archive) => (
        <div className={styles.fileInfo}>
          <div className={styles.fileName}>{String(value || 'N/A')}</div>
          {row.file_size && (
            <div className={styles.fileSize}>{formatFileSize(row.file_size)}</div>
          )}
        </div>
      )
    },
    {
      key: 'is_public',
      label: t('archives.isPublic'),
      sortable: true,
      render: (value: unknown) => (
        <span className={`${styles.visibilityBadge} ${value ? styles.public : styles.private}`}>
          {value ? t('common.public') : t('common.private')}
        </span>
      )
    },
    {
      key: 'created_at',
      label: t('archives.createdAt'),
      sortable: true,
      render: (value: unknown) => formatDate(String(value))
    }
  ];

  // Row actions
  const rowActions = (archive: Archive) => (
    <div className={styles.rowActions}>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => handleDownload(archive)}
        disabled={!archive.file_url}
      >
        {t('common.download')}
      </Button>
      <Button
        variant="secondary"
        size="sm"
        className={styles.hiddenActionButton}
        style={{ display: 'none' }}
        onClick={() => navigate(`/admin/archives/${archive.id}/edit`)}
      >
        {t('common.edit')}
      </Button>
      <Button
        variant="success"
        size="sm"
        className={styles.restoreButton}
        disabled={restoringId === archive.id}
        onClick={() => handleRestore(archive)}
      >
        {restoringId === archive.id ? t('common.loading') : t('archives.restore')}
      </Button>
      <Button
        variant="danger"
        size="sm"
        onClick={() => setDeleteDialog({ isOpen: true, archive })}
      >
        {t('common.delete')}
      </Button>
    </div>
  );

  if (loading && archives.length === 0) {
    return <Loading />;
  }

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{t('archives.title')}</h1>
          <p className={styles.subtitle}>{t('archives.subtitle')}</p>
        </div>
        <Button onClick={() => navigate('/admin/archives/new')}>
          {t('archives.addArchive')}
        </Button>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      <div className={styles.toolbar}>
        <FormField
          type="text"
          placeholder={t('archives.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className={styles.searchBox}
        />

        <div className={styles.filtersSection}>
          <Select
            value={filters?.category || ''}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            placeholder={t('archives.filterByCategory')}
            className={styles.filterSelect}
            options={[
              { value: '', label: t('archives.allCategories') },
              { value: 'legal', label: t('archives.categories.legal') },
              { value: 'financial', label: t('archives.categories.financial') },
              { value: 'meeting', label: t('archives.categories.meeting') },
              { value: 'correspondence', label: t('archives.categories.correspondence') },
              { value: 'policy', label: t('archives.categories.policy') },
              { value: 'other', label: t('archives.categories.other') }
            ]}
          />

          <Select
            value={filters?.document_type || ''}
            onChange={(e) => handleFilterChange('document_type', e.target.value)}
            placeholder={t('archives.filterByType')}
            className={styles.filterSelect}
            options={[
              { value: '', label: t('archives.allTypes') },
              { value: 'pdf', label: t('archives.types.pdf') },
              { value: 'word', label: t('archives.types.word') },
              { value: 'excel', label: t('archives.types.excel') },
              { value: 'image', label: t('archives.types.image') },
              { value: 'video', label: t('archives.types.video') },
              { value: 'audio', label: t('archives.types.audio') },
              { value: 'other', label: t('archives.types.other') }
            ]}
          />

          <Select
            value={filters?.is_public || ''}
            onChange={(e) => handleFilterChange('is_public', e.target.value)}
            placeholder={t('archives.filterByVisibility')}
            className={styles.filterSelect}
            options={[
              { value: '', label: t('archives.allVisibility') },
              { value: 'true', label: t('common.public') },
              { value: 'false', label: t('common.private') }
            ]}
          />

          <Button
            variant="secondary"
            onClick={resetAllFilters}
            className={styles.resetButton}
          >
            {t('common.resetFilters')}
          </Button>
        </div>
      </div>

      <DataTable
        data={archives}
        columns={columns}
        actions={rowActions}
        currentPage={currentPage}
        perPage={pageSize}
        totalItems={totalItems}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onPerPageChange={handlePageSizeChange}
        onSort={(key) => handleSort(key, sortDirection === 'asc' ? 'desc' : 'asc')}
        sortBy={sortField}
        sortOrder={sortDirection}
        isLoading={loading}
        emptyMessage={t('archives.noArchivesFound')}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title={t('archives.deleteArchive')}
        message={t('archives.deleteConfirmation', { title: deleteDialog.archive?.title })}
        onConfirm={() => deleteDialog.archive && handleDelete(deleteDialog.archive)}
        onClose={() => setDeleteDialog({ isOpen: false, archive: null })}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="danger"
      />
    </motion.div>
  );
};

export default ArchivesList;
