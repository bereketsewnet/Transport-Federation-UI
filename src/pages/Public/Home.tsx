import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '@components/Button/Button';
import styles from './Home.module.css';

export const Home: React.FC = () => {
  const { t } = useTranslation();

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className={styles.home}>
      {/* Hero Section with Background */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className={styles.heroText}
          >
            <h1 className={styles.heroTitle}>
              {t('home.hero.title')}
            </h1>
            <p className={styles.heroSubtitle}>
              {t('home.hero.subtitle')}
            </p>
            <div className={styles.heroActions}>
              <Link to="/about">
                <Button size="lg" className={styles.primaryBtn}>
                  {t('home.hero.cta1')}
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="secondary" className={styles.secondaryBtn}>
                  {t('home.hero.cta2')}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
        
        {/* Animated scroll indicator */}
        <motion.div
          className={styles.scrollIndicator}
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14m0 0l-7-7m7 7l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className={styles.stats}>
        <div className={styles.container}>
          <motion.div 
            className={styles.statsGrid}
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div className={styles.statCard} variants={fadeInUp}>
              <motion.h3 
                className={styles.statNumber}
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", duration: 1 }}
              >
                1,250+
              </motion.h3>
              <p className={styles.statLabel}>{t('home.stats.members')}</p>
            </motion.div>

            <motion.div className={styles.statCard} variants={fadeInUp}>
              <motion.h3 
                className={styles.statNumber}
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", duration: 1, delay: 0.1 }}
              >
                19
              </motion.h3>
              <p className={styles.statLabel}>{t('home.stats.unions')}</p>
            </motion.div>

            <motion.div className={styles.statCard} variants={fadeInUp}>
              <motion.h3 
                className={styles.statNumber}
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", duration: 1, delay: 0.2 }}
              >
                50+
              </motion.h3>
              <p className={styles.statLabel}>{t('home.stats.years')}</p>
            </motion.div>

            <motion.div className={styles.statCard} variants={fadeInUp}>
              <motion.h3 
                className={styles.statNumber}
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", duration: 1, delay: 0.3 }}
              >
                100%
              </motion.h3>
              <p className={styles.statLabel}>{t('home.stats.protection')}</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Overview Section */}
      <section className={styles.overview}>
        <div className={styles.container}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className={styles.sectionTitle}>{t('home.overview.title')}</h2>
            <p className={styles.overviewText}>
              {t('home.overview.content')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Activities Section */}
      <section className={styles.activities}>
        <div className={styles.container}>
          <motion.h2 
            className={styles.sectionTitle}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {t('home.activities.title')}
          </motion.h2>
          
          <motion.div 
            className={styles.activitiesGrid}
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div className={styles.activityCard} variants={fadeInUp}>
              <div className={styles.activityIcon}>
                <svg width="48" height="48" fill="none" viewBox="0 0 48 48">
                  <path
                    d="M24 12a8 8 0 100-16 8 8 0 000 16zM8 48v-6c0-4.4 3.6-8 8-8h16c4.4 0 8 3.6 8 8v6"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className={styles.activityTitle}>{t('home.activities.organizing')}</h3>
              <p className={styles.activityDesc}>{t('home.activities.organizingDesc')}</p>
            </motion.div>

            <motion.div className={styles.activityCard} variants={fadeInUp}>
              <div className={styles.activityIcon}>
                <svg width="48" height="48" fill="none" viewBox="0 0 48 48">
                  <path
                    d="M40 8H8a4 4 0 00-4 4v24a4 4 0 004 4h32a4 4 0 004-4V12a4 4 0 00-4-4zM4 16h40M16 24h16"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className={styles.activityTitle}>{t('home.activities.advocacy')}</h3>
              <p className={styles.activityDesc}>{t('home.activities.advocacyDesc')}</p>
            </motion.div>

            <motion.div className={styles.activityCard} variants={fadeInUp}>
              <div className={styles.activityIcon}>
                <svg width="48" height="48" fill="none" viewBox="0 0 48 48">
                  <path
                    d="M24 44c11.046 0 20-8.954 20-20S35.046 4 24 4 4 12.954 4 24s8.954 20 20 20z"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M24 16v12l8 4"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className={styles.activityTitle}>{t('home.activities.training')}</h3>
              <p className={styles.activityDesc}>{t('home.activities.trainingDesc')}</p>
            </motion.div>

            <motion.div className={styles.activityCard} variants={fadeInUp}>
              <div className={styles.activityIcon}>
                <svg width="48" height="48" fill="none" viewBox="0 0 48 48">
                  <path
                    d="M24 44c11.046 0 20-8.954 20-20S35.046 4 24 4 4 12.954 4 24s8.954 20 20 20z"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M17 22l5 5 9-9"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className={styles.activityTitle}>{t('home.activities.safety')}</h3>
              <p className={styles.activityDesc}>{t('home.activities.safetyDesc')}</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className={styles.services}>
        <div className={styles.container}>
          <motion.h2 
            className={styles.sectionTitle}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {t('home.services.title')}
          </motion.h2>
          
          <motion.div 
            className={styles.servicesGrid}
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { key: 'rights', icon: '🛡️' },
              { key: 'organizing', icon: '🤝' },
              { key: 'training', icon: '📚' },
              { key: 'health', icon: '⚕️' },
              { key: 'women', icon: '👩' },
              { key: 'hiv', icon: '💊' }
            ].map((service) => (
              <motion.div key={service.key} className={styles.serviceCard} variants={fadeInUp}>
                <span className={styles.serviceIcon}>{service.icon}</span>
                <h4 className={styles.serviceTitle}>{t(`home.services.${service.key}`)}</h4>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.container}>
          <motion.div
            className={styles.ctaContent}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className={styles.ctaTitle}>{t('home.cta.title')}</h2>
            <p className={styles.ctaDescription}>
              {t('home.cta.description')}
            </p>
            <Link to="/contact">
              <Button size="lg" className={styles.ctaButton}>{t('home.cta.button')}</Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
