import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { getPhotos, createPhoto, Photo } from '@api/endpoints';
import { Button } from '@components/Button/Button';
import { FormField } from '@components/FormField/FormField';
import { Loading } from '@components/Loading/Loading';
import styles from './Gallery.module.css';

interface PhotoFormData {
  filename: string;
  caption: string;
  taken_at: string;
}

export const PhotoManager: React.FC = () => {
  const { galleryId } = useParams<{ galleryId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PhotoFormData>({
    defaultValues: {
      filename: '',
      caption: '',
      taken_at: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    if (galleryId) {
      loadPhotos();
    }
  }, [galleryId]);

  const loadPhotos = async () => {
    setIsLoading(true);
    try {
      const response = await getPhotos({ gallery_id: parseInt(galleryId!), per_page: 100 });
      setPhotos(response.data.data);
    } catch (error) {
      console.error('Failed to load photos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: PhotoFormData) => {
    setIsSubmitting(true);
    try {
      await createPhoto({
        gallery_id: parseInt(galleryId!),
        ...data,
      });
      reset();
      loadPhotos();
    } catch (error) {
      console.error('Failed to add photo:', error);
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
            <h1 className={styles.title}>{t('gallery.photos')} Manager</h1>
            <p className={styles.subtitle}>Add and manage photos in this gallery</p>
          </div>
          <Button variant="secondary" onClick={() => navigate('/admin/gallery')}>
            ← {t('common.back')}
          </Button>
        </div>

        {/* Add Photo Form */}
        <form onSubmit={handleSubmit(onSubmit)} className={styles.photoForm}>
          <h3>Add New Photo</h3>
          <div className={styles.photoFormGrid}>
            <FormField
              label={t('gallery.filename') || 'Filename'}
              {...register('filename', { required: 'Filename is required' })}
              error={errors.filename?.message}
              disabled={isSubmitting}
              placeholder="photo-01.jpg"
              required
            />

            <FormField
              label={t('gallery.caption')}
              {...register('caption', { required: 'Caption is required' })}
              error={errors.caption?.message}
              disabled={isSubmitting}
              required
            />

            <FormField
              label={t('gallery.takenAt')}
              type="date"
              {...register('taken_at', { required: 'Date is required' })}
              error={errors.taken_at?.message}
              disabled={isSubmitting}
              required
            />

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('common.loading') : t('gallery.addPhoto')}
            </Button>
          </div>
        </form>

        {/* Photos Grid */}
        <div className={styles.photosSection}>
          <h3>{t('gallery.photos')} ({photos.length})</h3>
          {photos.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No photos yet. Add your first photo above.</p>
            </div>
          ) : (
            <div className={styles.photosGrid}>
              {photos.map((photo) => (
                <motion.div
                  key={photo.id}
                  className={styles.photoCard}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className={styles.photoPlaceholder}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className={styles.photoInfo}>
                    <p className={styles.photoFilename}>{photo.filename}</p>
                    <p className={styles.photoCaption}>{photo.caption}</p>
                    <p className={styles.photoDate}>
                      {new Date(photo.taken_at).toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PhotoManager;

