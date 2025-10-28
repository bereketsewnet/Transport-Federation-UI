import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  getTerminatedUnion, 
  createTerminatedUnion, 
  updateTerminatedUnion,
  getUnions,
  Union
} from '@api/endpoints';
import { Button } from '@components/Button/Button';
import { FormField } from '@components/FormField/FormField';
import { TextArea } from '@components/TextArea/TextArea';
import { Select } from '@components/Select/Select';
import { Loading } from '@components/Loading/Loading';
import { toast } from 'react-hot-toast';
import styles from './TerminatedUnions.module.css';

interface TerminatedUnionFormData {
  union_id: number;
  terminated_date: string;
  termination_reason: string;
}

const terminatedUnionSchema = yup.object({
  union_id: yup.number().required('Union is required').min(1, 'Please select a union'),
  terminated_date: yup.string().required('Termination date is required'),
  termination_reason: yup.string().required('Termination reason is required'),
  notes: yup.string(),
}).required();

export const TerminatedUnionsFormComplete: React.FC = () => {
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
  } = useForm<TerminatedUnionFormData>({
    resolver: yupResolver(terminatedUnionSchema),
    defaultValues: {
      union_id: 0,
      terminated_date: new Date().toISOString().split('T')[0],
      termination_reason: ''
    }
  });

  const watchedValues = watch();
  console.log('👀 Form values:', watchedValues);
  console.log('❌ Form errors:', errors);

  // Load unions for dropdown
  useEffect(() => {
    loadUnions();
  }, []);

  // Load terminated union data for editing
  useEffect(() => {
    if (isEdit && id) {
      loadTerminatedUnion();
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

  const loadTerminatedUnion = async () => {
    try {
      setLoading(true);
      const tu_id = parseInt(id!);
      if (isNaN(tu_id)) {
        setError(t('messages.errorLoadingData'));
        toast.error(t('messages.errorLoadingData'));
        return;
      }
      
      console.log('🔍 Loading terminated union for edit, ID:', tu_id);
      const response = await getTerminatedUnion(tu_id);
      console.log('✅ Terminated union data for edit:', response.data);
      const tuData = response.data;
      
      // Populate form with existing data
      console.log('📋 Raw terminated union data:', tuData);
      console.log('📋 terminated_date field:', tuData.terminated_date);
      
      reset({
        union_id: tuData.union_id || 0,
        terminated_date: tuData.terminated_date?.split('T')[0] || '',
        termination_reason: tuData.termination_reason || '',
      });
    } catch (err) {
      console.error('💥 Error loading terminated union:', err);
      setError(t('messages.errorLoadingData'));
      toast.error(t('messages.errorLoadingData'));
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: TerminatedUnionFormData) => {
    console.log('🔍 Form submission started');
    console.log('📝 Form data:', data);
    console.log('❌ Form errors:', errors);
    
    try {
      setError('');
      setLoading(true);

      const tuData = {
        union_id: Number(data.union_id),
        terminated_date: new Date(data.terminated_date).toISOString(),
        termination_reason: String(data.termination_reason)
      };

      console.log('📤 Sending data to API:', tuData);

      if (isEdit && id) {
        const tu_id = parseInt(id);
        if (isNaN(tu_id)) {
          setError(t('messages.errorSavingData'));
          toast.error(t('messages.errorSavingData'));
          return;
        }
        console.log('✏️ Updating terminated union with ID:', tu_id);
        const response = await updateTerminatedUnion(tu_id, tuData);
        console.log('✅ Update successful:', response);
        toast.success('Terminated union updated successfully!');
      } else {
        console.log('➕ Creating new terminated union');
        const response = await createTerminatedUnion(tuData);
        console.log('✅ Create successful:', response);
        toast.success('Terminated union added successfully!');
      }

      console.log('🎉 Navigating to terminated unions list');
      navigate('/admin/terminated-unions');
    } catch (err: any) {
      console.error('💥 Error saving terminated union:', err);
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
            {isEdit ? 'Edit Terminated Union' : 'Add Terminated Union'}
          </h1>
          <p className={styles.subtitle}>
            {isEdit 
              ? 'Update terminated union information' 
              : 'Record a new terminated union'
            }
          </p>
        </div>
        <div className={styles.headerActions}>
          <Button
            variant="secondary"
            onClick={() => navigate('/admin/terminated-unions')}
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
          {/* Termination Information */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Termination Information</h3>
            
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
                label="Termination Date *"
                type="date"
                error={errors.terminated_date?.message}
                required
                className={styles.formField}
                register={register('terminated_date')}
              />
            </div>

            <Select
              label="Termination Reason *"
              value={watchedValues.termination_reason || ''}
              onChange={(e) => {
                const val = e.target.value;
                console.log('🔄 Reason selected:', val);
                if (val) {
                  setValue('termination_reason', val);
                }
              }}
              error={errors.termination_reason?.message}
              required
              className={styles.formField}
              options={[
                { value: '', label: 'Select Reason' },
                { value: 'Dissolution', label: 'Dissolution' },
                { value: 'Merger', label: 'Merger with another union' },
                { value: 'Bankruptcy', label: 'Bankruptcy' },
                { value: 'Legal Issues', label: 'Legal Issues' },
                { value: 'Voluntary Closure', label: 'Voluntary Closure' },
                { value: 'Other', label: 'Other' }
              ]}
            />

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
            onClick={() => navigate('/admin/terminated-unions')} 
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

export default TerminatedUnionsFormComplete;

