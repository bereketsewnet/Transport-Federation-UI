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
  updateUnion
} from '@api/endpoints';
import { Button } from '@components/Button/Button';
import { FormField } from '@components/FormField/FormField';
import { Select } from '@components/Select/Select';
import { Loading } from '@components/Loading/Loading';
import { toast } from 'react-hot-toast';
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
  general_assembly_date?: string;
  external_audit_date?: string;
  region?: string;
  zone?: string;
  city?: string;
  sub_city?: string;
  woreda?: string;
  location_area?: string;
}

const SECTOR_OPTIONS = [
  'Aviation',
  'Road transport',
  'Urban transport',
  'Railway',
  'Inland transport',
  'Maritime',
  'Communication',
] as const;
const DEFAULT_SECTOR = SECTOR_OPTIONS[0];

const ORGANIZATION_OPTIONS = [
  'Ethiopian Airlines Group',
  'Ethiopian Maritime Transport and Logistics',
  'Addis Ababa City Bus Service Enterprise',
  'Ethio Telecom',
  'Ethiopia Posta',
  'Public Service Transport',
  'DHL World Wide Express Ethiopia',
  'Ethiopian Tool Road Enterprise',
  'International Cargo and Aviation Service',
  'ISON Experience Ethio call PLC',
  'Moti Engineering P.L.C',
  'Addis Ababa Light Railway Transport Service Enterprise',
  'East West Ethio Transport PLC',
  'Abyssinia Transport S/C',
  'Bekelcha Transport S/C',
  'Geda Transport S/C',
  'Selam Bus Public Transport PLC',
  'Ethiopian Railway Corporation',
  'Dire Dawa Dewele Railway',
  'Trans Ethiopia PLC',
  'Demtsu Woyan',
  'Bahir Dar Public Service Transport',
  'Hararge Anestgn Melestegn Public Transport',
  'Hararge Keftegn Public Transport',
  'Kinfe Rufael Geda',
  'Tekur Abay Transport S/C',
  'National Transport',
  'Elet Derash Erdata Transport',
  'Derba Transport S/C',
  'Hohot Transport',
  'Ethiopian Maritime Training Institute',
  'Adama Drivers Training Institute',
] as const;
const DEFAULT_ORGANIZATION = ORGANIZATION_OPTIONS[0];

// Make strategic_plan_in_place optional (not required for registration)
const unionSchema = yup.object({
  name_en: yup.string().required('Union name (English) is required'),
  name_am: yup.string().required('Union name (Amharic) is required'),
  union_code: yup.string().required('Union code is required'),
  sector: yup.string().required('Sector is required'),
  organization: yup.string().required('Organization is required'),
  established_date: yup.string().required('Established date is required'),
  terms_of_election: yup.number().required('Terms of election is required').min(1, 'Must be at least 1 year'),
  strategic_plan_in_place: yup.boolean().default(false), // Optional field with default
  general_assembly_date: yup.string().optional(),
  external_audit_date: yup.string().optional(),
  region: yup.string().optional(),
  zone: yup.string().optional(),
  city: yup.string().optional(),
  sub_city: yup.string().optional(),
  woreda: yup.string().optional(),
  location_area: yup.string().optional(),
}).required();

