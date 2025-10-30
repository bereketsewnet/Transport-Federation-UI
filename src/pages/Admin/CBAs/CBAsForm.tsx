import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  getCBA, 
  createCBA, 
  updateCBA, 
  getUnions,
  Union
} from '@api/endpoints';
import { Button } from '@components/Button/Button';
import { FormField } from '@components/FormField/FormField';
import { TextArea } from '@components/TextArea/TextArea';
import { Select } from '@components/Select/Select';
import { Loading } from '@components/Loading/Loading';
import styles from './CBAs.module.css';

interface CBAFormData {
  union_id: number;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  status: string;
  document_url?: string;
  notes?: string;
}

const cbaSchema = yup.object({
  union_id: yup.number().required('Union is required'),
  title: yup.string().required('Title is required'),
  description: yup.string(),
  start_date: yup.string().required('Start date is required'),
  end_date: yup.string().required('End date is required'),
  status: yup.string().required('Status is required'),
  document_url: yup.string().url('Invalid document URL'),
  notes: yup.string(),
});

export const CBAsForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [unions, setUnions] = useState<Union[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch
  } = useForm<CBAFormData>({
    resolver: yupResolver(cbaSchema),
    defaultValues: {
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(new Date().getFullYear() + 3, new Date().getMonth(), new Date().getDate()).toISOString().split('T')[0],
      status: 'Signed'
    }
  });

  const startDate = watch('start_date');

  // Load unions for dropdown
  useEffect(() => {
    loadUnions();
  }, []);

  // Load CBA data for editing
  useEffect(() => {
    if (isEdit && id) {
      loadCBA();
    }
  }, [isEdit, id]);

  const loadUnions = async () => {
    try {
      const response = await getUnions({ per_page: 100 });
      setUnions(response.data.data);
    } catch (err) {
      console.error('Error loading unions:', err);
    }
  };

  const loadCBA = async () => {
    try {
      setLoading(true);
      const response = await getCBA(parseInt(id!));
      const cbaData = response.data;
      
      // Populate form with existing data
      reset({
        union_id: cbaData.union_id,
        title: cbaData.title,
        description: cbaData.description || '',
        start_date: cbaData.start_date?.split('T')[0] || '',
        end_date: cbaData.end_date?.split('T')[0] || '',
        status: cbaData.status,
        document_url: cbaData.document_url || '',
        notes: cbaData.notes || '',
      });
    } catch (err) {
      setError(t('messages.errorLoadingData'));
      console.error('Error loading CBA:', err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: CBAFormData) => {
    try {
      setError('');
      setLoading(true);

      const cbaData = {
        ...data,
        start_date: new Date(data.start_date).toISOString(),
        end_date: new Date(data.end_date).toISOString(),
      };

      if (isEdit && id) {
        await updateCBA(parseInt(id), cbaData);
      } else {
        await createCBA(cbaData);
      }

      navigate('/admin/cbas');
    } catch (err) {
      setError(t('messages.errorSavingData'));
      console.error('Error saving CBA:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate duration
  const calculateDuration = () => {
    if (startDate) {
      const start = new Date(startDate);
      const end = new Date(watch('end_date'));
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const years = Math.floor(diffDays / 365);
      const months = Math.floor((diffDays % 365) / 30);
      return `${years} years, ${months} months`;
    }
    return '';
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
            {isEdit ? t('cbas.editCBA') : t('cbas.addCBA')}
          </h1>
          <p className={styles.subtitle}>
            {isEdit 
              ? t('cbas.editCBASubtitle') 
              : t('cbas.addCBASubtitle')
            }
          </p>
        </div>
        <div className={styles.headerActions}>
          <Button
            variant="secondary"
            onClick={() => navigate('/admin/cbas')}
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
            <h3 className={styles.sectionTitle}>{t('cbas.basicInformation')}</h3>
            
            <div className={styles.formRow}>
              <Select
                label={t('cbas.union')}
                {...register('union_id', { valueAsNumber: true })}
                error={errors.union_id?.message}
                required
                className={styles.formField}
                options={[
                  { value: '', label: t('cbas.selectUnion') },
                  ...unions.map(union => ({
                    value: union.id.toString(),
                    label: union.name_en
                  }))
                ]}
              />

              <Select
                label={t('cbas.status')}
                {...register('status')}
                error={errors.status?.message}
                required
                className={styles.formField}
                options={[
                  { value: 'Signed', label: 'Signed' },
                  { value: 'Ongoing', label: 'Ongoing' },
                  { value: 'Not-Signed', label: 'Not-Signed' }
                ]}
              />
            </div>

            <FormField
              label={t('cbas.title')}
              {...register('title')}
              error={errors.title?.message}
              required
              className={styles.formField}
              placeholder={t('cbas.titlePlaceholder')}
            />

            <TextArea
              label={t('cbas.description')}
              {...register('description')}
              error={errors.description?.message}
              rows={4}
              className={styles.formField}
              placeholder={t('cbas.descriptionPlaceholder')}
            />
          </div>

          {/* Date Information */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>{t('cbas.dateInformation')}</h3>
            
            <div className={styles.formRow}>
              <FormField
                label={t('cbas.startDate')}
                type="date"
                {...register('start_date')}
                error={errors.start_date?.message}
                required
                className={styles.formField}
              />
              <FormField
                label={t('cbas.endDate')}
                type="date"
                {...register('end_date')}
                error={errors.end_date?.message}
                required
                className={styles.formField}
              />
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>{t('cbas.duration')}:</span>
                <span className={styles.infoValue}>{calculateDuration()}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>{t('cbas.expiresIn')}:</span>
                <span className={styles.infoValue}>
                  {watch('end_date') ? 
                    Math.ceil((new Date(watch('end_date')).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) + ' days' 
                    : ''
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Document Information */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>{t('cbas.documentInformation')}</h3>
            
            <FormField
              label={t('cbas.documentUrl')}
              type="url"
              {...register('document_url')}
              error={errors.document_url?.message}
              className={styles.formField}
              placeholder="https://example.com/document.pdf"
            />

            <TextArea
              label={t('cbas.notes')}
              {...register('notes')}
              error={errors.notes?.message}
              rows={3}
              className={styles.formField}
              placeholder={t('cbas.notesPlaceholder')}
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className={styles.formActions}>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/admin/cbas')}
            disabled={isSubmitting}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
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

export default CBAsForm;
