import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@hooks/useAuth';
import { Button } from '@components/Button/Button';
import styles from './AdminProfile.module.css';

export const AdminProfile: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <h2>{t('common.error')}</h2>
          <p>{t('adminProfile.userNotFound')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.content}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.avatarSection}>
            <div className={styles.avatar}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h1 className={styles.name}>{user.username}</h1>
              <p className={styles.role}>{t('adminProfile.role')}: {user.role}</p>
            </div>
          </div>
          <Button onClick={() => navigate('/admin/profile/reset-password')}>
            🔒 {t('adminProfile.resetPassword')}
          </Button>
        </div>

        {/* Info Grid */}
        <div className={styles.grid}>
          {/* Account Information */}
          <motion.div
            className={styles.card}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className={styles.cardTitle}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {t('adminProfile.accountInformation')}
            </h2>
            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <span className={styles.label}>{t('adminProfile.username')}:</span>
                <span className={styles.value}>{user.username}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>{t('adminProfile.role')}:</span>
                <span className={styles.value}>{user.role}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>{t('adminProfile.userId')}:</span>
                <span className={styles.value}>{user.id}</span>
              </div>
            </div>
          </motion.div>

          {/* Security Information */}
          <motion.div
            className={styles.card}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className={styles.cardTitle}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              {t('adminProfile.securityInformation')}
            </h2>
            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <span className={styles.label}>{t('adminProfile.passwordReset')}:</span>
                <span className={styles.value}>
                  <Button
                    size="sm"
                    variant="warning"
                    onClick={() => navigate('/admin/profile/reset-password')}
                  >
                    {t('adminProfile.resetPassword')}
                  </Button>
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>{t('adminProfile.securityQuestions')}:</span>
                <span className={styles.value}>{t('adminProfile.setViaPasswordReset')}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminProfile;

