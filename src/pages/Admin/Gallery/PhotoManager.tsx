import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { getPhotos, uploadPhoto, createPhotoFromURL, Photo } from '@api/endpoints';
import { getImageUrl } from '@api/client';
import { Button } from '@components/Button/Button';
import { FormField } from '@components/FormField/FormField';
import { Loading } from '@components/Loading/Loading';
import { toast } from 'react-hot-toast';
import styles from './Gallery.module.css';

type UploadMethod = 'file' | 'url';

export const PhotoManager: React.FC = () => {
  const { galleryId } = useParams<{ galleryId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<UploadMethod>('file');
  
  // Form state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [takenAt, setTakenAt] = useState(new Date().toISOString().split('T')[0]);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  useEffect(() => {
    if (galleryId) {
      loadPhotos();
    }
  }, [galleryId]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

  const loadPhotos = async () => {
    setIsLoading(true);
    try {
      const response = await getPhotos({ gallery_id: parseInt(galleryId!), per_page: 100 });
      setPhotos(response.data.data);
    } catch (error) {
      console.error('Failed to load photos:', error);
      toast.error('Failed to load photos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      
      // Create preview
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
      const preview = URL.createObjectURL(file);
      setFilePreview(preview);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setImageUrl('');
    setCaption('');
    setTakenAt(new Date().toISOString().split('T')[0]);
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
      setFilePreview(null);
    }
    // Reset file input
    const fileInput = document.getElementById('photoFile') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (uploadMethod === 'file' && !selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }
    
    if (uploadMethod === 'url' && !imageUrl) {
      toast.error('Please enter an image URL');
      return;
    }

    setIsSubmitting(true);
    try {
      if (uploadMethod === 'file' && selectedFile) {
        console.log('📤 Uploading file:', selectedFile.name);
        await uploadPhoto(selectedFile, parseInt(galleryId!), caption, takenAt);
        toast.success('Photo uploaded successfully!');
      } else if (uploadMethod === 'url') {
        console.log('📤 Adding photo from URL:', imageUrl);
        await createPhotoFromURL({
          gallery_id: parseInt(galleryId!),
          image_url: imageUrl,
          caption,
          taken_at: takenAt
        });
        toast.success('Photo added successfully!');
      }
      
      resetForm();
      await loadPhotos();
    } catch (error: any) {
      console.error('Failed to add photo:', error);
      const errorMsg = error.response?.data?.message || 'Failed to add photo';
      toast.error(errorMsg);
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
            <h1 className={styles.title}>Photo Manager</h1>
            <p className={styles.subtitle}>Add and manage photos in this gallery</p>
          </div>
          <Button variant="secondary" onClick={() => navigate('/admin/gallery')}>
            ← {t('common.back')}
          </Button>
        </div>

        {/* Add Photo Form */}
        <form onSubmit={handleSubmit} className={styles.photoForm}>
          <div className={styles.photoFormHeader}>
            <h3>Add New Photo</h3>
            
            {/* Upload Method Toggle */}
            <div className={styles.uploadMethodToggle}>
              <button
                type="button"
                className={uploadMethod === 'file' ? styles.toggleActive : styles.toggleInactive}
                onClick={() => setUploadMethod('file')}
              >
                📁 Upload File
              </button>
              <button
                type="button"
                className={uploadMethod === 'url' ? styles.toggleActive : styles.toggleInactive}
                onClick={() => setUploadMethod('url')}
              >
                🔗 Add from URL
              </button>
            </div>
          </div>

          <div className={styles.photoFormContent}>
            {/* File Upload Section */}
            {uploadMethod === 'file' && (
              <div className={styles.fileUploadSection}>
                <div className={styles.fileInputWrapper}>
                  <label htmlFor="photoFile" className={styles.fileInputLabel}>
                    {selectedFile ? (
                      <div className={styles.fileSelected}>
                        <span>✓ {selectedFile.name}</span>
                        <span className={styles.fileSize}>
                          ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                    ) : (
                      <div className={styles.filePrompt}>
                        <span>📷 Click to select an image file</span>
                        <span className={styles.fileHint}>
                          Max 5MB • JPG, PNG, GIF, WEBP
                        </span>
                      </div>
                    )}
                  </label>
                  <input
                    id="photoFile"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isSubmitting}
                    className={styles.fileInput}
                  />
                </div>
                
                {/* Image Preview */}
                {filePreview && (
                  <div className={styles.imagePreview}>
                    <img src={filePreview} alt="Preview" />
                  </div>
                )}
              </div>
            )}

            {/* URL Input Section */}
            {uploadMethod === 'url' && (
              <div className={styles.urlInputSection}>
                <FormField
                  label="Image URL *"
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  disabled={isSubmitting}
                  required
                />
                {imageUrl && (
                  <div className={styles.urlPreview}>
                    <p className={styles.urlPreviewLabel}>Preview:</p>
                    <img 
                      src={imageUrl} 
                      alt="URL Preview" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                      onLoad={(e) => {
                        (e.target as HTMLImageElement).style.display = 'block';
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Common Fields */}
            <div className={styles.commonFields}>
              <FormField
                label="Caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Photo caption or description"
                disabled={isSubmitting}
              />

              <FormField
                label="Taken Date"
                type="date"
                value={takenAt}
                onChange={(e) => setTakenAt(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {/* Submit Button */}
            <div className={styles.formActions}>
              <Button 
                type="button" 
                variant="secondary"
                onClick={resetForm}
                disabled={isSubmitting}
              >
                Clear
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Uploading...' : 'Add Photo'}
              </Button>
            </div>
          </div>
        </form>

        {/* Photos Grid */}
        <div className={styles.photosSection}>
          <h3>Photos ({photos.length})</h3>
          {photos.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No photos yet. Add your first photo above.</p>
            </div>
          ) : (
            <div className={styles.photosGrid}>
              {photos.map((photo) => {
                const imageUrl = photo.image_url || getImageUrl(photo.filename, photo.is_local);
                
                return (
                  <motion.div
                    key={photo.id}
                    className={styles.photoCard}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className={styles.photoImageContainer}>
                      <img 
                        src={imageUrl} 
                        alt={photo.caption || 'Photo'} 
                        className={styles.photoImage}
                        onError={(e) => {
                          // Fallback to placeholder if image fails to load
                          e.currentTarget.style.display = 'none';
                          const placeholder = e.currentTarget.nextElementSibling;
                          if (placeholder) {
                            (placeholder as HTMLElement).style.display = 'flex';
                          }
                        }}
                      />
                      <div className={styles.photoPlaceholder} style={{ display: 'none' }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    <div className={styles.photoInfo}>
                      {photo.caption && <p className={styles.photoCaption}>{photo.caption}</p>}
                      <p className={styles.photoDate}>
                        {new Date(photo.taken_at).toLocaleDateString()}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PhotoManager;
