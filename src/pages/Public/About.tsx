import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { defaultAboutContent, loadContentFromStorage } from '@config/content';
import styles from './About.module.css';

export const About: React.FC = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'en' | 'am';
  const content = loadContentFromStorage('about', defaultAboutContent);

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <motion.section
        className={styles.hero}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>{t('about.title')}</h1>
          <p className={styles.heroSubtitle}>
            {t('common.welcome')} {import.meta.env.VITE_APP_NAME}
          </p>
        </div>
        <div className={styles.heroOverlay} />
      </motion.section>

      <div className={styles.content}>
        {/* Mission Section */}
        <motion.section
          className={styles.section}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={sectionVariants}
        >
          <div className={styles.sectionGrid}>
            <div className={styles.sectionIcon}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div className={styles.sectionContent}>
              <h2 className={styles.sectionTitle}>{t('about.mission')}</h2>
              <p className={styles.sectionText}>{content.mission[lang]}</p>
            </div>
          </div>
        </motion.section>

        {/* Vision Section */}
        <motion.section
          className={styles.section}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={sectionVariants}
          transition={{ delay: 0.2 }}
        >
          <div className={styles.sectionGrid}>
            <div className={styles.sectionIcon}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div className={styles.sectionContent}>
              <h2 className={styles.sectionTitle}>{t('about.vision')}</h2>
              <p className={styles.sectionText}>{content.vision[lang]}</p>
            </div>
          </div>
        </motion.section>

        {/* Values Section */}
        <motion.section
          className={styles.section}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={sectionVariants}
          transition={{ delay: 0.4 }}
        >
          <h2 className={styles.sectionTitle}>{t('about.values')}</h2>
          <div className={styles.valuesList}>
            {content.values[lang].map((value, index) => (
              <motion.div
                key={index}
                className={styles.valueCard}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className={styles.valueIcon}>✓</div>
                <p className={styles.valueText}>{value}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* History Section */}
        <motion.section
          className={styles.section}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={sectionVariants}
          transition={{ delay: 0.6 }}
        >
          <div className={styles.sectionGrid}>
            <div className={styles.sectionIcon}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className={styles.sectionContent}>
              <h2 className={styles.sectionTitle}>{t('about.history')}</h2>
              <p className={styles.sectionText}>{content.history[lang]}</p>
            </div>
          </div>
        </motion.section>

        {/* Objectives Section */}
        <motion.section
          className={styles.section}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={sectionVariants}
          transition={{ delay: 0.8 }}
        >
          <h2 className={styles.sectionTitle}>{t('about.objectives')}</h2>
          <div className={styles.objectivesList}>
            {content.objectives[lang].map((objective, index) => (
              <motion.div
                key={index}
                className={styles.objectiveCard}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <div className={styles.objectiveNumber}>{index + 1}</div>
                <p className={styles.objectiveText}>{objective}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default About;

