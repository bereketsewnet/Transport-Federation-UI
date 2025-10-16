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
import { Select } from '@components/Select/Select';
import { TextArea } from '@components/TextArea/TextArea';
import { Loading } from '@components/Loading/Loading';
import styles from './TerminatedUnions.module.css';

interface TerminatedUnionFormData {
  union_id: number;
  termination_date: string;
  termination_reason: string;
  notes?: string;
}

const terminatedUnionSchema = yup.object({
  union_id: yup.number().required('Union is required'),
  termination_date: yup.string().required('Termination date is required'),
  termination_reason: yup.string().required('Termination reason is required'),
  notes: yup.string(),
});

export const TerminatedUnionsForm: React.FC = () => {
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
    reset
  } = useForm<TerminatedUnionFormData>({
    resolver: yupResolver(terminatedUnionSchema),
    defaultValues: {
      termination_date: new Date().toISOString().split('T')[0]
    }
  });

  // Load unions for dropdown
  useEffect(() => {
    const loadUnions = async () => {
      try {
        const response = await getUnions({ per_page: 1000 });
        setUnions(response.data.data);
      } catch (err) {
        console.error('Error loading unions:', err);
      }
    };
    loadUnions();
  }, []);

  // Load terminated union data for editing
  useEffect(() => {
    if (isEdit && id) {
      loadTerminatedUnion();
    }
  }, [id, isEdit]);

  const loadTerminatedUnion = async () => {
    try {
      setLoading(true);
      const response = await getTerminatedUnion(parseInt(id!));
      const terminatedUnionData = response.data;

      // Populate form with existing data
      reset({
        union_id: terminatedUnionData.union_id,
        termination_date: terminatedUnionData.termination_date?.split('T')[0] || '',
        termination_reason: terminatedUnionData.termination_reason,
        notes: terminatedUnionData.notes || '',
      });
    } catch (err) {
      setError(t('messages.errorLoadingData'));
      console.error('Error loading terminated union:', err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: TerminatedUnionFormData) => {
    try {
      setError('');
      setLoading(true);

      if (isEdit && id) {
        await updateTerminatedUnion(parseInt(id), data);
      } else {
        await createTerminatedUnion(data);
      }
      navigate('/admin/terminated-unions');
    } catch (err) {
      setError(t('messages.errorSavingData'));
      console.error('Error saving terminated union:', err);
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
            {isEdit ? t('terminatedUnions.editTerminatedUnion') : t('terminatedUnions.addTerminatedUnion')}
          </h1>
          <p className={styles.subtitle}>
            {isEdit ? t('terminatedUnions.editTerminatedUnionSubtitle') : t('terminatedUnions.addTerminatedUnionSubtitle')}
          </p>
        </div>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.formGrid}>
          {/* Basic Information */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>{t('terminatedUnions.basicInformation')}</h3>

            <Select
              label={t('terminatedUnions.union')}
              {...register('union_id', { valueAsNumber: true })}
              error={errors.union_id?.message}
              required
              className={styles.formField}
              options={[
                { value: '', label: t('terminatedUnions.selectUnion') },
                ...unions.map(union => ({
                  value: union.id.toString(),
                  label: `${union.name_en} (${union.union_code})`
                }))
              ]}
            />

            <FormField
              label={t('terminatedUnions.terminationDate')}
              type="date"
              {...register('termination_date')}
              error={errors.termination_date?.message}
              required
              className={styles.formField}
            />

            <Select
              label={t('terminatedUnions.terminationReason')}
              {...register('termination_reason')}
              error={errors.termination_reason?.message}
              required
              className={styles.formField}
              options={[
                { value: '', label: t('terminatedUnions.selectReason') },
                { value: 'dissolution', label: t('terminatedUnions.reasons.dissolution') },
                { value: 'merger', label: t('terminatedUnions.reasons.merger') },
                { value: 'violation', label: t('terminatedUnions.reasons.violation') },
                { value: 'insolvency', label: t('terminatedUnions.reasons.insolvency') },
                { value: 'membership', label: t('terminatedUnions.reasons.membership') },
                { value: 'other', label: t('terminatedUnions.reasons.other') }
              ]}
            />
          </div>

          {/* Termination Information */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>{t('terminatedUnions.terminationInformation')}</h3>

            <TextArea
              label={t('terminatedUnions.notes')}
              {...register('notes')}
              error={errors.notes?.message}
              className={styles.formField}
              rows={6}
              placeholder="Additional details about the termination..."
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className={styles.formActions}>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/admin/terminated-unions')}
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

export default TerminatedUnionsForm;
