import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@hooks/useAuth';
import { getMember, Member } from '@api/endpoints';
import { Loading } from '@components/Loading/Loading';
import { Button } from '@components/Button/Button';
import { formatDate } from '@utils/formatters';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';

export const MemberDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.mem_id) {
      loadMemberProfile();
    }
  }, [user?.mem_id]);

  const loadMemberProfile = async () => {
    try {
      setIsLoading(true);
      const response = await getMember(user!.mem_id!);
      setMember(response.data);
    } catch (err: any) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error || !member) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <h2>Error</h2>
          <p>{error || 'Failed to load profile'}</p>
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
              <h1 className={styles.name}>
                {member.first_name} {member.father_name}
              </h1>
              <p className={styles.code}>{member.member_code}</p>
            </div>
          </div>
          <Button onClick={() => navigate('/member/change-password')}>
            🔒 Change Password
          </Button>
        </div>

        {/* Info Grid */}
        <div className={styles.grid}>
          {/* Personal Info */}
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
              Personal Information
            </h2>
            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <span className={styles.label}>Full Name:</span>
                <span className={styles.value}>{member.first_name} {member.father_name} {member.surname}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Sex:</span>
                <span className={styles.value}>{member.sex === 'M' ? 'Male' : 'Female'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Birthdate:</span>
                <span className={styles.value}>{formatDate(member.birthdate)}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Education:</span>
                <span className={styles.value}>{member.education || 'N/A'}</span>
              </div>
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            className={styles.card}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className={styles.cardTitle}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Information
            </h2>
            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <span className={styles.label}>Phone:</span>
                <a href={`tel:${member.phone}`} className={styles.link}>{member.phone}</a>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Email:</span>
                <a href={`mailto:${member.email}`} className={styles.link}>{member.email}</a>
              </div>
            </div>
          </motion.div>

          {/* Employment Info */}
          <motion.div
            className={styles.card}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className={styles.cardTitle}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Employment Information
            </h2>
            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <span className={styles.label}>Salary:</span>
                <span className={styles.value}>{member.salary?.toLocaleString()} ETB</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Registry Date:</span>
                <span className={styles.value}>{formatDate(member.registry_date)}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default MemberDashboard;

