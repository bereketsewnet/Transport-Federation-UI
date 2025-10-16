import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  getArchive,
  createArchive,
  updateArchive,
  uploadArchiveFile
} from '@api/endpoints';
import { Button } from '@components/Button/Button';
import { FormField } from '@components/FormField/FormField';
import { Select } from '@components/Select/Select';
import { TextArea } from '@components/TextArea/TextArea';
import { FileUpload } from '@components/FileUpload/FileUpload';
import { Loading } from '@components/Loading/Loading';
import { formatFileSize } from '@utils/formatters';
import styles from './Archives.module.css';

interface ArchiveFormData {
  title: string;
  description?: string;
  category: string;
  document_type: string;
  tags?: string;
  is_public: boolean;
  file_url?: string;
  file_name?: string;
  file_size?: number;
}

const archiveSchema = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string(),
  category: yup.string().required('Category is required'),
  document_type: yup.string().required('Document type is required'),
  tags: yup.string(),
  is_public: yup.boolean().required('Visibility is required'),
});

export const ArchivesForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<{
    file_url: string;
    file_name: string;
    file_size: number;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch
  } = useForm<ArchiveFormData>({
    resolver: yupResolver(archiveSchema),
    defaultValues: {
      is_public: false
    }
  });

  const watchedFileUrl = watch('file_url');

  // Load archive data for editing
  useEffect(() => {
    if (isEdit && id) {
      loadArchive();
    }
  }, [id, isEdit]);

  const loadArchive = async () => {
    try {
      setLoading(true);
      const response = await getArchive(parseInt(id!));
      const archiveData = response.data;

      // Populate form with existing data
      reset({
        title: archiveData.title,
        description: archiveData.description || '',
        category: archiveData.category,
        document_type: archiveData.document_type,
        tags: archiveData.tags?.join(', ') || '',
        is_public: archiveData.is_public,
        file_url: archiveData.file_url,
        file_name: archiveData.file_name,
        file_size: archiveData.file_size,
      });

      if (archiveData.file_url) {
        setUploadedFile({
          file_url: archiveData.file_url,
          file_name: archiveData.file_name || '',
          file_size: archiveData.file_size || 0
        });
      }
    } catch (err) {
      setError(t('messages.errorLoadingData'));
      console.error('Error loading archive:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;

    const file = files[0];
    try {
      setUploading(true);
      setUploadProgress(0);

      const response = await uploadArchiveFile(file, (progress) => {
        setUploadProgress(progress);
      });

      const fileData = response.data;
      setUploadedFile(fileData);
      setValue('file_url', fileData.file_url);
      setValue('file_name', fileData.file_name);
      setValue('file_size', fileData.file_size);
    } catch (err) {
      setError(t('fileUpload.errors.uploadFailed'));
      console.error('Error uploading file:', err);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const onSubmit = async (data: ArchiveFormData) => {
    try {
      setError('');
      setLoading(true);

      // Convert tags string to array
      const tagsArray = data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

      const submitData = {
        ...data,
        tags: tagsArray,
        file_url: uploadedFile?.file_url || data.file_url,
        file_name: uploadedFile?.file_name || data.file_name,
        file_size: uploadedFile?.file_size || data.file_size,
      };

      if (isEdit && id) {
        await updateArchive(parseInt(id), submitData);
      } else {
        await createArchive(submitData);
      }
      navigate('/admin/archives');
    } catch (err) {
      setError(t('messages.errorSavingData'));
      console.error('Error saving archive:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return <Loading />;
  }

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            {isEdit ? t('archives.editArchive') : t('archives.addArchive')}
          </h1>
          <p className={styles.subtitle}>
            {isEdit ? t('archives.editArchiveSubtitle') : t('archives.addArchiveSubtitle')}
          </p>
        </div>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.formGrid}>
          {/* Basic Information */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>{t('archives.basicInformation')}</h3>

            <FormField
              label={t('archives.title')}
              {...register('title')}
              error={errors.title?.message}
              required
              className={styles.formField}
            />

            <TextArea
              label={t('archives.description')}
              {...register('description')}
              error={errors.description?.message}
              className={styles.formField}
              rows={4}
              placeholder="Brief description of the document..."
            />

            <div className={styles.formRow}>
              <Select
                label={t('archives.category')}
                {...register('category')}
                error={errors.category?.message}
                required
                className={styles.formField}
                options={[
                  { value: '', label: t('archives.selectCategory') },
                  { value: 'legal', label: t('archives.categories.legal') },
                  { value: 'financial', label: t('archives.categories.financial') },
                  { value: 'meeting', label: t('archives.categories.meeting') },
                  { value: 'correspondence', label: t('archives.categories.correspondence') },
                  { value: 'policy', label: t('archives.categories.policy') },
                  { value: 'other', label: t('archives.categories.other') }
                ]}
              />

              <Select
                label={t('archives.documentType')}
                {...register('document_type')}
                error={errors.document_type?.message}
                required
                className={styles.formField}
                options={[
                  { value: '', label: t('archives.selectType') },
                  { value: 'pdf', label: t('archives.types.pdf') },
                  { value: 'word', label: t('archives.types.word') },
                  { value: 'excel', label: t('archives.types.excel') },
                  { value: 'image', label: t('archives.types.image') },
                  { value: 'video', label: t('archives.types.video') },
                  { value: 'audio', label: t('archives.types.audio') },
                  { value: 'other', label: t('archives.types.other') }
                ]}
              />
            </div>

            <FormField
              label={t('archives.tags')}
              {...register('tags')}
              error={errors.tags?.message}
              className={styles.formField}
              placeholder="Enter tags separated by commas (e.g., important, legal, 2024)"
            />

            <div className={styles.formRow}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  {...register('is_public')}
                  className={styles.checkbox}
                />
                <span className={styles.checkboxText}>{t('archives.isPublic')}</span>
              </label>
            </div>
          </div>

          {/* File Information */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>{t('archives.fileInformation')}</h3>

            {!isEdit || !watchedFileUrl ? (
              <div className={styles.fileUploadSection}>
                <FileUpload
                  onUpload={handleFileUpload}
                  maxSize={50}
                  maxFiles={1}
                  accept="*/*"
                />
                {uploading && (
                  <div className={styles.uploadProgress}>
                    <div className={styles.progressBar}>
                      <div 
                        className={styles.progressFill} 
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <span className={styles.progressText}>
                      {t('common.uploading')}... {uploadProgress}%
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.existingFile}>
                <div className={styles.fileInfo}>
                  <h4 className={styles.fileName}>{uploadedFile?.file_name}</h4>
                  <p className={styles.fileSize}>
                    {uploadedFile?.file_size ? formatFileSize(uploadedFile.file_size) : 'N/A'}
                  </p>
                </div>
                <div className={styles.fileActions}>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => window.open(uploadedFile?.file_url, '_blank')}
                  >
                    {t('common.download')}
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      setUploadedFile(null);
                      setValue('file_url', '');
                      setValue('file_name', '');
                      setValue('file_size', 0);
                    }}
                  >
                    {t('common.remove')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className={styles.formActions}>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/admin/archives')}
            disabled={isSubmitting}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || uploading}
            isLoading={isSubmitting}
          >
            {isSubmitting
              ? t('common.saving')
              : (isEdit ? t('common.update') : t('common.create'))
            }
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default ArchivesForm;
