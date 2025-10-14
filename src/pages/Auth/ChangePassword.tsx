import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@components/Button/Button';
import { FormField } from '@components/FormField/FormField';
import { changePasswordValidationSchema } from '@utils/validators';
import { toast } from 'react-hot-toast';
import styles from './ChangePassword.module.css';

interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const ChangePassword: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: yupResolver(changePasswordValidationSchema),
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      setIsLoading(true);
      // TODO: Implement change password API call
      console.log('Change password:', data);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast.success(t('auth.passwordChanged'));
      reset();
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Change password error:', error);
      toast.error('Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className={styles.header}>
          <h1 className={styles.title}>{t('auth.changePassword')}</h1>
          <p className={styles.subtitle}>Please update your password to continue</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <FormField
            type="password"
            label={t('auth.currentPassword')}
            placeholder="Enter current password"
            error={errors.currentPassword?.message}
            register={register('currentPassword')}
            autoComplete="current-password"
            required
          />

          <FormField
            type="password"
            label={t('auth.newPassword')}
            placeholder="Enter new password"
            error={errors.newPassword?.message}
            register={register('newPassword')}
            autoComplete="new-password"
            helperText="Password must contain uppercase, lowercase, number and special character"
            required
          />

          <FormField
            type="password"
            label={t('auth.confirmPassword')}
            placeholder="Confirm new password"
            error={errors.confirmPassword?.message}
            register={register('confirmPassword')}
            autoComplete="new-password"
            required
          />

          <div className={styles.actions}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(-1)}
              disabled={isLoading}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" isLoading={isLoading}>
              {t('common.save')}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ChangePassword;

