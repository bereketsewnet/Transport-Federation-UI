import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  createOrgLeader,
  updateOrgLeader,
  getOrgLeader,
  getUnions,
  getSectors,
  getOrganizations,
  OrgLeader,
  Union,
  Sector,
  Organization,
} from '@api/endpoints';
import { Button } from '@components/Button/Button';
import { FormField } from '@components/FormField/FormField';
import { Select } from '@components/Select/Select';
import { Loading } from '@components/Loading/Loading';
import { toast } from 'react-hot-toast';
import styles from './OrgLeaders.module.css';

interface OrgLeaderFormData {
  union_id: number;
  title: string;
  first_name: string;
  father_name: string;
  surname: string;
  position: string;
  phone: string;
  email?: string | null;
  sector: string;
  organization: string;
}

const titles = ['Mr', 'Mrs', 'Ms', 'Dr', 'Prof'];

const POSITION_OPTIONS = [
  'CEO',
  'General Manager',
  'Director',
] as const;

const schema = yup
  .object({
    union_id: yup.number().required('Union is required').min(1, 'Union is required'),
    title: yup.string().required('Title is required'),
    first_name: yup.string().required('First name is required'),
    father_name: yup.string().required('Father name is required'),
    surname: yup.string().required('Surname is required'),
    position: yup.string().required('Position is required'),
    phone: yup.string().required('Phone number is required'),
    email: yup.string().email('Invalid email address').optional().nullable(),
    sector: yup.string().required('Sector is required'),
    organization: yup.string().required('Organization is required'),
  })
  .required();

