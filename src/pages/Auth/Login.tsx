import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import useAuth from '@hooks/useAuth';
import { Button } from '@components/Button/Button';
import { FormField } from '@components/FormField/FormField';
import { loginValidationSchema } from '@utils/validators';
import styles from './Login.module.css';

interface LoginFormData {
  username: string;
  password: string;
}

export const Login: React.FC = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginValidationSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      await login(data);
    } catch (error) {
      console.error('Login error:', error);
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
          <div className={styles.logoContainer}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="12" fill="var(--primary)" />
              <path
                d="M24 14L14 20V28L24 34L34 28V20L24 14Z"
                stroke="white"
                strokeWidth="2.5"
                fill="none"
              />
            </svg>
          </div>
          <h1 className={styles.title}>{t('auth.login')}</h1>
          <p className={styles.subtitle}>Ethiopian Transport and Communication Workers Union Industrial Federation</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
          <FormField
            label={t('auth.username')}
            placeholder="Enter your username"
            error={errors.username?.message}
            register={register('username')}
            autoComplete="username"
          />

          <FormField
            type="password"
            label={t('auth.password')}
            placeholder="Enter your password"
            error={errors.password?.message}
            register={register('password')}
            autoComplete="current-password"
          />

          <Button type="submit" fullWidth isLoading={isLoading}>
            {t('auth.loginButton')}
          </Button>
        </form>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            {t('auth.forgotPassword')}{' '}
            <a href="/forgot-password" className={styles.link}>
              Reset it here
            </a>
          </p>
        </div>
      </motion.div>

      {/* Background decoration */}
      <div className={styles.decoration}>
        <div className={styles.circle1}></div>
        <div className={styles.circle2}></div>
      </div>
    </div>
  );
};

export default Login;

