import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { getGalleries, Gallery, deleteGallery } from '@api/endpoints';
import { DataTable, Column } from '@components/DataTable/DataTable';
import { Button } from '@components/Button/Button';
import { useTable } from '@hooks/useTable';
import { ConfirmDialog } from '@components/ConfirmDialog/ConfirmDialog';
import { toast } from 'react-hot-toast';
import styles from './Gallery.module.css';

export const AdminGalleryList: React.FC = () => {
  const { t } = useTranslation();
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { page, per_page, setPage, setPerPage } = useTable();
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; gallery: Gallery | null }>({
    isOpen: false,
    gallery: null,
  });

  useEffect(() => {
    loadGalleries();
  }, [page, per_page]);

  const loadGalleries = async () => {
    setIsLoading(true);
    try {
      const response = await getGalleries({ page, per_page });
      setGalleries(response.data.data);
      setTotalPages(response.data.meta?.total_pages || 1);
      setTotalItems(response.data.meta?.total || 0);
    } catch (error) {
      console.error('Failed to load galleries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.gallery) {
      return;
    }

    try {
      await deleteGallery(deleteDialog.gallery.id, { confirm: true });
      toast.success(t('messages.deleteSuccess') || 'Deleted successfully');
      setDeleteDialog({ isOpen: false, gallery: null });
      loadGalleries();
    } catch (error) {
      toast.error(t('messages.errorDeleting') || 'Failed to delete');
    }
  };

  const columns: Column<Gallery>[] = [
    {
      key: 'title',
      label: t('gallery.galleryTitle'),
      sortable: true,
    },
    {
      key: 'description',
      label: t('common.description'),
      render: (val) => {
        const desc = String(val || '');
        return desc.length > 80 ? desc.substring(0, 80) + '...' : desc;
      },
    },
    {
      key: 'created_at',
      label: t('common.date'),
      sortable: true,
      render: (val) => val ? new Date(val as string).toLocaleDateString() : '-',
    },
  ];

  const actions = (row: Gallery) => (
    <div className={styles.rowActions}>
      <Link to={`/admin/gallery/${row.id}/photos`}>
        <Button size="sm" variant="secondary">
          {t('gallery.photos')}
        </Button>
      </Link>
      <Link to={`/admin/gallery/${row.id}/edit`}>
        <Button size="sm" variant="secondary">
          {t('common.edit')}
        </Button>
      </Link>
      <Button
        size="sm"
        variant="danger"
        onClick={() => setDeleteDialog({ isOpen: true, gallery: row })}
      >
        {t('common.delete')}
      </Button>
    </div>
  );

  return (
    <div className={styles.container}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>{t('gallery.title')} {t('common.management')}</h1>
            <p className={styles.subtitle}>
              {t('common.manage')} {t('gallery.title').toLowerCase()}
            </p>
          </div>
          <Link to="/admin/gallery/new">
            <Button size="lg">+ {t('gallery.addGallery')}</Button>
          </Link>
        </div>

        <DataTable
          columns={columns}
          data={galleries}
          isLoading={isLoading}
          actions={actions}
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          perPage={per_page}
          onPageChange={setPage}
          onPerPageChange={setPerPage}
          emptyMessage={t('common.noData')}
        />
        <ConfirmDialog
          isOpen={deleteDialog.isOpen}
          title={t('gallery.deleteGallery') || 'Delete Gallery'}
          message={
            deleteDialog.gallery
              ? t('gallery.confirmDeleteGallery', { title: deleteDialog.gallery.title }) ||
                `Are you sure you want to delete "${deleteDialog.gallery.title}"?`
              : ''
          }
          onConfirm={handleDelete}
          onClose={() => setDeleteDialog({ isOpen: false, gallery: null })}
          confirmText={t('common.delete')}
          variant="danger"
        />
      </motion.div>
    </div>
  );
};

export default AdminGalleryList;

