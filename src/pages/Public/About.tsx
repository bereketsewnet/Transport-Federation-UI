import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FaUsers, FaEye, FaHeart, FaHistory, FaBullseye, FaSitemap, FaHandshake, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { defaultAboutContent, loadContentFromStorage } from '@config/content';
import styles from './About.module.css';

export const About: React.FC = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'en' | 'am';
  
  // Load content with proper validation
  let content = defaultAboutContent;
  try {
    const loadedContent = loadContentFromStorage('about', defaultAboutContent);
    
    // Validate and merge loaded content
    content = {
      mission: loadedContent.mission || defaultAboutContent.mission,
      vision: loadedContent.vision || defaultAboutContent.vision,
      values: {
        en: Array.isArray(loadedContent.values?.en) ? loadedContent.values.en : defaultAboutContent.values.en,
        am: Array.isArray(loadedContent.values?.am) ? loadedContent.values.am : defaultAboutContent.values.am,
      },
      history: loadedContent.history || defaultAboutContent.history,
      objectives: {
        en: Array.isArray(loadedContent.objectives?.en) ? loadedContent.objectives.en : defaultAboutContent.objectives.en,
        am: Array.isArray(loadedContent.objectives?.am) ? loadedContent.objectives.am : defaultAboutContent.objectives.am,
      },
      structure: {
        title: loadedContent.structure?.title || defaultAboutContent.structure.title,
        departments: {
          en: Array.isArray(loadedContent.structure?.departments?.en) ? loadedContent.structure.departments.en : defaultAboutContent.structure.departments.en,
          am: Array.isArray(loadedContent.structure?.departments?.am) ? loadedContent.structure.departments.am : defaultAboutContent.structure.departments.am,
        }
      },
      stakeholders: {
        title: loadedContent.stakeholders?.title || defaultAboutContent.stakeholders.title,
        list: {
          en: Array.isArray(loadedContent.stakeholders?.list?.en) ? loadedContent.stakeholders.list.en : defaultAboutContent.stakeholders.list.en,
          am: Array.isArray(loadedContent.stakeholders?.list?.am) ? loadedContent.stakeholders.list.am : defaultAboutContent.stakeholders.list.am,
        }
      },
      executives: Array.isArray(loadedContent.executives) ? loadedContent.executives : defaultAboutContent.executives,
      otherExperts: Array.isArray(loadedContent.otherExperts) ? loadedContent.otherExperts : [],
    };
  } catch (error) {
    console.error('Error loading about content, using defaults:', error);
    // Clear corrupted data
    localStorage.removeItem('tcwf_content_about');
    content = defaultAboutContent;
  }
  
  const [currentExpertIndex, setCurrentExpertIndex] = useState(0);

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 }
  };

  // Carousel navigation
  const nextExpert = () => {
    if (content.otherExperts.length > 0) {
      setCurrentExpertIndex((prev) => (prev + 1) % content.otherExperts.length);
    }
  };

  const prevExpert = () => {
    if (content.otherExperts.length > 0) {
      setCurrentExpertIndex((prev) => 
        prev === 0 ? content.otherExperts.length - 1 : prev - 1
      );
    }
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
          <motion.h1 
            className={styles.heroTitle}
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {t('about.title')}
          </motion.h1>
          <motion.p 
            className={styles.heroSubtitle}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {lang === 'en' 
              ? 'Industrial Federation of Transport and Communication Trade Unions'
              : 'የትራንስፖርትና መገናኛ ሠራተኞች ማኅበራት ኢንዱስትሪ ፌዴሬሽን'}
          </motion.p>
        </div>
        <div className={styles.heroOverlay} />
      </motion.section>

      <div className={styles.content}>
        {/* Mission Section */}
        <motion.section
          className={styles.section}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionVariants}
          transition={{ duration: 0.6 }}
        >
          <div className={styles.sectionGrid}>
            <motion.div 
              className={styles.iconBadge}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <FaBullseye />
            </motion.div>
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
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionVariants}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className={styles.sectionGrid}>
            <motion.div 
              className={styles.iconBadge}
              whileHover={{ scale: 1.1, rotate: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <FaEye />
            </motion.div>
            <div className={styles.sectionContent}>
              <h2 className={styles.sectionTitle}>{t('about.vision')}</h2>
              <p className={styles.sectionText}>{content.vision[lang]}</p>
            </div>
          </div>
        </motion.section>

        {/* Values Section */}
        <motion.section
          className={`${styles.section} ${styles.valuesSection}`}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionVariants}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className={styles.sectionHeader}>
            <FaHeart className={styles.sectionHeaderIcon} />
            <h2 className={styles.sectionTitle}>{t('about.values')}</h2>
          </div>
          <div className={styles.valuesList}>
            {content.values[lang].map((value, index) => (
              <motion.div
                key={index}
                className={styles.valueCard}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)" }}
              >
                <div className={styles.valueIcon}>{index + 1}</div>
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
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionVariants}
          transition={{ duration: 0.6 }}
        >
          <div className={styles.sectionGrid}>
            <motion.div 
              className={styles.iconBadge}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <FaHistory />
            </motion.div>
            <div className={styles.sectionContent}>
              <h2 className={styles.sectionTitle}>{t('about.history')}</h2>
              <p className={styles.sectionText}>{content.history[lang]}</p>
            </div>
          </div>
        </motion.section>

        {/* Objectives Section */}
        <motion.section
          className={`${styles.section} ${styles.objectivesSection}`}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionVariants}
          transition={{ duration: 0.6 }}
        >
          <div className={styles.sectionHeader}>
            <FaBullseye className={styles.sectionHeaderIcon} />
            <h2 className={styles.sectionTitle}>{t('about.objectives')}</h2>
          </div>
          <div className={styles.objectivesList}>
            {content.objectives[lang].map((objective, index) => (
              <motion.div
                key={index}
                className={styles.objectiveCard}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ x: 10, boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)" }}
              >
                <div className={styles.objectiveNumber}>{index + 1}</div>
                <p className={styles.objectiveText}>{objective}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Structure Section */}
        <motion.section
          className={`${styles.section} ${styles.structureSection}`}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionVariants}
          transition={{ duration: 0.6 }}
        >
          <div className={styles.sectionHeader}>
            <FaSitemap className={styles.sectionHeaderIcon} />
            <h2 className={styles.sectionTitle}>{content.structure.title[lang]}</h2>
          </div>
          <div className={styles.departmentsList}>
            {content.structure.departments[lang].map((dept, index) => (
              <motion.div
                key={index}
                className={styles.departmentCard}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className={styles.departmentNumber}>{index + 1}</div>
                <p className={styles.departmentText}>{dept}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Executives Section */}
        <motion.section
          className={`${styles.section} ${styles.executivesSection}`}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionVariants}
          transition={{ duration: 0.6 }}
        >
          <div className={styles.sectionHeader}>
            <FaUsers className={styles.sectionHeaderIcon} />
            <h2 className={styles.sectionTitle}>{t('about.executives')}</h2>
          </div>
          <div className={styles.executivesGrid}>
            {content.executives.map((exec, index) => (
              <motion.div
                key={exec.id}
                className={styles.executiveCard}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                whileHover={{ y: -8, boxShadow: "0 15px 40px rgba(0, 0, 0, 0.2)" }}
              >
                <div className={styles.executiveImage}>
                  {exec.image ? (
                    <img src={exec.image} alt={exec.name[lang]} />
                  ) : (
                    <div className={styles.executivePlaceholder}>
                      <FaUsers />
                    </div>
                  )}
                </div>
                <div className={styles.executiveInfo}>
                  <h3 className={styles.executiveName}>{exec.name[lang]}</h3>
                  <p className={styles.executivePosition}>{exec.position[lang]}</p>
                  {exec.bio && (
                    <p className={styles.executiveBio}>{exec.bio[lang]}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Other Experts Carousel */}
        {content.otherExperts.length > 0 && (
          <motion.section
            className={`${styles.section} ${styles.carouselSection}`}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={sectionVariants}
            transition={{ duration: 0.6 }}
          >
            <div className={styles.sectionHeader}>
              <FaUsers className={styles.sectionHeaderIcon} />
              <h2 className={styles.sectionTitle}>{t('about.otherExperts')}</h2>
            </div>
            <div className={styles.carousel}>
              <button 
                className={`${styles.carouselBtn} ${styles.carouselBtnPrev}`}
                onClick={prevExpert}
                aria-label="Previous expert"
              >
                <FaChevronLeft />
              </button>
              
              <div className={styles.carouselContent}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentExpertIndex}
                    className={styles.carouselCard}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.4 }}
                  >
                    {content.otherExperts[currentExpertIndex] && (
                      <>
                        <div className={styles.carouselImage}>
                          {content.otherExperts[currentExpertIndex].image ? (
                            <img 
                              src={content.otherExperts[currentExpertIndex].image} 
                              alt={content.otherExperts[currentExpertIndex].name[lang]} 
                            />
                          ) : (
                            <div className={styles.carouselPlaceholder}>
                              <FaUsers />
                            </div>
                          )}
                        </div>
                        <div className={styles.carouselInfo}>
                          <h3 className={styles.carouselName}>
                            {content.otherExperts[currentExpertIndex].name[lang]}
                          </h3>
                          <p className={styles.carouselPosition}>
                            {content.otherExperts[currentExpertIndex].position[lang]}
                          </p>
                          {content.otherExperts[currentExpertIndex].bio && (
                            <p className={styles.carouselBio}>
                              {content.otherExperts[currentExpertIndex].bio[lang]}
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              <button 
                className={`${styles.carouselBtn} ${styles.carouselBtnNext}`}
                onClick={nextExpert}
                aria-label="Next expert"
              >
                <FaChevronRight />
              </button>
            </div>
            
            {/* Carousel indicators */}
            <div className={styles.carouselIndicators}>
              {content.otherExperts.map((_, index) => (
                <button
                  key={index}
                  className={`${styles.indicator} ${index === currentExpertIndex ? styles.indicatorActive : ''}`}
                  onClick={() => setCurrentExpertIndex(index)}
                  aria-label={`Go to expert ${index + 1}`}
                />
              ))}
            </div>
          </motion.section>
        )}

        {/* Stakeholders Section */}
        <motion.section
          className={`${styles.section} ${styles.stakeholdersSection}`}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionVariants}
          transition={{ duration: 0.6 }}
        >
          <div className={styles.sectionHeader}>
            <FaHandshake className={styles.sectionHeaderIcon} />
            <h2 className={styles.sectionTitle}>{content.stakeholders.title[lang]}</h2>
          </div>
          <div className={styles.stakeholdersList}>
            {content.stakeholders.list[lang].map((stakeholder, index) => (
              <motion.div
                key={index}
                className={styles.stakeholderCard}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                whileHover={{ scale: 1.03, boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)" }}
              >
                <div className={styles.stakeholderIcon}>
                  <FaHandshake />
                </div>
                <p className={styles.stakeholderText}>{stakeholder}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default About;
