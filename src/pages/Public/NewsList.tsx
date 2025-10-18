import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getNews, News } from '@api/endpoints';
import { getImageUrl } from '@api/client';
import { Loading } from '@components/Loading/Loading';
import styles from './News.module.css';

export const NewsList: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [news, setNews] = useState<News[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadNews();
  }, [currentPage]);

  const loadNews = async () => {
    setIsLoading(true);
    try {
      const response = await getNews({ is_published: true, page: currentPage, per_page: 12 });
      setNews(response.data.data);
      setTotalPages(response.data.meta?.total_pages || 1);
    } catch (error) {
      console.error('Failed to load news:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading && news.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <Loading size="lg" message={t('common.loading')} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <motion.section
        className={styles.hero}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>{t('news.title')}</h1>
          <p className={styles.heroSubtitle}>{t('news.latestNews')}</p>
        </div>
        <div className={styles.heroOverlay} />
      </motion.section>

      {/* News Grid */}
      <div className={styles.content}>
        {news.length === 0 ? (
          <div className={styles.emptyState}>
            <p>{t('common.noData')}</p>
          </div>
        ) : (
          <>
            <div className={styles.newsGrid}>
              {news.map((item, index) => (
                <motion.article
                  key={item.id}
                  className={styles.newsCard}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                >
                  {item.image_url && (
                    <div className={styles.newsCardImage}>
                      <img 
                        src={getImageUrl(item.image_url, item.is_local)} 
                        alt={item.title}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <div className={styles.newsCardContent}>
                    <div className={styles.newsDate}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(item.published_at)}
                    </div>
                    <h3 className={styles.newsTitle}>{item.title}</h3>
                    <p className={styles.newsSummary}>{item.summary}</p>
                    <Link to={`/news/${item.id}`} className={styles.newsLink}>
                      {t('news.readMore')} →
                    </Link>
                  </div>
                </motion.article>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  className={styles.paginationBtn}
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  ← {t('common.previous')}
                </button>
                <span className={styles.paginationInfo}>
                  {t('common.page')} {currentPage} {t('common.of')} {totalPages}
                </span>
                <button
                  className={styles.paginationBtn}
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  {t('common.next')} →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NewsList;

