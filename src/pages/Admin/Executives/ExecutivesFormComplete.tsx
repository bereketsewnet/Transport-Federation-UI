import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  createUnionExecutive, 
  getUnions,
  Union
} from '@api/endpoints';
import { Button } from '@components/Button/Button';
import { FormField } from '@components/FormField/FormField';
import { Select } from '@components/Select/Select';
import { Loading } from '@components/Loading/Loading';
import { toast } from 'react-hot-toast';
import styles from './Executives.module.css';

interface ExecutiveFormData {
  union_id: number;
  mem_id: number;
  position: string;
  appointed_date: string;
  term_length_years: number;
}

const executiveSchema = yup.object({
  union_id: yup.number().required('Union is required').min(1, 'Please select a union'),
  mem_id: yup.number().required('Member ID is required').min(1, 'Member ID must be positive'),
  position: yup.string().required('Position is required'),
  appointed_date: yup.string().required('Appointed date is required'),
  term_length_years: yup.number().required('Term length is required').min(1, 'Must be at least 1 year').max(10, 'Cannot exceed 10 years'),
}).required();

export const ExecutivesFormComplete: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  // If edit mode, redirect to list (no update endpoint available)
  useEffect(() => {
    if (isEdit) {
      toast.error('Edit not available - no update endpoint');
      navigate('/admin/executives');
    }
  }, [isEdit, navigate]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [unions, setUnions] = useState<Union[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue
  } = useForm<ExecutiveFormData>({
    resolver: yupResolver(executiveSchema),
    defaultValues: {
      union_id: 0,
      mem_id: 0,
      position: '',
      appointed_date: new Date().toISOString().split('T')[0],
      term_length_years: 4
    }
  });

  const watchedValues = watch();
  console.log('👀 Form values:', watchedValues);
  console.log('❌ Form errors:', errors);

  // Calculate end date
  const calculateEndDate = () => {
    if (watchedValues.appointed_date && watchedValues.term_length_years) {
      const startDate = new Date(watchedValues.appointed_date);
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + (watchedValues.term_length_years || 0));
      return endDate.toISOString().split('T')[0];
    }
    return '';
  };

  // Load unions for dropdown
  useEffect(() => {
    loadUnions();
  }, []);

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
      toast.error('Failed to load unions');
    }
  };

  const onSubmit = async (data: ExecutiveFormData) => {
    console.log('🔍 Form submission started');
    console.log('📝 Form data:', data);
    console.log('❌ Form errors:', errors);
    
    try {
      setError('');
      setLoading(true);

      const executiveData = {
        union_id: Number(data.union_id),
        mem_id: Number(data.mem_id),
        position: String(data.position),
        appointed_date: new Date(data.appointed_date).toISOString(),
        term_length_years: Number(data.term_length_years)
      };

      console.log('📤 Sending data to API:', executiveData);
      console.log('📤 Data types:', {
        union_id: typeof executiveData.union_id,
        mem_id: typeof executiveData.mem_id,
        position: typeof executiveData.position,
        appointed_date: typeof executiveData.appointed_date,
        term_length_years: typeof executiveData.term_length_years
      });

      console.log('➕ Creating new executive');
      const response = await createUnionExecutive(executiveData);
      console.log('✅ Create successful:', response);
      toast.success('Executive added successfully!');

      console.log('🎉 Navigating to executives list');
      navigate('/admin/executives');
    } catch (err: any) {
      console.error('💥 Error saving executive:', err);
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

  const endDate = calculateEndDate();

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
              ? 'Update executive information' 
              : 'Add a new union executive member'
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
            <h3 className={styles.sectionTitle}>Basic Information</h3>
            
            <div className={styles.formRow}>
              <Select
                label="Union *"
                value={watchedValues.union_id?.toString() || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  console.log('🔄 Union selected:', val);
                  if (val) {
                    setValue('union_id', parseInt(val));
                  }
                }}
                error={errors.union_id?.message}
                required
                className={styles.formField}
                options={[
                  { value: '', label: 'Select Union' },
                  ...unions
                    .filter(u => u && (u.id || (u as any).union_id) && u.name_en)
                    .map(union => ({
                      value: ((union.id || (union as any).union_id)).toString(),
                      label: union.name_en
                    }))
                ]}
              />

              <FormField
                label="Member ID *"
                type="number"
                error={errors.mem_id?.message}
                required
                className={styles.formField}
                min="1"
                placeholder="e.g., 12345"
                register={register('mem_id', { valueAsNumber: true })}
              />
            </div>

            <Select
              label="Position *"
              value={watchedValues.position || ''}
              onChange={(e) => {
                const val = e.target.value;
                console.log('🔄 Position selected:', val);
                if (val) {
                  setValue('position', val);
                }
              }}
              error={errors.position?.message}
              required
              className={styles.formField}
              options={[
                { value: '', label: 'Select Position' },
                { value: 'Chairman', label: 'Chairman' },
                { value: 'Vice Chairman', label: 'Vice Chairman' },
                { value: 'Secretary', label: 'Secretary' },
                { value: 'Treasurer', label: 'Treasurer' },
                { value: 'Member', label: 'Member' }
              ]}
            />

            <div className={styles.formRow}>
              <FormField
                label="Appointed Date *"
                type="date"
                error={errors.appointed_date?.message}
                required
                className={styles.formField}
                register={register('appointed_date')}
              />
              <FormField
                label="Term Length (Years) *"
                type="number"
                error={errors.term_length_years?.message}
                required
                className={styles.formField}
                min="1"
                max="10"
                placeholder="e.g., 4"
                register={register('term_length_years', { valueAsNumber: true })}
              />
            </div>
          </div>

          {/* Term Information - Calculated & Display Only */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Term Information</h3>
            
            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label className={styles.infoLabel}>Election Duration</label>
                <div className={styles.infoValue}>
                  {watchedValues.term_length_years || 0} {watchedValues.term_length_years === 1 ? 'year' : 'years'}
                </div>
              </div>
              
              <div className={styles.formField}>
                <label className={styles.infoLabel}>Next Election Date</label>
                <div className={styles.infoValue}>
                  {endDate ? new Date(endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                </div>
              </div>
            </div>

            <div className={styles.infoBox}>
              <p>
                <strong>Note:</strong> The election duration and next election date are automatically calculated based on the appointed date and term length.
              </p>
              {endDate && (
                <p className={styles.endDateInfo}>
                  Term expires on: <strong>{new Date(endDate).toLocaleDateString()}</strong>
                </p>
              )}
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
            onClick={() => navigate('/admin/executives')} 
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

export default ExecutivesFormComplete;

