import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { createGallery } from '@api/endpoints';
import { Button } from '@components/Button/Button';
import { FormField } from '@components/FormField/FormField';
import { TextArea } from '@components/TextArea/TextArea';
import styles from './Gallery.module.css';

interface GalleryFormData {
  title: string;
  description: string;
}

const schema = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
});

export const AdminGalleryForm: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GalleryFormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: GalleryFormData) => {
    setIsSubmitting(true);
    try {
      await createGallery(data);
      navigate('/admin/gallery');
    } catch (error) {
      console.error('Failed to create gallery:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>{t('gallery.addGallery')}</h1>
            <p className={styles.subtitle}>Create a new photo gallery</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <FormField
            label={t('gallery.galleryTitle')}
            {...register('title')}
            error={errors.title?.message}
            disabled={isSubmitting}
            required
          />

          <TextArea
            label={t('common.description')}
            {...register('description')}
            error={errors.description?.message}
            disabled={isSubmitting}
            rows={4}
            required
          />

          <div className={styles.formActions}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/admin/gallery')}
              disabled={isSubmitting}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('common.loading') : t('common.create')}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminGalleryForm;

