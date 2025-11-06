import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '@components/Button/Button';
import { Loading } from '@components/Loading/Loading';
import { getHomeContent } from '@api/cms-endpoints';
import { getImageUrl } from '@api/client';
import { FaUsers, FaHandshake, FaChalkboardTeacher, FaShieldAlt, FaBalanceScale, FaBook, FaHeartbeat, FaFemale, FaHospital } from 'react-icons/fa';
import styles from './Home.module.css';

export const Home: React.FC = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'en' | 'am';
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await getHomeContent();
        const data = response.data.data;
        // Normalize hero image path
        // Backend might return: uploads/hero-123.png or hero-123.png
        // Should be: /uploads/cms/hero/hero-123.png
        const normalizeImagePath = (p?: string | null): string | null => {
          if (!p) return null;
          
          // Convert backslashes to forward slashes
          let normalized = p.replace(/\\/g, '/');
          
          // Remove leading slash temporarily to process
          normalized = normalized.replace(/^\/+/, '');
          
          // Check if path needs directory structure added
          if (normalized.startsWith('hero-')) {
            // Just filename: hero-123.png -> uploads/cms/hero/hero-123.png
            normalized = `uploads/cms/hero/${normalized}`;
          } else if (normalized.startsWith('uploads/hero-')) {
            // Missing cms/hero: uploads/hero-123.png -> uploads/cms/hero/hero-123.png
            normalized = normalized.replace('uploads/', 'uploads/cms/hero/');
          } else if (!normalized.includes('cms/hero') && normalized.includes('hero-')) {
            // Has uploads but missing cms/hero
            if (normalized.startsWith('uploads/')) {
              normalized = normalized.replace('uploads/', 'uploads/cms/hero/');
            }
          }
          
          // Add leading slash and convert to full URL
          return getImageUrl('/' + normalized);
        };

        setContent({
          ...data,
          heroImage: normalizeImagePath(data.heroImage)
        });
      } catch (error) {
        console.error('Failed to load home content:', error);
        // Use fallback from i18n if API fails
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  if (loading) {
    return <Loading />;
  }

  // Fallback helpers for stat labels when CMS fields are empty/null
  // const stat1Label = content
  //   ? ((lang === 'en' ? content.stat1LabelEn : content.stat1LabelAm) || t('home.stats.unions'))
  //   : t('home.stats.unions');
  // const stat2Label = content
  //   ? ((lang === 'en' ? content.stat2LabelEn : content.stat2LabelAm) || t('home.stats.years'))
  //   : t('home.stats.years');
  // const stat3Label = content
  //   ? ((lang === 'en' ? content.stat3LabelEn : content.stat3LabelAm) || t('home.stats.protection'))
  //   : t('home.stats.protection');

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
      <section className={styles.hero} style={content?.heroImage ? { backgroundImage: `url(${content.heroImage})` } : undefined}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className={styles.heroText}
          >
            <h1 className={styles.heroTitle}>
              {content ? (lang === 'en' ? content.heroTitleEn : content.heroTitleAm) : t('home.hero.title')}
            </h1>
            <p className={styles.heroSubtitle}>
              {content ? (lang === 'en' ? content.heroSubtitleEn : content.heroSubtitleAm) : t('home.hero.subtitle')}
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
                {content ? content.stat2Value : '19'}
              </motion.h3>
              <p className={styles.statLabel}>
                {content ? (lang === 'en' ? content.stat2LabelEn : content.stat2LabelAm) || t('home.stats.unions') : t('home.stats.unions')}
              </p>
            </motion.div>

            <motion.div className={styles.statCard} variants={fadeInUp}>
              <motion.h3 
                className={styles.statNumber}
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", duration: 1, delay: 0.1 }}
              >
                {content ? `${content.stat3Value}+` : '50+'}
              </motion.h3>
              <p className={styles.statLabel}>
                {content ? (lang === 'en' ? content.stat3LabelEn : content.stat3LabelAm) || t('home.stats.years') : t('home.stats.years')}
              </p>
            </motion.div>

            <motion.div className={styles.statCard} variants={fadeInUp}>
              <motion.h3 
                className={styles.statNumber}
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", duration: 1, delay: 0.2 }}
              >
                {content ? `${content.stat4Value}%` : '100%'}
              </motion.h3>
              <p className={styles.statLabel}>
                {content ? (lang === 'en' ? content.stat4LabelEn : content.stat4LabelAm) || t('home.stats.protection') : t('home.stats.protection')}
              </p>
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
                <FaUsers size={48} />
              </div>
              <h3 className={styles.activityTitle}>{t('home.activities.organizing')}</h3>
              <p className={styles.activityDesc}>{t('home.activities.organizingDesc')}</p>
            </motion.div>

            <motion.div className={styles.activityCard} variants={fadeInUp}>
              <div className={styles.activityIcon}>
                <FaBalanceScale size={48} />
              </div>
              <h3 className={styles.activityTitle}>{t('home.activities.advocacy')}</h3>
              <p className={styles.activityDesc}>{t('home.activities.advocacyDesc')}</p>
            </motion.div>

            <motion.div className={styles.activityCard} variants={fadeInUp}>
              <div className={styles.activityIcon}>
                <FaChalkboardTeacher size={48} />
              </div>
              <h3 className={styles.activityTitle}>{t('home.activities.training')}</h3>
              <p className={styles.activityDesc}>{t('home.activities.trainingDesc')}</p>
            </motion.div>

            <motion.div className={styles.activityCard} variants={fadeInUp}>
              <div className={styles.activityIcon}>
                <FaShieldAlt size={48} />
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
            <motion.div className={styles.serviceCard} variants={fadeInUp}>
              <div className={styles.serviceIcon}><FaHandshake size={40} /></div>
              <h4 className={styles.serviceTitle}>{t('home.services.rights')}</h4>
            </motion.div>

            <motion.div className={styles.serviceCard} variants={fadeInUp}>
              <div className={styles.serviceIcon}><FaUsers size={40} /></div>
              <h4 className={styles.serviceTitle}>{t('home.services.organizing')}</h4>
            </motion.div>

            <motion.div className={styles.serviceCard} variants={fadeInUp}>
              <div className={styles.serviceIcon}><FaBook size={40} /></div>
              <h4 className={styles.serviceTitle}>{t('home.services.training')}</h4>
            </motion.div>

            <motion.div className={styles.serviceCard} variants={fadeInUp}>
              <div className={styles.serviceIcon}><FaHeartbeat size={40} /></div>
              <h4 className={styles.serviceTitle}>{t('home.services.health')}</h4>
            </motion.div>

            <motion.div className={styles.serviceCard} variants={fadeInUp}>
              <div className={styles.serviceIcon}><FaFemale size={40} /></div>
              <h4 className={styles.serviceTitle}>{t('home.services.women')}</h4>
            </motion.div>

            <motion.div className={styles.serviceCard} variants={fadeInUp}>
              <div className={styles.serviceIcon}><FaHospital size={40} /></div>
              <h4 className={styles.serviceTitle}>{t('home.services.hiv')}</h4>
            </motion.div>
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
