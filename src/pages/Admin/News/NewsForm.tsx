import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  getNewsItem, 
  createNews, 
  updateNews, 
  uploadNewsWithImage, 
  updateNewsWithImage, 
  createNewsFromURL 
} from '@api/endpoints';
import { getImageUrl } from '@api/client';
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
  image_url?: string;
}

type ImageSource = 'file' | 'url' | 'none';

const schema = yup.object({
  title: yup.string().trim().required('Title is required'),
  summary: yup.string().trim().required('Summary is required'),
  body: yup.string().trim().required('Body is required'),
  published_at: yup.string().required('Published date is required'),
  is_published: yup.boolean(),
  image_url: yup.string().url('Must be a valid URL').transform((value) => value || null).nullable(),
});

export const AdminNewsForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageSource, setImageSource] = useState<ImageSource>('none');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEdit = !!id;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<NewsFormData>({
    resolver: yupResolver(schema),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    defaultValues: {
      title: '',
      summary: '',
      body: '',
      published_at: new Date().toISOString().split('T')[0],
      is_published: false,
      image_url: '',
    },
  });

  const imageUrlValue = watch('image_url');

  useEffect(() => {
    if (isEdit && id) {
      loadNews(parseInt(id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadNews = async (newsId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getNewsItem(newsId);
      const news = response.data;
      
      console.log('Loaded news data:', news); // Debug log
      
      // Prepare form data
      const formData = {
        title: news.title || '',
        summary: news.summary || '',
        body: news.body || '',
        published_at: news.published_at ? news.published_at.split('T')[0] : new Date().toISOString().split('T')[0],
        is_published: Boolean(news.is_published),
        image_url: (!news.is_local && news.image_url) ? news.image_url : '',
      };
      
      console.log('Resetting form with:', formData); // Debug log
      
      // Reset the form with the loaded data
      reset(formData);
      
      // Handle existing image
      if (news.image_url) {
        const fullImageUrl = getImageUrl(news.image_url, news.is_local);
        setExistingImageUrl(fullImageUrl);
        setImagePreview(fullImageUrl);
        
        if (!news.is_local) {
          setImageSource('url');
        } else {
          setImageSource('file');
        }
      } else {
        setImageSource('none');
      }
    } catch (error: any) {
      console.error('Failed to load news:', error);
      console.error('Error details:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to load news');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only image files are allowed (jpeg, jpg, png, gif, webp)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size too large. Maximum 5MB allowed.');
      return;
    }

    setError(null);
    setSelectedFile(file);
    setRemoveImage(false);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setRemoveImage(true);
    setExistingImageUrl(null);
    setValue('image_url', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageSourceChange = (source: ImageSource) => {
    setImageSource(source);
    setError(null);
    
    if (source === 'none') {
      handleRemoveImage();
    } else if (source === 'file') {
      setValue('image_url', '');
      if (existingImageUrl && !selectedFile) {
        setImagePreview(existingImageUrl);
      }
    } else if (source === 'url') {
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  useEffect(() => {
    if (imageSource === 'url' && imageUrlValue) {
      setImagePreview(imageUrlValue);
      setRemoveImage(false);
    }
  }, [imageUrlValue, imageSource]);

  const onSubmit = async (data: NewsFormData) => {
    console.log('Form submitted with data:', data); // Debug log
    setIsSubmitting(true);
    setError(null);
    
    try {
      const payload = {
        title: data.title.trim(),
        summary: data.summary.trim(),
        body: data.body.trim(),
        published_at: new Date(data.published_at).toISOString(),
        is_published: Boolean(data.is_published),
      };

      console.log('Prepared payload:', payload); // Debug log
      console.log('Is edit mode:', isEdit, 'ID:', id); // Debug log

      if (isEdit && id) {
        // Update existing news
        if (removeImage) {
          // Remove image
          await updateNews(parseInt(id), { ...payload, remove_image: true } as any);
        } else if (selectedFile) {
          // Update with new file
          await updateNewsWithImage(parseInt(id), selectedFile, payload);
        } else if (imageSource === 'url' && data.image_url) {
          // Update with URL
          await updateNews(parseInt(id), { ...payload, image_url: data.image_url.trim() });
        } else {
          // Update without changing image
          await updateNews(parseInt(id), payload);
        }
      } else {
        // Create new news
        if (selectedFile) {
          // Create with file
          await uploadNewsWithImage(selectedFile, payload);
        } else if (imageSource === 'url' && data.image_url && data.image_url.trim()) {
          // Create with URL
          await createNewsFromURL({ ...payload, image_url: data.image_url.trim() });
        } else {
          // Create without image
          await createNews(payload);
        }
      }

      navigate('/admin/news');
    } catch (error: any) {
      console.error('Failed to save news:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save news';
      setError(errorMessage);
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

        {error && (
          <div className={styles.errorAlert}>
            {error}
          </div>
        )}

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

              {/* Image Upload Section */}
              <div className={styles.imageSection}>
                <label className={styles.label}>
                  Featured Image <span className={styles.optional}>(Optional)</span>
                </label>
                
                <div className={styles.imageSourceTabs}>
                  <button
                    type="button"
                    className={imageSource === 'none' ? styles.tabActive : styles.tab}
                    onClick={() => handleImageSourceChange('none')}
                    disabled={isSubmitting}
                  >
                    No Image
                  </button>
                  <button
                    type="button"
                    className={imageSource === 'file' ? styles.tabActive : styles.tab}
                    onClick={() => handleImageSourceChange('file')}
                    disabled={isSubmitting}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    className={imageSource === 'url' ? styles.tabActive : styles.tab}
                    onClick={() => handleImageSourceChange('url')}
                    disabled={isSubmitting}
                  >
                    Image URL
                  </button>
                </div>

                {imageSource === 'file' && (
                  <div className={styles.fileUploadSection}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleFileSelect}
                      disabled={isSubmitting}
                      className={styles.fileInput}
                    />
                    <p className={styles.helpText}>
                      Maximum file size: 5MB. Allowed formats: JPEG, PNG, GIF, WEBP
                    </p>
                  </div>
                )}

                {imageSource === 'url' && (
                  <div className={styles.urlInputSection}>
                    <FormField
                      label="Image URL"
                      {...register('image_url')}
                      error={errors.image_url?.message}
                      disabled={isSubmitting}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                )}

                {imagePreview && imageSource !== 'none' && (
                  <div className={styles.imagePreview}>
                    <img src={imagePreview} alt="Preview" className={styles.previewImage} />
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={handleRemoveImage}
                      disabled={isSubmitting}
                      className={styles.removeImageBtn}
                    >
                      Remove Image
                    </Button>
                  </div>
                )}
              </div>

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

