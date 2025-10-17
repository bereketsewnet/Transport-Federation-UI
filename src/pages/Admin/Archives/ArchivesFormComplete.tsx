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
  updateArchive
} from '@api/endpoints';
import { Button } from '@components/Button/Button';
import { FormField } from '@components/FormField/FormField';
import { TextArea } from '@components/TextArea/TextArea';
import { Select } from '@components/Select/Select';
import { Loading } from '@components/Loading/Loading';
import { toast } from 'react-hot-toast';
import styles from './Archives.module.css';

interface ArchiveFormData {
  title: string;
  description?: string;
  category: string;
  document_type: string;
  file_url: string;
  file_name?: string;
  is_public: boolean;
}

const archiveSchema = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string(),
  category: yup.string().required('Category is required'),
  document_type: yup.string().required('Document type is required'),
  file_url: yup.string().required('File URL is required').url('Must be a valid URL'),
  file_name: yup.string(),
  is_public: yup.boolean().default(false),
}).required();

export const ArchivesFormComplete: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue
  } = useForm<ArchiveFormData>({
    resolver: yupResolver(archiveSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      document_type: '',
      file_url: '',
      file_name: '',
      is_public: false
    }
  });

  const watchedValues = watch();
  console.log('👀 Form values:', watchedValues);
  console.log('❌ Form errors:', errors);

  // Load archive data for editing
  useEffect(() => {
    if (isEdit && id) {
      loadArchive();
    }
  }, [isEdit, id]);

  const loadArchive = async () => {
    try {
      setLoading(true);
      const archive_id = parseInt(id!);
      if (isNaN(archive_id)) {
        setError(t('messages.errorLoadingData'));
        toast.error(t('messages.errorLoadingData'));
        return;
      }
      
      console.log('🔍 Loading archive for edit, ID:', archive_id);
      const response = await getArchive(archive_id);
      console.log('✅ Archive data for edit:', response.data);
      const archiveData = response.data;
      
      // Populate form with existing data
      reset({
        title: archiveData.title || '',
        description: archiveData.description || '',
        category: archiveData.category || '',
        document_type: archiveData.document_type || '',
        file_url: archiveData.file_url || '',
        file_name: archiveData.file_name || '',
        is_public: archiveData.is_public || false,
      });
    } catch (err) {
      console.error('💥 Error loading archive:', err);
      setError(t('messages.errorLoadingData'));
      toast.error(t('messages.errorLoadingData'));
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ArchiveFormData) => {
    console.log('🔍 Form submission started');
    console.log('📝 Form data:', data);
    console.log('❌ Form errors:', errors);
    
    try {
      setError('');
      setLoading(true);

      const archiveData = {
        title: String(data.title),
        description: data.description ? String(data.description) : undefined,
        category: String(data.category),
        document_type: String(data.document_type),
        file_url: String(data.file_url),
        file_name: data.file_name ? String(data.file_name) : undefined,
        is_public: Boolean(data.is_public)
      };

      console.log('📤 Sending data to API:', archiveData);

      if (isEdit && id) {
        const archive_id = parseInt(id);
        if (isNaN(archive_id)) {
          setError(t('messages.errorSavingData'));
          toast.error(t('messages.errorSavingData'));
          return;
        }
        console.log('✏️ Updating archive with ID:', archive_id);
        const response = await updateArchive(archive_id, archiveData);
        console.log('✅ Update successful:', response);
        toast.success('Archive updated successfully!');
      } else {
        console.log('➕ Creating new archive');
        const response = await createArchive(archiveData);
        console.log('✅ Create successful:', response);
        toast.success('Archive added successfully!');
      }

      console.log('🎉 Navigating to archives list');
      navigate('/admin/archives');
    } catch (err: any) {
      console.error('💥 Error saving archive:', err);
      console.error('💥 Error response:', err.response);
      console.error('💥 Error details:', err.response?.data);
      const errorMsg = err.response?.data?.message || t('messages.errorSavingData');
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return <Loading />;
  }

  return (
    <motion.div
      className={styles.formContainer}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className={styles.formHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>
            {isEdit ? 'Edit Archive' : 'Add New Archive'}
          </h1>
          <p className={styles.subtitle}>
            {isEdit 
              ? 'Update archive information' 
              : 'Add a new document to the archive'
            }
          </p>
        </div>
        <div className={styles.headerActions}>
          <Button
            variant="secondary"
            onClick={() => navigate('/admin/archives')}
          >
            {t('common.cancel')}
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          className={styles.errorMessage}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.formGrid}>
          {/* Basic Information */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Archive Information</h3>
            
            <FormField
              label="Title *"
              error={errors.title?.message}
              required
              className={styles.formField}
              placeholder="Enter archive title"
              register={register('title')}
            />

            <TextArea
              label="Description"
              error={errors.description?.message}
              className={styles.formField}
              placeholder="Enter archive description (optional)"
              rows={4}
              register={register('description')}
            />

            <div className={styles.formRow}>
              <Select
                label="Category *"
                value={watchedValues.category || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  console.log('🔄 Category selected:', val);
                  if (val) {
                    setValue('category', val);
                  }
                }}
                error={errors.category?.message}
                required
                className={styles.formField}
                options={[
                  { value: '', label: 'Select Category' },
                  { value: 'Reports', label: 'Reports' },
                  { value: 'Minutes', label: 'Minutes' },
                  { value: 'Agreements', label: 'Agreements' },
                  { value: 'Legal', label: 'Legal Documents' },
                  { value: 'Financial', label: 'Financial Records' },
                  { value: 'Other', label: 'Other' }
                ]}
              />

              <Select
                label="Document Type *"
                value={watchedValues.document_type || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  console.log('🔄 Document type selected:', val);
                  if (val) {
                    setValue('document_type', val);
                  }
                }}
                error={errors.document_type?.message}
                required
                className={styles.formField}
                options={[
                  { value: '', label: 'Select Document Type' },
                  { value: 'PDF', label: 'PDF' },
                  { value: 'Word', label: 'Word Document' },
                  { value: 'Excel', label: 'Excel Spreadsheet' },
                  { value: 'Image', label: 'Image' },
                  { value: 'Other', label: 'Other' }
                ]}
              />
            </div>

            <div className={styles.formRow}>
              <FormField
                label="File URL *"
                type="url"
                error={errors.file_url?.message}
                required
                className={styles.formField}
                placeholder="https://example.com/file.pdf"
                register={register('file_url')}
              />

              <FormField
                label="File Name"
                error={errors.file_name?.message}
                className={styles.formField}
                placeholder="document.pdf (optional)"
                register={register('file_name')}
              />
            </div>

            <div className={styles.formField}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  {...register('is_public')}
                />
                <span className={styles.checkboxText}>
                  Make this archive public
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.25rem' }}>
                    (Public archives can be viewed by all users)
                  </span>
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className={styles.formActions}>
          <Button 
            type="submit" 
            disabled={isSubmitting || loading}
            size="lg"
          >
            {isSubmitting || loading 
              ? t('common.submitting') 
              : isEdit ? t('common.update') : t('common.create')
            }
          </Button>
          <Button 
            type="button" 
            variant="secondary" 
            onClick={() => navigate('/admin/archives')} 
            disabled={isSubmitting || loading}
            size="lg"
          >
            {t('common.cancel')}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default ArchivesFormComplete;

