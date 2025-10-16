import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  getMember, 
  createMember, 
  updateMember, 
  Member,
  getUnions,
  Union
} from '@api/endpoints';
import { Button } from '@components/Button/Button';
import { FormField } from '@components/FormField/FormField';
import { Select } from '@components/Select/Select';
import { TextArea } from '@components/TextArea/TextArea';
import { Loading } from '@components/Loading/Loading';
import { toast } from 'react-hot-toast';
import styles from './Members.module.css';

interface MemberFormData {
  union_id: number;
  member_code: string;
  first_name: string;
  father_name: string;
  surname?: string;
  sex: string;
  birthdate: string;
  education: string;
  phone: string;
  email: string;
  salary: number;
  registry_date: string;
}

const memberSchema = yup.object({
  union_id: yup.number().required('Union is required'),
  member_code: yup.string().required('Member code is required'),
  first_name: yup.string().required('First name is required'),
  father_name: yup.string().required('Father name is required'),
  surname: yup.string(),
  sex: yup.string().required('Sex is required'),
  birthdate: yup.string().required('Birthdate is required'),
  education: yup.string().required('Education is required'),
  phone: yup.string().required('Phone is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  salary: yup.number().required('Salary is required').min(0, 'Salary must be positive'),
  registry_date: yup.string().required('Registry date is required'),
});

export const MemberForm: React.FC = () => {
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
  } = useForm<MemberFormData>({
    resolver: yupResolver(memberSchema),
    defaultValues: {
      registry_date: new Date().toISOString().split('T')[0],
      salary: 0
    }
  });

  // Debug: Watch form values
  const watchedValues = watch();
  console.log('👀 Form values:', watchedValues);
  console.log('❌ Form errors:', errors);

  // Load unions for dropdown
  useEffect(() => {
    const loadUnions = async () => {
      try {
        const response = await getUnions({ per_page: 100 });
        setUnions(response.data.data || []);
      } catch (err) {
        console.error('Error loading unions:', err);
      }
    };
    loadUnions();
  }, []);

  // Load member data for editing
  useEffect(() => {
    if (isEdit && id) {
      loadMember();
    }
  }, [isEdit, id]);

  const loadMember = async () => {
    try {
      setLoading(true);
      const mem_id = parseInt(id!);
      if (isNaN(mem_id)) {
        setError(t('messages.errorLoadingData'));
        return;
      }
      console.log('🔍 Loading member for edit, mem_id:', mem_id);
      const response = await getMember(mem_id);
      console.log('✅ Member data for edit:', response.data);
      const memberData = response.data;
      
      // Populate form with existing data
      reset({
        union_id: memberData.union_id,
        member_code: memberData.member_code,
        first_name: memberData.first_name,
        father_name: memberData.father_name,
        surname: memberData.surname || '',
        sex: memberData.sex,
        birthdate: memberData.birthdate?.split('T')[0] || '',
        education: memberData.education,
        phone: memberData.phone,
        email: memberData.email,
        salary: memberData.salary,
        registry_date: memberData.registry_date?.split('T')[0] || '',
      });
    } catch (err) {
      setError(t('messages.errorLoadingData'));
      toast.error(t('messages.errorLoadingData'));
      console.error('Error loading member:', err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: MemberFormData) => {
    console.log('🔍 Form submission started');
    console.log('📝 Form data:', data);
    
    try {
      setError('');
      setLoading(true);

      const memberData = {
        ...data,
        birthdate: new Date(data.birthdate).toISOString(),
        registry_date: new Date(data.registry_date).toISOString(),
      };

      console.log('📤 Sending data to API:', memberData);

      if (isEdit && id) {
        console.log('✏️ Updating member with ID:', id);
        const response = await updateMember(parseInt(id), memberData);
        console.log('✅ Update response:', response);
        toast.success(t('messages.updateSuccess'));
      } else {
        console.log('➕ Creating new member');
        const response = await createMember(memberData);
        console.log('✅ Create response:', response);
        toast.success(t('messages.createSuccess'));
      }

      console.log('🎉 Success! Navigating to members list');
      navigate('/admin/members');
    } catch (err: any) {
      console.error('💥 Error saving member:', err);
      console.error('💥 Error details:', err.response?.data);
      const errorMessage = err.response?.data?.message || t('messages.errorSavingData');
      setError(errorMessage);
      toast.error(errorMessage);
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
            {isEdit ? t('members.editMember') : t('members.addMember')}
          </h1>
          <p className={styles.subtitle}>
            {isEdit 
              ? t('members.editMemberSubtitle') 
              : t('members.addMemberSubtitle')
            }
          </p>
        </div>
        <div className={styles.headerActions}>
          <Button
            variant="secondary"
            onClick={() => navigate('/admin/members')}
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
            <h3 className={styles.sectionTitle}>{t('members.basicInformation')}</h3>
            
            <div className={styles.formRow}>
              <Select
                label={t('members.union')}
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
                  { value: '', label: t('members.selectUnion') },
                  ...unions.filter(u => u && u.id && u.name_en).map(union => ({
                    value: union.id.toString(),
                    label: union.name_en
                  }))
                ]}
              />
              <FormField
                label={t('members.memberCode')}
                error={errors.member_code?.message}
                required
                className={styles.formField}
                placeholder="e.g., M-1001"
                register={register('member_code')}
              />
            </div>

            <div className={styles.formRow}>
              <FormField
                label={t('members.firstName')}
                error={errors.first_name?.message}
                required
                className={styles.formField}
                placeholder="Enter first name"
                register={register('first_name')}
              />
              <FormField
                label={t('members.fatherName')}
                error={errors.father_name?.message}
                required
                className={styles.formField}
                placeholder="Enter father name"
                register={register('father_name')}
              />
            </div>

            <div className={styles.formRow}>
              <FormField
                label={t('members.surname')}
                error={errors.surname?.message}
                className={styles.formField}
                placeholder="Enter surname (optional)"
                register={register('surname')}
              />
              <Select
                label={t('members.sex')}
                value={watchedValues.sex || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) {
                    setValue('sex', val);
                  }
                }}
                error={errors.sex?.message}
                required
                className={styles.formField}
                options={[
                  { value: '', label: t('members.selectSex') },
                  { value: 'Male', label: t('members.male') },
                  { value: 'Female', label: t('members.female') }
                ]}
              />
            </div>

            <div className={styles.formRow}>
              <FormField
                label={t('members.birthdate')}
                type="date"
                error={errors.birthdate?.message}
                required
                className={styles.formField}
                register={register('birthdate')}
              />
              <Select
                label={t('members.education')}
                value={watchedValues.education || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) {
                    setValue('education', val);
                  }
                }}
                error={errors.education?.message}
                required
                className={styles.formField}
                options={[
                  { value: '', label: t('members.selectEducation') },
                  { value: 'Degree', label: 'Degree' },
                  { value: 'Diploma', label: 'Diploma' },
                  { value: 'Certificate', label: 'Certificate' },
                  { value: 'High School', label: 'High School' }
                ]}
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>{t('members.contactInformation')}</h3>
            
            <div className={styles.formRow}>
              <FormField
                label={t('members.phone')}
                type="tel"
                error={errors.phone?.message}
                required
                className={styles.formField}
                placeholder="+251911000000"
                register={register('phone')}
              />
              <FormField
                label={t('members.email')}
                type="email"
                error={errors.email?.message}
                required
                className={styles.formField}
                placeholder="member@example.com"
                register={register('email')}
              />
            </div>
          </div>

          {/* Employment Information */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>{t('members.employmentInformation')}</h3>
            
            <div className={styles.formRow}>
              <FormField
                label={t('members.salary')}
                type="number"
                error={errors.salary?.message}
                required
                className={styles.formField}
                min="0"
                step="0.01"
                placeholder="0.00"
                register={register('salary', { valueAsNumber: true })}
              />
              <FormField
                label={t('members.registryDate')}
                type="date"
                error={errors.registry_date?.message}
                required
                className={styles.formField}
                register={register('registry_date')}
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className={styles.formActions}>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/admin/members')}
            disabled={isSubmitting}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className={styles.submitButton}
          >
            {isSubmitting ? t('common.saving') : (isEdit ? t('common.update') : t('common.create'))}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default MemberForm;
