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
import { toast } from 'react-hot-toast';
import styles from './Executives.module.css';

interface ExecutiveFormData {
  union_id: number;
  member_code: string;
  position: string;
  appointed_date: string;
  term_length_years: number;
}

const executiveSchema = yup.object({
  union_id: yup.number().required('Union is required').min(1, 'Please select a union'),
  member_code: yup.string().required('Member code is required'),
  position: yup.string().required('Position is required'),
  appointed_date: yup.string().required('Appointed date is required'),
  term_length_years: yup.number().required('Term length is required').min(1, 'Must be at least 1 year').max(10, 'Cannot exceed 10 years'),
}).required();

export const ExecutivesFormComplete: React.FC = () => {
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
    watch,
    setValue
  } = useForm<ExecutiveFormData>({
    resolver: yupResolver(executiveSchema),
    defaultValues: {
      union_id: 0,
      member_code: '',
      position: '',
      appointed_date: new Date().toISOString().split('T')[0],
      term_length_years: 4
    }
  });

  const watchedValues = watch();

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

  // Load executive data for editing
  useEffect(() => {
    if (isEdit && id) {
      loadExecutive();
    }
  }, [isEdit, id]);

  const loadUnions = async () => {
    try {
      const response = await getUnions({ per_page: 1000 });
      const rawUnions = response.data.data || [];
      setUnions(rawUnions);
    } catch (err) {
      toast.error('Failed to load unions');
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
        member_code: executive.member_code,
        position: executive.position,
        appointed_date: formattedDate,
        term_length_years: executive.term_length_years
      });
      
      toast.success('Executive data loaded');
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to load executive data';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ExecutiveFormData) => {
    
    try {
      setError('');
      setLoading(true);

      const executiveData = {
        union_id: Number(data.union_id),
        member_code: String(data.member_code),
        position: String(data.position),
        appointed_date: new Date(data.appointed_date).toISOString(),
        term_length_years: Number(data.term_length_years)
      };

      if (isEdit && id) {
        await updateUnionExecutive(Number(id), executiveData);
        toast.success('Executive updated successfully!');
      } else {
        await createUnionExecutive(executiveData);
        toast.success('Executive added successfully!');
      }

      navigate('/admin/executives');
    } catch (err: any) {
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
                label="Member Code *"
                type="text"
                error={errors.member_code?.message}
                required
                className={styles.formField}
                placeholder="e.g., M-008"
                register={register('member_code')}
              />
            </div>

            <Select
              label="Position *"
              value={watchedValues.position || ''}
              onChange={(e) => {
                const val = e.target.value;
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
                { value: 'Vice', label: 'Vice' },
                { value: 'General Secretary', label: 'General Secretary' },
                { value: 'Assistant General Secretary', label: 'Assistant General Secretary' },
                { value: 'Executive-Member', label: 'Executive-Member' },
                { value: 'Finance Head', label: 'Finance Head' },
                { value: 'Assistant Accountant', label: 'Assistant Accountant' },
                { value: 'Cashier', label: 'Cashier' },
                { value: "Women's Representative", label: "Women's Representative" },
                { value: 'General Audit', label: 'General Audit' },
                { value: 'Audit Secretary', label: 'Audit Secretary' },
                { value: 'Audit Member', label: 'Audit Member' }
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

