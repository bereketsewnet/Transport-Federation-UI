import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { getNewsItem, createNews, updateNews, News } from '@api/endpoints';
import { Button } from '@components/Button/Button';
import { FormField } from '@components/FormField/FormField';
import { TextArea } from '@components/TextArea/TextArea';
import { Loading } from '@components/Loading/Loading';
import styles from './News.module.css';

interface NewsFormData {
  title: string;
  summary: string;
  body: string;
  published_at: string;
  is_published: boolean;
}

const schema = yup.object({
  title: yup.string().required('Title is required'),
  summary: yup.string().required('Summary is required'),
  body: yup.string().required('Body is required'),
  published_at: yup.string().required('Published date is required'),
  is_published: yup.boolean(),
});

export const AdminNewsForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = !!id;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<NewsFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      summary: '',
      body: '',
      published_at: new Date().toISOString().split('T')[0],
      is_published: false,
    },
  });

  useEffect(() => {
    if (isEdit && id) {
      loadNews(parseInt(id));
    }
  }, [id, isEdit]);

  const loadNews = async (newsId: number) => {
    setIsLoading(true);
    try {
      const response = await getNewsItem(newsId);
      const news = response.data;
      setValue('title', news.title);
      setValue('summary', news.summary);
      setValue('body', news.body);
      setValue('published_at', news.published_at.split('T')[0]);
      setValue('is_published', news.is_published);
    } catch (error) {
      console.error('Failed to load news:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: NewsFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        published_at: new Date(data.published_at).toISOString(),
      };

      if (isEdit && id) {
        await updateNews(parseInt(id), payload);
      } else {
        await createNews(payload);
      }

      navigate('/admin/news');
    } catch (error) {
      console.error('Failed to save news:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Loading size="lg" message={t('common.loading')} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>
              {isEdit ? t('news.editNews') : t('news.addNews')}
            </h1>
            <p className={styles.subtitle}>
              {isEdit ? 'Update news article' : 'Create a new news article'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.formSection}>
              <FormField
                label={t('news.newsTitle')}
                {...register('title')}
                error={errors.title?.message}
                disabled={isSubmitting}
                required
              />

              <FormField
                label={t('news.summary')}
                {...register('summary')}
                error={errors.summary?.message}
                disabled={isSubmitting}
                required
              />

              <TextArea
                label={t('news.body')}
                {...register('body')}
                error={errors.body?.message}
                disabled={isSubmitting}
                rows={12}
                required
                placeholder="Enter the full article content here..."
              />

              <div className={styles.formRow}>
                <FormField
                  label={t('news.publishedAt')}
                  type="date"
                  {...register('published_at')}
                  error={errors.published_at?.message}
                  disabled={isSubmitting}
                  required
                />

                <div className={styles.checkboxField}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      {...register('is_published')}
                      disabled={isSubmitting}
                      className={styles.checkbox}
                    />
                    <span>{t('news.isPublished')}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.formActions}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/admin/news')}
              disabled={isSubmitting}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('common.loading') : isEdit ? t('common.update') : t('common.create')}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminNewsForm;

