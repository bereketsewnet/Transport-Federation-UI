import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  getMember, 
  Member,
  getUnion,
  Union
} from '@api/endpoints';
import { Button } from '@components/Button/Button';
import { Loading } from '@components/Loading/Loading';
import { formatDate } from '@utils/formatters';
import { toast } from 'react-hot-toast';
import styles from './Members.module.css';

export const MemberView: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [member, setMember] = useState<Member | null>(null);
  const [union, setUnion] = useState<Union | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      const mem_id = parseInt(id);
      if (!isNaN(mem_id)) {
        loadMember(mem_id);
      } else {
        setError(t('messages.errorLoadingData'));
      }
    }
  }, [id]);

  const loadMember = async (mem_id: number) => {
    try {
      setLoading(true);
      console.log('🔍 Loading member with mem_id:', mem_id);
      const response = await getMember(mem_id);
      console.log('✅ Member loaded:', response.data);
      const memberData = response.data;
      setMember(memberData);
      
      // Load union data
      if (memberData.union_id) {
        try {
          const unionResponse = await getUnion(memberData.union_id);
          setUnion(unionResponse.data);
        } catch (err) {
          console.error('Error loading union:', err);
        }
      }
    } catch (err: any) {
      setError(t('messages.errorLoadingData'));
      toast.error(t('messages.errorLoadingData'));
      console.error('Error loading member:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error || !member) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          {error || t('members.memberNotFound')}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={styles.viewContainer}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className={styles.viewHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>
            {member.first_name} {member.father_name} {member.surname || ''}
          </h1>
          <p className={styles.subtitle}>{member.member_code}</p>
        </div>
        <div className={styles.headerActions}>
          <Button
            variant="secondary"
            onClick={() => navigate('/admin/members')}
          >
            {t('common.back')}
          </Button>
          <Button
            onClick={() => navigate(`/admin/members/${id}/edit`)}
          >
            {t('common.edit')}
          </Button>
        </div>
      </div>

      {/* Member Details */}
      <div className={styles.viewContent}>
        {/* Basic Information */}
        <motion.div
          className={styles.infoSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className={styles.sectionTitle}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {t('members.basicInformation')}
          </h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>{t('members.memberCode')}</span>
              <span className={styles.infoValue}>{member.member_code}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>{t('members.firstName')}</span>
              <span className={styles.infoValue}>{member.first_name}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>{t('members.fatherName')}</span>
              <span className={styles.infoValue}>{member.father_name}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>{t('members.surname')}</span>
              <span className={styles.infoValue}>{member.surname || 'N/A'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>{t('members.sex')}</span>
              <span className={`${styles.badge} ${styles[member.sex?.toLowerCase()]}`}>
                {member.sex}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>{t('members.birthdate')}</span>
              <span className={styles.infoValue}>{formatDate(member.birthdate)}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>{t('members.education')}</span>
              <span className={styles.infoValue}>{member.education}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>{t('members.union')}</span>
              <span className={styles.infoValue}>{union?.name_en || 'Unknown'}</span>
            </div>
          </div>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          className={styles.infoSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className={styles.sectionTitle}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {t('members.contactInformation')}
          </h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>{t('members.phone')}</span>
              <span className={styles.infoValue}>
                <a href={`tel:${member.phone}`} className={styles.link}>{member.phone}</a>
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>{t('members.email')}</span>
              <span className={styles.infoValue}>
                <a href={`mailto:${member.email}`} className={styles.link}>{member.email}</a>
              </span>
            </div>
          </div>
        </motion.div>

        {/* Employment Information */}
        <motion.div
          className={styles.infoSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className={styles.sectionTitle}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {t('members.employmentInformation')}
          </h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>{t('members.salary')}</span>
              <span className={styles.infoValue}>{member.salary?.toLocaleString()} ETB</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>{t('members.registryDate')}</span>
              <span className={styles.infoValue}>{formatDate(member.registry_date)}</span>
            </div>
          </div>
        </motion.div>

        {/* Additional Information */}
        <motion.div
          className={styles.infoSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className={styles.sectionTitle}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t('members.additionalInformation')}
          </h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>{t('common.createdAt')}</span>
              <span className={styles.infoValue}>{formatDate(member.created_at || '')}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>{t('common.updatedAt')}</span>
              <span className={styles.infoValue}>{formatDate(member.updated_at || '')}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <div className={styles.viewActions}>
        <Button
          variant="secondary"
          onClick={() => navigate('/admin/members')}
        >
          {t('common.back')}
        </Button>
        <Button
          onClick={() => navigate(`/admin/members/${id}/edit`)}
        >
          {t('common.edit')}
        </Button>
      </div>
    </motion.div>
  );
};

export default MemberView;
