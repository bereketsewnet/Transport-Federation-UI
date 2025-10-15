import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getGalleries, getPhotos, Gallery as GalleryType, Photo } from '@api/endpoints';
import { Loading } from '@components/Loading/Loading';
import styles from './Gallery.module.css';

export const Gallery: React.FC = () => {
  const { t } = useTranslation();
  const [galleries, setGalleries] = useState<GalleryType[]>([]);
  const [selectedGallery, setSelectedGallery] = useState<GalleryType | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);

  useEffect(() => {
    loadGalleries();
  }, []);

  const loadGalleries = async () => {
    setIsLoading(true);
    try {
      const response = await getGalleries({ per_page: 50 });
      setGalleries(response.data.data);
      if (response.data.data.length > 0) {
        selectGallery(response.data.data[0]);
      }
    } catch (error) {
      console.error('Failed to load galleries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectGallery = async (gallery: GalleryType) => {
    setSelectedGallery(gallery);
    setIsLoadingPhotos(true);
    try {
      const response = await getPhotos({ gallery_id: gallery.id, per_page: 100 });
      setPhotos(response.data.data);
    } catch (error) {
      console.error('Failed to load photos:', error);
      setPhotos([]);
    } finally {
      setIsLoadingPhotos(false);
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
      {/* Hero Section */}
      <motion.section
        className={styles.hero}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>{t('gallery.title')}</h1>
          <p className={styles.heroSubtitle}>
            {t('gallery.description') || 'Explore our collection of photos and moments'}
          </p>
        </div>
        <div className={styles.heroOverlay} />
      </motion.section>

      <div className={styles.content}>
        {galleries.length === 0 ? (
          <div className={styles.emptyState}>
            <p>{t('common.noData')}</p>
          </div>
        ) : (
          <>
            {/* Gallery Tabs */}
            <div className={styles.galleryTabs}>
              {galleries.map((gallery) => (
                <button
                  key={gallery.id}
                  className={`${styles.galleryTab} ${selectedGallery?.id === gallery.id ? styles.active : ''}`}
                  onClick={() => selectGallery(gallery)}
                >
                  {gallery.title}
                </button>
              ))}
            </div>

            {/* Selected Gallery Info */}
            {selectedGallery && (
              <motion.div
                className={styles.galleryInfo}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className={styles.galleryTitle}>{selectedGallery.title}</h2>
                {selectedGallery.description && (
                  <p className={styles.galleryDescription}>{selectedGallery.description}</p>
                )}
              </motion.div>
            )}

            {/* Photos Grid */}
            {isLoadingPhotos ? (
              <div className={styles.loadingPhotos}>
                <Loading message={t('common.loading')} />
              </div>
            ) : photos.length === 0 ? (
              <div className={styles.noPhotos}>
                <p>{t('gallery.noPhotos') || 'No photos in this gallery yet'}</p>
              </div>
            ) : (
              <div className={styles.photosGrid}>
                {photos.map((photo, index) => (
                  <motion.div
                    key={photo.id}
                    className={styles.photoCard}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.03 }}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <div className={styles.photoPlaceholder}>
                      {/* In production, use: <img src={`/uploads/${photo.filename}`} alt={photo.caption} /> */}
                      <div className={styles.photoIcon}>
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className={styles.photoOverlay}>
                        <p className={styles.photoCaption}>{photo.caption}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            className={styles.lightbox}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              className={styles.lightboxContent}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className={styles.lightboxClose} onClick={() => setSelectedPhoto(null)}>
                ✕
              </button>
              <div className={styles.lightboxImage}>
                {/* In production: <img src={`/uploads/${selectedPhoto.filename}`} alt={selectedPhoto.caption} /> */}
                <div className={styles.lightboxPlaceholder}>
                  <svg width="128" height="128" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className={styles.lightboxCaption}>
                <h3>{selectedPhoto.caption}</h3>
                {selectedPhoto.taken_at && (
                  <p>{new Date(selectedPhoto.taken_at).toLocaleDateString()}</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery;

