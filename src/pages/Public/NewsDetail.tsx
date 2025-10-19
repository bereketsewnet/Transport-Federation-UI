import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getNewsItem, News } from '@api/endpoints';
import { getImageUrl } from '@api/client';
import { Loading } from '@components/Loading/Loading';
import styles from './News.module.css';

export const NewsDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [news, setNews] = useState<News | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (id) {
      loadNews(parseInt(id));
    }
  }, [id]);

  const loadNews = async (newsId: number) => {
    setIsLoading(true);
    setError(false);
    try {
      const response = await getNewsItem(newsId);
      setNews(response.data);
    } catch (err) {
      // Silently handle error
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Loading size="lg" message={t('common.loading')} />
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className={styles.errorContainer}>
        <h2>{t('messages.notFound')}</h2>
        <p>{t('messages.error')}</p>
        <button onClick={() => navigate('/news')} className={styles.backButton}>
          ← {t('common.back')}
        </button>
      </div>
    );
  }

  return (
    <div className={styles.detailContainer}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link to="/">{t('nav.home')}</Link>
        <span>/</span>
        <Link to="/news">{t('news.title')}</Link>
        <span>/</span>
        <span>{news.title}</span>
      </div>

      {/* Article */}
      <motion.article
        className={styles.article}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <header className={styles.articleHeader}>
          <div className={styles.articleMeta}>
            <div className={styles.articleDate}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(news.published_at)}
            </div>
          </div>
          <h1 className={styles.articleTitle}>{news.title}</h1>
          {news.summary && (
            <p className={styles.articleSummary}>{news.summary}</p>
          )}
        </header>

        {/* Featured Image */}
        {news.image_url && (
          <div className={styles.articleImage}>
            <img 
              src={getImageUrl(news.image_url, news.is_local)} 
              alt={news.title}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}

        <div className={styles.articleBody}>
          <div className={styles.articleContent} dangerouslySetInnerHTML={{ __html: news.body }} />
        </div>

        <footer className={styles.articleFooter}>
          <Link to="/news" className={styles.backToList}>
            ← {t('common.back')} {t('news.title')}
          </Link>
        </footer>
      </motion.article>
    </div>
  );
};

export default NewsDetail;

