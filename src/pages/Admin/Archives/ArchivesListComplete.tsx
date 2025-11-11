import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  getDocuments,
  deleteDocument,
  restoreArchive,
  Document as Archive
} from '@api/endpoints';
import { DataTable, Column } from '@components/DataTable/DataTable';
import { Button } from '@components/Button/Button';
import { FormField } from '@components/FormField/FormField';
import { ConfirmDialog } from '@components/ConfirmDialog/ConfirmDialog';
import { Loading } from '@components/Loading/Loading';
import { formatDate, formatFileSize } from '@utils/formatters';
import { toast } from 'react-hot-toast';
import styles from './Archives.module.css';

export const ArchivesListComplete: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // State management
  const [archives, setArchives] = useState<Archive[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    archive: Archive | null;
  }>({ isOpen: false, archive: null });
  const [restoringId, setRestoringId] = useState<number | null>(null);

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

  // Load archives data
  const loadArchives = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params: any = {
        page: currentPage,
        per_page: pageSize,
        q: searchTerm
      };

      console.log('📊 Loading documents with params:', params);
      const response = await getDocuments(params);
      console.log('✅ Documents response:', response);
      
      const archivesData = response.data.data || [];
      console.log('📋 Documents loaded:', archivesData.length);
      console.log('📋 First document:', archivesData[0]);
      
      setArchives(archivesData);
      
      // Update pagination info
      if (response.data.meta) {
        setTotalItems(response.data.meta.total || 0);
        setTotalPages(response.data.meta.total_pages || Math.ceil((response.data.meta.total || 0) / pageSize));
      }
    } catch (err: any) {
      console.error('💥 Error loading archives:', err);
      setError(t('messages.errorLoadingData'));
      toast.error(t('messages.errorLoadingData'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArchives();
  }, [currentPage, pageSize, searchTerm]);

  // Handle delete document
  const handleDelete = async () => {
    if (!deleteDialog.archive) return;
    
    try {
      console.log('🗑️ Deleting document:', deleteDialog.archive.id);
      await deleteDocument(deleteDialog.archive.id);
      toast.success(t('messages.deleteSuccess'));
      setDeleteDialog({ isOpen: false, archive: null });
      await loadArchives(); // Reload data
    } catch (err) {
      console.error('💥 Error deleting document:', err);
      setError(t('messages.errorDeletingData'));
      toast.error(t('messages.errorDeletingData'));
    }
  };

  const handleRestore = async (archive: Archive) => {
    if (!archive?.id) {
      return;
    }

    try {
      setRestoringId(archive.id);
      console.log('♻️ Restoring archive:', archive.id);
      const response = await restoreArchive(archive.id);
      const message =
        response.data?.message ||
        t('archives.restoreSuccess');

      toast.success(message);
      await loadArchives();
    } catch (err: any) {
      console.error('💥 Error restoring archive:', err);
      toast.error(err?.response?.data?.message || t('archives.restoreError'));
    } finally {
      setRestoringId(null);
    }
  };

  // // Handle download
  // const handleDownload = (archive: Archive) => {
  //   if (archive.file_url) {
  //     window.open(archive.file_url, '_blank');
  //   }
  // };

  // Table columns configuration
  const columns: Column<Archive>[] = [
    {
      key: 'title',
      label: t('archives.title'),
      sortable: true,
      render: (value: unknown, row: Archive) => (
        <div className={styles.archiveInfo}>
          <div className={styles.archiveTitle}>{String(value || '-')}</div>
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
        <span className={styles.categoryBadge}>{String(value || '-')}</span>
      )
    },
    {
      key: 'document_type',
      label: t('archives.documentType'),
      sortable: true,
      render: (value: unknown) => (
        <span className={styles.typeBadge}>{String(value || '-')}</span>
      )
    },
    {
      key: 'file_name',
      label: t('archives.fileName'),
      render: (value: unknown, row: Archive) => (
        <div className={styles.fileInfo}>
          <div className={styles.fileName}>{String(value || '-')}</div>
          {row.file_size && (
            <div className={styles.fileSize}>{formatFileSize(row.file_size)}</div>
          )}
        </div>
      )
    },
    {
      key: 'tags',
      label: 'Tags',
      render: (value: unknown) => {
        if (Array.isArray(value) && value.length > 0) {
          return <span>{value.join(', ')}</span>;
        }
        return <span>-</span>;
      }
    },
    {
      key: 'is_public',
      label: 'Public',
      render: (value: unknown) => (
        <span className={Boolean(value) ? styles.publicBadge : styles.privateBadge}>
          {Boolean(value) ? 'Yes' : 'No'}
        </span>
      )
    },
    {
      key: 'created_at',
      label: t('archives.createdAt'),
      sortable: true,
      render: (value: unknown) => value ? formatDate(String(value)) : '-'
    }
  ];

  // Row actions
  const rowActions = (archive: Archive) => {
    console.log('🔧 Rendering actions for archive:', archive);
    console.log('🆔 Archive ID:', archive.id, 'Type:', typeof archive.id);
    
    return (
      <div className={styles.rowActions}>
        <Button
          size="sm"
          variant="secondary"
          className={styles.hiddenActionButton}
          style={{ display: 'none' }}
          onClick={(e) => {
            e.stopPropagation();
            console.log('✏️ Edit clicked for archive ID:', archive.id);
            navigate(`/admin/archives/${archive.id}/edit`);
          }}
        >
          {t('common.edit')}
        </Button>
        <Button
          size="sm"
          variant="success"
          className={styles.restoreButton}
          disabled={restoringId === archive.id}
          onClick={(e) => {
            e.stopPropagation();
            handleRestore(archive);
          }}
        >
          {restoringId === archive.id ? t('common.loading') : t('archives.restore')}
        </Button>
        <Button
          size="sm"
          variant="danger"
          onClick={(e) => {
            e.stopPropagation();
            console.log('🗑️ Delete clicked for archive ID:', archive.id);
            setDeleteDialog({ isOpen: true, archive });
          }}
        >
          {t('common.delete')}
        </Button>
      </div>
    );
  };

  if (loading && archives.length === 0) {
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
          <h1 className={styles.title}>{t('archives.title')}</h1>
          <p className={styles.subtitle}>Manage documents and files (PDFs, Reports, etc.)</p>
        </div>
        <div className={styles.headerActions}>
          <Button onClick={() => navigate('/admin/archives/new')}>
            {t('archives.addArchive')}
          </Button>
        </div>
      </div>

      {/* Search - Single Row */}
      <div className={styles.toolbar}>
        <FormField
          type="search"
          placeholder="Search archives..."
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
          data={archives}
          columns={columns}
          actions={rowActions}
          currentPage={currentPage}
          perPage={pageSize}
          totalItems={totalItems}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onPerPageChange={handlePageSizeChange}
          isLoading={loading}
          emptyMessage="No archives found"
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title={t('archives.deleteArchive')}
        message={`Are you sure you want to delete "${deleteDialog.archive?.title}"?`}
        onConfirm={handleDelete}
        onClose={() => setDeleteDialog({ isOpen: false, archive: null })}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="danger"
      />
    </motion.div>
  );
};

export default ArchivesListComplete;

