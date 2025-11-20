import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { createGallery, getGallery, updateGallery } from '@api/endpoints';
import { Button } from '@components/Button/Button';
import { FormField } from '@components/FormField/FormField';
import { TextArea } from '@components/TextArea/TextArea';
import { Loading } from '@components/Loading/Loading';
import { toast } from 'react-hot-toast';
import styles from './Gallery.module.css';

interface GalleryFormData {
  title: string;
  description: string;
}

const schema = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
});

export const AdminGalleryForm: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const [initialLoading, setInitialLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GalleryFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  useEffect(() => {
    const loadGallery = async () => {
      if (!isEdit || !id) {
        return;
      }

      try {
        setInitialLoading(true);
        const response = await getGallery(Number(id));
        const galleryData = (response.data as any)?.gallery || response.data;
        reset({
          title: galleryData?.title || '',
          description: galleryData?.description || '',
        });
      } catch (error) {
        toast.error(t('messages.errorLoadingData'));
      } finally {
        setInitialLoading(false);
      }
    };

    loadGallery();
  }, [id, isEdit, reset, t]);

  const onSubmit = async (data: GalleryFormData) => {
    setIsSubmitting(true);
    try {
      if (isEdit && id) {
        await updateGallery(Number(id), data);
        toast.success(t('messages.updateSuccess'));
      } else {
        await createGallery(data);
        toast.success(t('messages.createSuccess'));
      }
      navigate('/admin/gallery');
    } catch (error) {
      toast.error(t('messages.errorSavingData'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (initialLoading) {
    return <Loading />;
  }

  return (
    <div className={styles.container}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>
              {isEdit ? t('gallery.editGallery') || 'Edit Gallery' : t('gallery.addGallery')}
            </h1>
            <p className={styles.subtitle}>
              {isEdit ? t('gallery.editGallerySubtitle') || 'Update gallery details' : 'Create a new photo gallery'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <FormField
            label={t('gallery.galleryTitle')}
            {...register('title')}
            error={errors.title?.message}
            disabled={isSubmitting}
            required
          />

          <TextArea
            label={t('common.description')}
            {...register('description')}
            error={errors.description?.message}
            disabled={isSubmitting}
            rows={4}
            required
          />

          <div className={styles.formActions}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/admin/gallery')}
              disabled={isSubmitting}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? t('common.loading')
                : isEdit
                ? t('common.update')
                : t('common.create')}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminGalleryForm;