export const OrgLeaderForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [unions, setUnions] = useState<Union[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loadingOptions, setLoadingOptions] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<OrgLeaderFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      union_id: 0,
      title: '',
      first_name: '',
      father_name: '',
      surname: '',
      position: '',
      phone: '',
      email: '',
      sector: '',
      organization: '',
    },
  });

  const watchedValues = watch();

  useEffect(() => {
    const loadUnions = async () => {
      try {
        const response = await getUnions({ per_page: 500 });
        setUnions(response.data.data || []);
      } catch (err) {
        console.error('💥 Error loading unions for org leader form:', err);
        toast.error(t('messages.errorLoadingData'));
      }
    };

    loadUnions();
  }, [t]);

  useEffect(() => {
    const loadSectorsAndOrganizations = async () => {
      setLoadingOptions(true);
      try {
        const [sectorsResult, organizationsResult] = await Promise.allSettled([
          getSectors({ page: 1, per_page: 100 }),
          getOrganizations({ page: 1, per_page: 100 }),
        ]);

        if (sectorsResult.status === 'fulfilled') {
          const sectorsData = sectorsResult.value.data.data || [];
          setSectors(sectorsData);
          if (!isEdit && sectorsData.length > 0) {
            setValue('sector', sectorsData[0].name, { shouldValidate: true });
          }
        } else {
          console.error('💥 Error loading sectors:', sectorsResult.reason);
          toast.error(t('messages.errorLoadingData'));
          setSectors([]);
        }

        if (organizationsResult.status === 'fulfilled') {
          const organizationsData = organizationsResult.value.data.data || [];
          setOrganizations(organizationsData);
          if (!isEdit && organizationsData.length > 0) {
            setValue('organization', organizationsData[0].name, { shouldValidate: true });
          }
        } else {
          console.error('💥 Error loading organizations:', organizationsResult.reason);
          toast.error(t('messages.errorLoadingData'));
          setOrganizations([]);
        }
      } catch (err) {
        console.error('💥 Error loading sectors/organizations for org leader form:', err);
        toast.error(t('messages.errorLoadingData'));
      } finally {
        setLoadingOptions(false);
      }
    };

    loadSectorsAndOrganizations();
  }, [isEdit, setValue, t]);

  useEffect(() => {
    if (!isEdit || !id) {
      return;
    }

    const loadLeader = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await getOrgLeader(Number(id));
        const leader: OrgLeader = response.data;

        reset({
          union_id: leader.union_id,
          title: leader.title || '',
          first_name: leader.first_name || '',
          father_name: leader.father_name || '',
          surname: leader.surname || '',
          position: leader.position || '',
          phone: leader.phone || '',
          email: leader.email || '',
          sector: leader.sector || leader.union?.sector || '',
          organization: leader.organization || leader.union?.organization || '',
        });
      } catch (err: any) {
        console.error('💥 Error loading organization leader:', err);
        const message = err?.response?.data?.message || t('messages.errorLoadingData');
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    loadLeader();
  }, [id, isEdit, reset, t]);

  const onSubmit = async (data: OrgLeaderFormData) => {
    try {
      setError('');

      const payload: Partial<OrgLeader> = {
        union_id: data.union_id,
        title: data.title,
        first_name: data.first_name,
        father_name: data.father_name,
        surname: data.surname,
        position: data.position,
        phone: data.phone,
        email: data.email || undefined,
        sector: data.sector || undefined,
        organization: data.organization || undefined,
      };

      if (isEdit && id) {
        await updateOrgLeader(Number(id), payload);
        toast.success(t('messages.updateSuccess'));
      } else {
        await createOrgLeader(payload);
        toast.success(t('messages.createSuccess'));
      }

      navigate('/admin/org-leaders');
    } catch (err: any) {
      console.error('💥 Error saving organization leader:', err);
      const message = err?.response?.data?.message || t('messages.errorSavingData');
      setError(message);
      toast.error(message);
    }
  };

  if (loading || loadingOptions) {
    return <Loading />;
  }

  return (
    <motion.div
      className={styles.formContainer}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className={styles.formHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>
            {isEdit ? t('orgLeaders.editLeader') : t('orgLeaders.addLeader')}
          </h1>
          <p className={styles.subtitle}>
            {isEdit ? t('orgLeaders.editSubtitle') : t('orgLeaders.createSubtitle')}
          </p>
        </div>

        <div className={styles.headerActions}>
          <Button variant="secondary" onClick={() => navigate('/admin/org-leaders')}>
            {t('common.cancel')}
          </Button>
        </div>
      </div>

      {error && (
        <motion.div
          className={styles.errorMessage}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.formGrid}>
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>{t('orgLeaders.sections.basicInfo')}</h3>
            <div className={styles.formRow}>
              <Select
                label={t('orgLeaders.fields.union')}
                value={watchedValues.union_id ? watchedValues.union_id.toString() : ''}
                onChange={(event) => {
                  const value = event.target.value;
                  setValue('union_id', value ? Number(value) : 0, { shouldValidate: true });
                }}
                error={errors.union_id?.message}
                required
                className={styles.formField}
                options={[
                  { value: '', label: t('orgLeaders.placeholders.selectUnion') },
                  ...unions
                    .filter((union) => (union.id || (union as any).union_id) && union.name_en)
                    .map((union) => ({
                      value: ((union.id || (union as any).union_id) as number).toString(),
                      label: union.name_en,
                    })),
                ]}
              />

              <Select
                label={t('orgLeaders.fields.title')}
                value={watchedValues.title}
                onChange={(event) => {
                  setValue('title', event.target.value, { shouldValidate: true });
                }}
                error={errors.title?.message}
                required
                className={styles.formField}
                options={[
                  { value: '', label: t('orgLeaders.placeholders.selectTitle') },
                  ...titles.map((title) => ({ value: title, label: title })),
                ]}
              />
            </div>

            <div className={styles.formRow}>
              <FormField
                label={t('orgLeaders.fields.firstName')}
                required
                className={styles.formField}
                error={errors.first_name?.message}
                placeholder={t('orgLeaders.placeholders.firstName')}
                register={register('first_name')}
              />
              <FormField
                label={t('orgLeaders.fields.fatherName')}
                required
                className={styles.formField}
                error={errors.father_name?.message}
                placeholder={t('orgLeaders.placeholders.fatherName')}
                register={register('father_name')}
              />
            </div>

            <div className={styles.formRow}>
              <FormField
                label={t('orgLeaders.fields.surname')}
                required
                className={styles.formField}
                error={errors.surname?.message}
                placeholder={t('orgLeaders.placeholders.surname')}
                register={register('surname')}
              />
              <Select
                label={t('orgLeaders.fields.position')}
                value={watch('position') || ''}
                onChange={(e) => {
                  setValue('position', e.target.value, { shouldValidate: true });
                }}
                error={errors.position?.message}
                required
                className={styles.formField}
                options={[
                  { value: '', label: t('orgLeaders.placeholders.position') || 'Select Position' },
                  ...POSITION_OPTIONS.map((position) => ({
                    value: position,
                    label: position,
                  })),
                ]}
              />
            </div>
          </div>

          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>{t('orgLeaders.sections.contactInfo')}</h3>
            <div className={styles.formRow}>
              <FormField
                label={t('orgLeaders.fields.phone')}
                required
                className={styles.formField}
                error={errors.phone?.message}
                placeholder={t('orgLeaders.placeholders.phone')}
                register={register('phone')}
              />
              <FormField
                label={t('orgLeaders.fields.email')}
                type="email"
                className={styles.formField}
                error={errors.email?.message}
                placeholder={t('orgLeaders.placeholders.email')}
                register={register('email')}
              />
            </div>
          </div>

          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>{t('orgLeaders.sections.additionalInfo')}</h3>
            <div className={styles.formRow}>
              <Select
                label={t('orgLeaders.fields.sector')}
                  value={watchedValues.sector || ''}
                onChange={(event) => {
                  setValue('sector', event.target.value, { shouldValidate: true });
                }}
                className={styles.formField}
                error={errors.sector?.message}
                  disabled={loadingOptions || sectors.length === 0}
                  options={[
                    { value: '', label: t('orgLeaders.placeholders.selectSector') || 'Select sector' },
                    ...sectors.map((sector) => ({
                      value: sector.name,
                      label: sector.name,
                    })),
                  ]}
              />
                <Select
                  label={t('orgLeaders.fields.organization')}
                  value={watch('organization') || ''}
                  onChange={(event) => {
                    setValue('organization', event.target.value, { shouldValidate: true });
                  }}
                  className={styles.formField}
                  error={errors.organization?.message}
                  disabled={loadingOptions || organizations.length === 0}
                  options={[
                    {
                      value: '',
                      label: t('orgLeaders.placeholders.selectOrganization') || 'Select organization',
                    },
                    ...organizations.map((organization) => ({
                      value: organization.name,
                      label: organization.name,
                    })),
                  ]}
                />
            </div>
          </div>
        </div>

        <div className={styles.formActions}>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/admin/org-leaders')}
            disabled={isSubmitting}
          >
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isEdit ? t('common.update') : t('common.create')}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default OrgLeaderForm;

