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
  Union,
  CBA
} from '@api/endpoints';
import { Button } from '@components/Button/Button';
import { FormField } from '@components/FormField/FormField';
import { Select } from '@components/Select/Select';
import { Loading } from '@components/Loading/Loading';
import { toast } from 'react-hot-toast';
import styles from './CBAs.module.css';

interface CBAFormData {
  union_id: number;
  duration_years: number;
  status: string;
  registration_date: string;
  next_end_date: string;
  round: number;
}

const cbaSchema = yup.object({
  union_id: yup.number().required('Union is required').min(1, 'Please select a union'),
  duration_years: yup.number().required('Duration is required').min(1, 'Must be at least 1 year'),
  status: yup.string().required('Status is required'),
  registration_date: yup.string().required('Registration date is required'),
  next_end_date: yup.string().required('Next end date is required'),
  round: yup.number().required('Round is required').min(1, 'Round must be at least 1'),
}).required();

export const CBAsFormComplete: React.FC = () => {
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
    watch,
    setValue
  } = useForm<CBAFormData>({
    resolver: yupResolver(cbaSchema),
    defaultValues: {
      union_id: 0,
      duration_years: 3,
      status: 'Signed',
      registration_date: new Date().toISOString().split('T')[0],
      next_end_date: '',
      round: 1
    }
  });

  const watchedValues = watch();
  console.log('👀 Form values:', watchedValues);
  console.log('❌ Form errors:', errors);

  // Calculate next end date
  const calculateNextEndDate = () => {
    if (watchedValues.registration_date && watchedValues.duration_years) {
      const startDate = new Date(watchedValues.registration_date);
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + (watchedValues.duration_years || 0));
      return endDate.toISOString().split('T')[0];
    }
    return '';
  };

  // Auto-update next_end_date when registration_date or duration changes
  useEffect(() => {
    const nextEndDate = calculateNextEndDate();
    if (nextEndDate && nextEndDate !== watchedValues.next_end_date) {
      setValue('next_end_date', nextEndDate);
    }
  }, [watchedValues.registration_date, watchedValues.duration_years]);

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

  const loadCBA = async () => {
    try {
      setLoading(true);
      const cba_id = parseInt(id!);
      if (isNaN(cba_id)) {
        setError(t('messages.errorLoadingData'));
        toast.error(t('messages.errorLoadingData'));
        return;
      }
      
      console.log('🔍 Loading CBA for edit, ID:', cba_id);
      const response = await getCBA(cba_id);
      console.log('✅ CBA data for edit:', response.data);
      const cbaData = response.data;
      
      // Populate form with existing data
      reset({
        union_id: cbaData.union_id || 0,
        duration_years: cbaData.duration_years || 3,
        status: cbaData.status || '',
        registration_date: cbaData.registration_date?.split('T')[0] || '',
        next_end_date: cbaData.next_end_date?.split('T')[0] || '',
        round: cbaData.round ? (typeof cbaData.round === 'string' ? parseInt(cbaData.round) || 1 : cbaData.round) : 1,
      });
    } catch (err) {
      console.error('💥 Error loading CBA:', err);
      setError(t('messages.errorLoadingData'));
      toast.error(t('messages.errorLoadingData'));
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: CBAFormData) => {
    console.log('🔍 Form submission started');
    console.log('📝 Form data:', data);
    console.log('❌ Form errors:', errors);
    
    try {
      setError('');
      setLoading(true);

      const cbaData: Partial<CBA> = {
        union_id: Number(data.union_id),
        duration_years: Number(data.duration_years),
        status: String(data.status),
        registration_date: new Date(data.registration_date).toISOString(),
        next_end_date: new Date(data.next_end_date).toISOString(),
        round: String(data.round)
      };

      console.log('📤 Sending data to API:', cbaData);
      console.log('📤 Data types:', {
        union_id: typeof cbaData.union_id,
        duration_years: typeof cbaData.duration_years,
        status: typeof cbaData.status,
        registration_date: typeof cbaData.registration_date,
        next_end_date: typeof cbaData.next_end_date,
        round: typeof cbaData.round
      });

      if (isEdit && id) {
        const cba_id = parseInt(id);
        if (isNaN(cba_id)) {
          setError(t('messages.errorSavingData'));
          toast.error(t('messages.errorSavingData'));
          return;
        }
        console.log('✏️ Updating CBA with ID:', cba_id);
        const response = await updateCBA(cba_id, cbaData);
        console.log('✅ Update successful:', response);
        toast.success('CBA updated successfully!');
      } else {
        console.log('➕ Creating new CBA');
        const response = await createCBA(cbaData);
        console.log('✅ Create successful:', response);
        toast.success('CBA added successfully!');
      }

      console.log('🎉 Navigating to CBAs list');
      navigate('/admin/cbas');
    } catch (err: any) {
      console.error('💥 Error saving CBA:', err);
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
            {isEdit ? 'Edit CBA' : 'Add New CBA'}
          </h1>
          <p className={styles.subtitle}>
            {isEdit 
              ? 'Update Collective Bargaining Agreement information' 
              : 'Register a new Collective Bargaining Agreement'
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
            <h3 className={styles.sectionTitle}>CBA Information</h3>
            
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
                label="Duration (Years) *"
                type="number"
                error={errors.duration_years?.message}
                required
                className={styles.formField}
                min="1"
                max="10"
                placeholder="e.g., 3"
                register={register('duration_years', { valueAsNumber: true })}
              />
            </div>

            <div className={styles.formRow}>
              <Select
                label="Status *"
                value={watchedValues.status || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  console.log('🔄 Status selected:', val);
                  if (val) {
                    setValue('status', val);
                  }
                }}
                error={errors.status?.message}
                required
                className={styles.formField}
                options={[
                  { value: '', label: 'Select Status' },
                  { value: 'Signed', label: 'Signed' },
                  { value: 'Ongoing', label: 'Ongoing' },
                  { value: 'Not-Signed', label: 'Not-Signed' }
                ]}
              />

              <div className={styles.formField}>
                <label style={{ 
                  display: 'block',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 500,
                  color: 'var(--text)',
                  marginBottom: 'var(--spacing-2)'
                }}>
                  Round *
                  {errors.round && <span style={{ color: 'var(--error)', marginLeft: '4px' }}> - {errors.round.message}</span>}
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      const currentRound = watchedValues.round || 1;
                      if (currentRound > 1) {
                        setValue('round', currentRound - 1, { shouldValidate: true });
                      }
                    }}
                    style={{ minWidth: '40px', padding: '8px' }}
                  >
                    −
                  </Button>
                  <input
                    type="number"
                    min="1"
                    value={watchedValues.round || 1}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setValue('round', val, { shouldValidate: true });
                    }}
                    style={{ 
                      flex: 1, 
                      textAlign: 'center', 
                      padding: '8px 12px',
                      fontSize: 'var(--text-base)',
                      color: 'var(--text)',
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)',
                      transition: 'all var(--transition-base)'
                    }}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      const currentRound = watchedValues.round || 1;
                      setValue('round', currentRound + 1, { shouldValidate: true });
                    }}
                    style={{ minWidth: '40px', padding: '8px' }}
                  >
                    +
                  </Button>
                </div>
                <p style={{ fontSize: '12px', color: '#666', marginTop: '4px', textAlign: 'center' }}>
                  {(() => {
                    const round = watchedValues.round || 1;
                    const getOrdinal = (n: number) => {
                      const s = ['th', 'st', 'nd', 'rd'];
                      const v = n % 100;
                      return n + (s[(v - 20) % 10] || s[v] || s[0]);
                    };
                    return `${getOrdinal(round)} Round`;
                  })()}
                </p>
              </div>
            </div>

            <div className={styles.formRow}>
              <FormField
                label="Registration Date *"
                type="date"
                error={errors.registration_date?.message}
                required
                className={styles.formField}
                register={register('registration_date')}
              />
              <FormField
                label="Next End Date *"
                type="date"
                error={errors.next_end_date?.message}
                required
                className={styles.formField}
                register={register('next_end_date')}
              />
            </div>

            <div className={styles.infoBox}>
              <p>
                <strong>Note:</strong> The Next End Date is automatically calculated based on the Registration Date and Duration.
              </p>
              {watchedValues.next_end_date && (
                <p className={styles.endDateInfo}>
                  CBA expires on: <strong>{new Date(watchedValues.next_end_date).toLocaleDateString()}</strong>
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
            onClick={() => navigate('/admin/cbas')} 
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

export default CBAsFormComplete;