export const UnionFormComplete: React.FC = () => {
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
  } = useForm<UnionFormData>({
    resolver: yupResolver(unionSchema),
    defaultValues: {
      name_en: '',
      name_am: '',
      union_code: '',
      sector: DEFAULT_SECTOR,
      organization: DEFAULT_ORGANIZATION,
      established_date: new Date().toISOString().split('T')[0],
      terms_of_election: 4,
      strategic_plan_in_place: false,
      general_assembly_date: '',
      external_audit_date: '',
      region: '',
      zone: '',
      city: '',
      sub_city: '',
      woreda: '',
      location_area: '',
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
      const union_id = parseInt(id!);
      if (isNaN(union_id)) {
        setError(t('messages.errorLoadingData'));
        return;
      }
      
      console.log('🔍 Loading union for edit, ID:', union_id);
      const response = await getUnion(union_id);
      console.log('✅ Union data for edit:', response.data);
      const unionData = response.data;
      
      // Populate form with existing data
      reset({
        name_en: unionData.name_en || '',
        name_am: unionData.name_am || '',
        union_code: unionData.union_code || '',
        sector:
          SECTOR_OPTIONS.find((option) => option === unionData.sector) || DEFAULT_SECTOR,
        organization:
          ORGANIZATION_OPTIONS.find((option) => option === unionData.organization) || DEFAULT_ORGANIZATION,
        established_date: unionData.established_date?.split('T')[0] || '',
        terms_of_election: unionData.terms_of_election || 4,
        strategic_plan_in_place: unionData.strategic_plan_in_place || false,
        general_assembly_date: (unionData as any).general_assembly_date?.split('T')[0] || '',
        external_audit_date: (unionData as any).external_audit_date?.split('T')[0] || '',
        region: (unionData as any).region || '',
        zone: (unionData as any).zone || '',
        city: (unionData as any).city || '',
        sub_city: (unionData as any).sub_city || '',
        woreda: (unionData as any).woreda || '',
        location_area: (unionData as any).location_area || '',
      });
    } catch (err) {
      console.error('💥 Error loading union:', err);
      setError(t('messages.errorLoadingData'));
      toast.error(t('messages.errorLoadingData'));
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: UnionFormData) => {
    console.log('🔍 Form submission started');
    console.log('📝 Form data:', data);
    console.log('❌ Form errors:', errors);
    
    try {
      setError('');
      setLoading(true);

      const unionData = {
        ...data,
        established_date: new Date(data.established_date).toISOString(),
        general_assembly_date: data.general_assembly_date 
          ? new Date(data.general_assembly_date).toISOString() 
          : undefined,
        external_audit_date: data.external_audit_date 
          ? new Date(data.external_audit_date).toISOString() 
          : undefined,
      };

      console.log('📤 Sending data to API:', unionData);

      if (isEdit && id) {
        const union_id = parseInt(id);
        if (isNaN(union_id)) {
          setError(t('messages.errorSavingData'));
          return;
        }
        console.log('✏️ Updating union with ID:', union_id);
        const response = await updateUnion(union_id, unionData);
        console.log('✅ Update response:', response);
        toast.success(t('messages.updateSuccess'));
      } else {
        console.log('➕ Creating new union');
        const response = await createUnion(unionData);
        console.log('✅ Create response:', response);
        toast.success(t('messages.createSuccess'));
      }

      console.log('🎉 Success! Navigating to unions list');
      navigate('/admin/unions');
    } catch (err: any) {
      console.error('💥 Error saving union:', err);
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
            {isEdit ? t('unions.editUnion') : t('unions.addUnion')}
          </h1>
          <p className={styles.subtitle}>
            {isEdit 
              ? 'Update union information' 
              : 'Register a new trade union'
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
                label={t('unions.nameEn') + ' *'}
                error={errors.name_en?.message}
                required
                className={styles.formField}
                placeholder="Transport Workers Union"
                register={register('name_en')}
              />
              <FormField
                label={t('unions.nameAm') + ' *'}
                error={errors.name_am?.message}
                required
                className={styles.formField}
                placeholder="የትራንስፖርት ሰራተኞች ማህበር"
                register={register('name_am')}
              />
            </div>

            <div className={styles.formRow}>
              <FormField
                label={t('unions.code') + ' *'}
                error={errors.union_code?.message}
                required
                className={styles.formField}
                placeholder="TCU-001"
                register={register('union_code')}
              />
              <Select
                label="Organization *"
                value={watchedValues.organization || DEFAULT_ORGANIZATION}
                onChange={(e) => {
                  console.log('🔄 Organization selected:', e.target.value);
                  setValue('organization', e.target.value, { shouldValidate: true });
                }}
                error={errors.organization?.message}
                required
                className={styles.formField}
                options={ORGANIZATION_OPTIONS.map((option) => ({
                  value: option,
                  label: option,
                }))}
              />
            </div>

            <div className={styles.formRow}>
              <Select
                label={t('unions.sector') + ' *'}
                value={watchedValues.sector || DEFAULT_SECTOR}
                onChange={(e) => {
                  console.log('🔄 Sector selected:', e.target.value);
                  setValue('sector', e.target.value, { shouldValidate: true });
                }}
                error={errors.sector?.message}
                required
                className={styles.formField}
                options={SECTOR_OPTIONS.map((option) => ({
                  value: option,
                  label: option,
                }))}
              />
              <FormField
                label="Established Date *"
                type="date"
                error={errors.established_date?.message}
                required
                className={styles.formField}
                register={register('established_date')}
              />
            </div>

            <div className={styles.formRow}>
              <FormField
                label="Terms of Election (Years) *"
                type="number"
                error={errors.terms_of_election?.message}
                required
                className={styles.formField}
                min="1"
                max="10"
                placeholder="4"
                register={register('terms_of_election', { valueAsNumber: true })}
              />
              <div className={styles.formField}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    {...register('strategic_plan_in_place')}
                  />
                  <span className={styles.checkboxText}>
                  Annual Plan in Place
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.25rem' }}>
                      (Optional: Check if the union has a Annual development plan)
                    </span>
                  </span>
                </label>
              </div>
            </div>

            <div className={styles.formRow}>
              <FormField
                label="General Assembly Date"
                type="date"
                error={errors.general_assembly_date?.message}
                className={styles.formField}
                register={register('general_assembly_date')}
              />
              <FormField
                label="External Audit Date"
                type="date"
                error={errors.external_audit_date?.message}
                className={styles.formField}
                register={register('external_audit_date')}
              />
            </div>
          </div>

          {/* Location Information */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Location Information</h3>
            
            <div className={styles.formRow}>
              <FormField
                label="Region"
                error={errors.region?.message}
                className={styles.formField}
                placeholder="Addis Ababa"
                register={register('region')}
              />
              <FormField
                label="Zone"
                error={errors.zone?.message}
                className={styles.formField}
                placeholder="Central Zone"
                register={register('zone')}
              />
            </div>

            <div className={styles.formRow}>
              <FormField
                label="City"
                error={errors.city?.message}
                className={styles.formField}
                placeholder="Addis Ababa"
                register={register('city')}
              />
              <FormField
                label="Sub-city"
                error={errors.sub_city?.message}
                className={styles.formField}
                placeholder="Bole"
                register={register('sub_city')}
              />
            </div>

            <div className={styles.formRow}>
              <FormField
                label="Woreda"
                error={errors.woreda?.message}
                className={styles.formField}
                placeholder="Woreda 13"
                register={register('woreda')}
              />
              <FormField
                label="Location/Area"
                error={errors.location_area?.message}
                className={styles.formField}
                placeholder="Bole International Airport Area"
                register={register('location_area')}
              />
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
            onClick={() => navigate('/admin/unions')} 
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

export default UnionFormComplete;

