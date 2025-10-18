import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { getNews, deleteNews, News } from '@api/endpoints';
import { getImageUrl } from '@api/client';
import { DataTable, Column } from '@components/DataTable/DataTable';
import { Button } from '@components/Button/Button';
import { ConfirmDialog } from '@components/ConfirmDialog/ConfirmDialog';
import { useTable } from '@hooks/useTable';
import styles from './News.module.css';

export const AdminNewsList: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [news, setNews] = useState<News[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { page, per_page, setPage, setPerPage } = useTable();
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    loadNews();
  }, [page, per_page]);

  const loadNews = async () => {
    setIsLoading(true);
    try {
      const response = await getNews({ page, per_page });
      setNews(response.data.data);
      setTotalPages(response.data.meta?.total_pages || 1);
      setTotalItems(response.data.meta?.total || 0);
    } catch (error) {
      console.error('Failed to load news:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteNews(deleteId);
      setDeleteId(null);
      loadNews();
    } catch (error) {
      console.error('Failed to delete news:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(i18n.language, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const columns: Column<News>[] = [
    {
      key: 'image_url',
      label: 'Image',
      render: (val, row) => {
        if (val) {
          const imageUrl = getImageUrl(val as string, row.is_local);
          return (
            <img 
              src={imageUrl} 
              alt={row.title} 
              className={styles.thumbnail}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          );
        }
        return <span className={styles.noImage}>No Image</span>;
      },
    },
    {
      key: 'title',
      label: t('news.newsTitle'),
      sortable: true,
    },
    {
      key: 'summary',
      label: t('news.summary'),
      render: (val) => {
        const summary = String(val || '');
        return summary.length > 100 ? summary.substring(0, 100) + '...' : summary;
      },
    },
    {
      key: 'published_at',
      label: t('news.publishedAt'),
      sortable: true,
      render: (val) => formatDate(val as string),
    },
    {
      key: 'is_published',
      label: t('common.status'),
      render: (val) => (
        <span className={val ? styles.badgePublished : styles.badgeDraft}>
          {val ? t('news.isPublished') : 'Draft'}
        </span>
      ),
    },
  ];

  const actions = (row: News) => (
    <div className={styles.rowActions}>
      <Link to={`/admin/news/${row.id}/edit`}>
        <Button size="sm" variant="secondary">
          {t('common.edit')}
        </Button>
      </Link>
      <Button size="sm" variant="danger" onClick={() => setDeleteId(row.id)}>
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
            <h1 className={styles.title}>{t('news.title')} {t('common.management')}</h1>
            <p className={styles.subtitle}>
              {t('common.manage')} {t('news.title').toLowerCase()}
            </p>
          </div>
          <Link to="/admin/news/new">
            <Button size="lg">+ {t('news.addNews')}</Button>
          </Link>
        </div>

        <DataTable
          columns={columns}
          data={news}
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
      </motion.div>

      <ConfirmDialog
        isOpen={deleteId !== null}
        title={t('common.confirm')}
        message={`${t('common.delete')} ${t('news.title').toLowerCase()}?`}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        onConfirm={handleDelete}
        onClose={() => setDeleteId(null)}
        variant="danger"
      />
    </div>
  );
};

export default AdminNewsList;

