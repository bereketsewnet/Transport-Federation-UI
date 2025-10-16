import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  getUnion, 
  createUnion, 
  updateUnion, 
  Union 
} from '@api/endpoints';
import { Button } from '@components/Button/Button';
import { FormField } from '@components/FormField/FormField';
import { Select } from '@components/Select/Select';
import { Loading } from '@components/Loading/Loading';
import styles from './Unions.module.css';

interface UnionFormData {
  name_en: string;
  name_am: string;
  union_code: string;
  sector: string;
  organization: string;
  established_date: string;
  terms_of_election: number;
  strategic_plan_in_place: boolean;
}

const unionSchema = yup.object({
  name_en: yup.string().required('Union name (English) is required'),
  name_am: yup.string().required('Union name (Amharic) is required'),
  union_code: yup.string().required('Union code is required'),
  sector: yup.string().required('Sector is required'),
  organization: yup.string().required('Organization is required'),
  established_date: yup.string().required('Established date is required'),
  terms_of_election: yup.number().required('Terms of election is required').min(1, 'Must be at least 1 year'),
  strategic_plan_in_place: yup.boolean().required('Strategic plan status is required'),
});

export const UnionsForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [, setUnion] = useState<Union | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch
  } = useForm<UnionFormData>({
    resolver: yupResolver(unionSchema),
    defaultValues: {
      established_date: new Date().toISOString().split('T')[0],
      terms_of_election: 4,
      strategic_plan_in_place: false
    }
  });

  // Debug: Watch form values
  const watchedValues = watch();
  console.log('👀 Form values:', watchedValues);
  console.log('❌ Form errors:', errors);

  // Load union data for editing
  useEffect(() => {
    if (isEdit && id) {
      loadUnion();
    }
  }, [isEdit, id]);

  const loadUnion = async () => {
    try {
      setLoading(true);
      const response = await getUnion(parseInt(id!));
      const unionData = response.data;
      setUnion(unionData);
      
      // Populate form with existing data
      reset({
        name_en: unionData.name_en,
        name_am: unionData.name_am,
        union_code: unionData.union_code,
        sector: unionData.sector,
        organization: unionData.organization,
        established_date: unionData.established_date?.split('T')[0] || '',
        terms_of_election: unionData.terms_of_election,
        strategic_plan_in_place: unionData.strategic_plan_in_place,
      });
    } catch (err) {
      setError(t('messages.errorLoadingData'));
      console.error('Error loading union:', err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: UnionFormData) => {
    console.log('🔍 Form submission started');
    console.log('📝 Form data:', data);
    console.log('❌ Form errors:', errors);
    console.log('⏳ Is submitting:', isSubmitting);
    
    try {
      setError('');
      setLoading(true);

      const unionData = {
        ...data,
        established_date: new Date(data.established_date).toISOString(),
      };

      console.log('📤 Sending data to API:', unionData);

      if (isEdit && id) {
        console.log('✏️ Updating union with ID:', id);
        const response = await updateUnion(parseInt(id), unionData);
        console.log('✅ Update response:', response);
      } else {
        console.log('➕ Creating new union');
        const response = await createUnion(unionData);
        console.log('✅ Create response:', response);
      }

      console.log('🎉 Success! Navigating to unions list');
      navigate('/admin/unions');
    } catch (err) {
      console.error('💥 Error saving union:', err);
      console.error('💥 Error details:', err.response?.data);
      setError(t('messages.errorSavingData'));
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
            {isEdit ? t('unions.editUnion') : t('unions.addUnion')}
          </h1>
          <p className={styles.subtitle}>
            {isEdit 
              ? t('unions.editUnionSubtitle') 
              : t('unions.addUnionSubtitle')
            }
          </p>
        </div>
        <div className={styles.headerActions}>
          <Button
            variant="secondary"
            onClick={() => navigate('/admin/unions')}
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
            <h3 className={styles.sectionTitle}>{t('unions.basicInformation')}</h3>
            
            <div className={styles.formRow}>
              <FormField
                label={t('unions.nameEn')}
                {...register('name_en')}
                error={errors.name_en?.message}
                required
                className={styles.formField}
              />
              <FormField
                label={t('unions.nameAm')}
                {...register('name_am')}
                error={errors.name_am?.message}
                required
                className={styles.formField}
              />
            </div>

            <div className={styles.formRow}>
              <FormField
                label={t('unions.code')}
                {...register('union_code')}
                error={errors.union_code?.message}
                required
                className={styles.formField}
                placeholder="e.g., TCU001"
              />
              <FormField
                label={t('unions.termsOfElection')}
                type="number"
                {...register('terms_of_election', { valueAsNumber: true })}
                error={errors.terms_of_election?.message}
                required
                className={styles.formField}
                min="1"
                max="10"
              />
            </div>

            <div className={styles.formRow}>
              <Select
                label={t('unions.sector')}
                {...register('sector')}
                error={errors.sector?.message}
                required
                className={styles.formField}
                options={[
                  { value: '', label: t('unions.selectSector') },
                  { value: 'transport', label: t('unions.sectors.transport') },
                  { value: 'communication', label: t('unions.sectors.communication') },
                  { value: 'logistics', label: t('unions.sectors.logistics') },
                  { value: 'aviation', label: t('unions.sectors.aviation') },
                  { value: 'maritime', label: t('unions.sectors.maritime') }
                ]}
              />

              <FormField
                label={t('unions.organization')}
                {...register('organization')}
                error={errors.organization?.message}
                required
                className={styles.formField}
              />
            </div>

            <FormField
              label={t('unions.establishedDate')}
              type="date"
              {...register('established_date')}
              error={errors.established_date?.message}
              required
              className={styles.formField}
            />

            <div className={styles.formRow}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  {...register('strategic_plan_in_place')}
                  className={styles.checkbox}
                />
                <span className={styles.checkboxText}>{t('unions.strategicPlan')}</span>
              </label>
            </div>
          </div>

        </div>

        {/* Form Actions */}
        <div className={styles.formActions}>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/admin/unions')}
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

export default UnionsForm;
