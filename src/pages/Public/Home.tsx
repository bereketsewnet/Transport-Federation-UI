import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '@components/Button/Button';
import styles from './Home.module.css';

export const Home: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.home}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className={styles.heroTitle}>
              Transport & Communication Workers Federation
            </h1>
            <p className={styles.heroSubtitle}>
              Empowering workers across Ethiopia's transport and communication sectors
            </p>
            <div className={styles.heroActions}>
              <Link to="/about">
                <Button size="lg">{t('nav.about')}</Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="secondary">
                  {t('contact.title')}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
        <div className={styles.heroImage}>
          <div className={styles.heroImagePlaceholder}>
            <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
              <circle cx="100" cy="100" r="80" fill="var(--primary-subtle)" />
              <path
                d="M100 40L60 70v60l40 30 40-30V70L100 40z"
                stroke="var(--primary)"
                strokeWidth="4"
                fill="none"
              />
            </svg>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.stats}>
        <div className={styles.container}>
          <div className={styles.statsGrid}>
            <motion.div
              className={styles.statCard}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <h3 className={styles.statNumber}>1,250+</h3>
              <p className={styles.statLabel}>Active Members</p>
            </motion.div>

            <motion.div
              className={styles.statCard}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <h3 className={styles.statNumber}>15</h3>
              <p className={styles.statLabel}>Worker Unions</p>
            </motion.div>

            <motion.div
              className={styles.statCard}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <h3 className={styles.statNumber}>20+</h3>
              <p className={styles.statLabel}>Years of Service</p>
            </motion.div>

            <motion.div
              className={styles.statCard}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <h3 className={styles.statNumber}>100%</h3>
              <p className={styles.statLabel}>Worker Rights Protected</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>What We Do</h2>
          <div className={styles.featuresGrid}>
            <motion.div
              className={styles.featureCard}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <div className={styles.featureIcon}>
                <svg width="40" height="40" fill="none" viewBox="0 0 40 40">
                  <path
                    d="M20 5v30M35 20H5"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Collective Bargaining</h3>
              <p className={styles.featureDescription}>
                Negotiating fair wages and working conditions for all members
              </p>
            </motion.div>

            <motion.div
              className={styles.featureCard}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className={styles.featureIcon}>
                <svg width="40" height="40" fill="none" viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r="15" stroke="currentColor" strokeWidth="3" />
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Member Support</h3>
              <p className={styles.featureDescription}>
                Providing legal support and representation for workers
              </p>
            </motion.div>

            <motion.div
              className={styles.featureCard}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className={styles.featureIcon}>
                <svg width="40" height="40" fill="none" viewBox="0 0 40 40">
                  <rect
                    x="5"
                    y="10"
                    width="30"
                    height="20"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Training & Development</h3>
              <p className={styles.featureDescription}>
                Offering skill development and capacity building programs
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.container}>
          <motion.div
            className={styles.ctaContent}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className={styles.ctaTitle}>Join Us Today</h2>
            <p className={styles.ctaDescription}>
              Be part of a growing community working towards better rights and conditions
            </p>
            <Link to="/contact">
              <Button size="lg">Contact Us</Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;

