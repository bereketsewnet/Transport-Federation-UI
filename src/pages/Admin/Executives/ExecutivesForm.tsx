import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  createUnionExecutive,
  updateUnionExecutive,
  getUnionExecutive,
  getUnions,
  Union
} from '@api/endpoints';
import { Button } from '@components/Button/Button';
import { FormField } from '@components/FormField/FormField';
import { Select } from '@components/Select/Select';
import { Loading } from '@components/Loading/Loading';
import styles from './Executives.module.css';

interface ExecutiveFormData {
  union_id: number;
  mem_id: number;
  position: string;
  appointed_date: string;
  term_length_years: number;
}

const executiveSchema = yup.object({
  union_id: yup.number().required('Union is required'),
  mem_id: yup.number().required('Member ID is required').min(1, 'Member ID must be positive'),
  position: yup.string().required('Position is required'),
  appointed_date: yup.string().required('Appointed date is required'),
  term_length_years: yup.number().required('Term length is required').min(1, 'Must be at least 1 year').max(10, 'Cannot exceed 10 years'),
});

export const ExecutivesForm: React.FC = () => {
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
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExecutiveFormData>({
    resolver: yupResolver(executiveSchema),
    defaultValues: {
      appointed_date: new Date().toISOString().split('T')[0],
      term_length_years: 4
    }
  });

  // Load unions for dropdown
  useEffect(() => {
    loadUnions();
  }, []);

  // Load executive data for editing
  useEffect(() => {
    if (isEdit && id) {
      loadExecutive();
    }
  }, [isEdit, id]);

  const loadUnions = async () => {
    try {
      console.log('🔄 Loading unions for form...');
      const response = await getUnions({ per_page: 1000 });
      const rawUnions = response.data.data || [];
      console.log('✅ Unions loaded:', rawUnions.length);
      console.log('📋 First union:', rawUnions[0]);
      setUnions(rawUnions);
    } catch (err) {
      console.error('💥 Error loading unions:', err);
    }
  };

  const loadExecutive = async () => {
    try {
      setLoading(true);
      const response = await getUnionExecutive(Number(id));
      const executive = response.data;
      
      // Format the date to YYYY-MM-DD for the date input
      const formattedDate = executive.appointed_date 
        ? new Date(executive.appointed_date).toISOString().split('T')[0]
        : '';
      
      // Populate form with executive data
      reset({
        union_id: executive.union_id,
        mem_id: executive.mem_id,
        position: executive.position,
        appointed_date: formattedDate,
        term_length_years: executive.term_length_years
      });
    } catch (err) {
      setError(t('messages.errorLoadingData'));
      console.error('Error loading executive:', err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ExecutiveFormData) => {
    try {
      setError('');
      setLoading(true);

      const executiveData = {
        ...data,
        appointed_date: new Date(data.appointed_date).toISOString(),
      };

      if (isEdit && id) {
        await updateUnionExecutive(Number(id), executiveData);
      } else {
        await createUnionExecutive(executiveData);
      }

      navigate('/admin/executives');
    } catch (err) {
      setError(t('messages.errorSavingData'));
      console.error('Error saving executive:', err);
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
            {isEdit ? t('executives.editExecutive') : t('executives.addExecutive')}
          </h1>
          <p className={styles.subtitle}>
            {isEdit 
              ? t('executives.editExecutiveSubtitle') 
              : t('executives.addExecutiveSubtitle')
            }
          </p>
        </div>
        <div className={styles.headerActions}>
          <Button
            variant="secondary"
            onClick={() => navigate('/admin/executives')}
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
            <h3 className={styles.sectionTitle}>{t('executives.basicInformation')}</h3>
            
            <div className={styles.formRow}>
              <Select
                label={t('executives.union')}
                {...register('union_id', { valueAsNumber: true })}
                error={errors.union_id?.message}
                required
                className={styles.formField}
                options={[
                  { value: '', label: t('executives.selectUnion') },
                  ...unions
                    .filter(u => u && (u.id || (u as any).union_id) && u.name_en)
                    .map(union => ({
                      value: ((union.id || (union as any).union_id)).toString(),
                      label: union.name_en
                    }))
                ]}
              />

              <FormField
                label={t('executives.memberId')}
                type="number"
                {...register('mem_id', { valueAsNumber: true })}
                error={errors.mem_id?.message}
                required
                className={styles.formField}
                min="1"
                placeholder="e.g., 12345"
              />
            </div>

            <Select
              label={t('executives.position')}
              {...register('position')}
              error={errors.position?.message}
              required
              className={styles.formField}
              options={[
                { value: '', label: t('executives.selectPosition') },
                { value: 'chairman', label: t('executives.positions.chairman') },
                { value: 'vice_chairman', label: t('executives.positions.viceChairman') },
                { value: 'secretary', label: t('executives.positions.secretary') },
                { value: 'treasurer', label: t('executives.positions.treasurer') },
                { value: 'member', label: t('executives.positions.member') }
              ]}
            />

            <div className={styles.formRow}>
              <FormField
                label={t('executives.appointedDate')}
                type="date"
                {...register('appointed_date')}
                error={errors.appointed_date?.message}
                required
                className={styles.formField}
              />
              <FormField
                label={t('executives.termLength')}
                type="number"
                {...register('term_length_years', { valueAsNumber: true })}
                error={errors.term_length_years?.message}
                required
                className={styles.formField}
                min="1"
                max="10"
                placeholder="e.g., 4"
              />
            </div>
          </div>

          {/* Term Information */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>{t('executives.termInformation')}</h3>
            
            <div className={styles.infoCard}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>{t('executives.termDuration')}:</span>
                <span className={styles.infoValue}>
                  {t('executives.years', { count: 4 })}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>{t('executives.nextElection')}:</span>
                <span className={styles.infoValue}>
                  {new Date(new Date().getFullYear() + 4, new Date().getMonth(), new Date().getDate()).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className={styles.formActions}>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/admin/executives')}
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

export default ExecutivesForm;
