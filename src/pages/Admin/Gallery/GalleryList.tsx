import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { getGalleries, Gallery } from '@api/endpoints';
import { DataTable, Column } from '@components/DataTable/DataTable';
import { Button } from '@components/Button/Button';
import { useTable } from '@hooks/useTable';
import styles from './Gallery.module.css';

export const AdminGalleryList: React.FC = () => {
  const { t } = useTranslation();
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { page, perPage, setPage, setPerPage, totalPages, setTotalPages, totalItems, setTotalItems } = useTable();

  useEffect(() => {
    loadGalleries();
  }, [page, perPage]);

  const loadGalleries = async () => {
    setIsLoading(true);
    try {
      const response = await getGalleries({ page, per_page: perPage });
      setGalleries(response.data.data);
      setTotalPages(response.data.meta?.total_pages || 1);
      setTotalItems(response.data.meta?.total || 0);
    } catch (error) {
      console.error('Failed to load galleries:', error);
    } finally {
      setIsLoading(false);
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
          perPage={perPage}
          onPageChange={setPage}
          onPerPageChange={setPerPage}
          emptyMessage={t('common.noData')}
        />
      </motion.div>
    </div>
  );
};

export default AdminGalleryList;

