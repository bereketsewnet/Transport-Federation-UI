import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FaUsers, FaEye, FaHeart, FaBullseye, FaSitemap, FaHandshake, FaChevronLeft, FaChevronRight, FaBook } from 'react-icons/fa';
import { Loading } from '@components/Loading/Loading';
import { getAboutContent, getExecutives } from '@api/cms-endpoints';
import { getImageUrl } from '@api/client';
import styles from './About.module.css';

// Helper function to process text and convert line break indicators to actual line breaks
const processTextWithLineBreaks = (text: string): string => {
  if (!text) return '';
  
  let processed = text;
  
  // Replace <br> or <br /> tags with newlines
  processed = processed.replace(/<br\s*\/?>/gi, '\n');
  
  // Replace /n (user typo for \n) with newlines
  processed = processed.replace(/\/n/g, '\n');
  
  // Note: We don't replace commas to avoid breaking up addresses and normal text
  // Users should use \n, /n, or <br> for explicit line breaks
  
  // Ensure \n is preserved (whiteSpace: pre-line will handle this)
  return processed;
};

export const About: React.FC = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'en' | 'am';
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<any>(null);
  const [executives, setExecutives] = useState<any[]>([]);
  const [experts, setExperts] = useState<any[]>([]);
  const [currentExpertIndex, setCurrentExpertIndex] = useState(0);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const [aboutResponse, executivesResponse, expertsResponse] = await Promise.all([
          getAboutContent(),
          getExecutives({ type: 'executive' }),
          getExecutives({ type: 'expert' }),
        ]);

        const about = aboutResponse.data.data;
        
        // Debug: Log raw API response
        console.log('Executives from API:', executivesResponse.data.data);
        console.log('Experts from API:', expertsResponse.data.data);
        
        // Helper to normalize image path
        // Backend might return: uploads/executive-123.png or executive-123.png
        // Should be: /uploads/cms/executives/executive-123.png
        const normalizeImagePath = (path: string | null | undefined): string | null => {
          if (!path) return null;
          
          // Convert backslashes to forward slashes
          let normalized = path.replace(/\\/g, '/');
          
          // Remove leading slash temporarily to process
          normalized = normalized.replace(/^\/+/, '');
          
          // Check if path needs directory structure added
          if (normalized.startsWith('executive-') || normalized.startsWith('expert-')) {
            // Just filename: executive-123.png -> uploads/cms/executives/executive-123.png
            normalized = `uploads/cms/executives/${normalized}`;
          } else if (normalized.startsWith('uploads/executive-') || normalized.startsWith('uploads/expert-')) {
            // Missing cms/executives: uploads/executive-123.png -> uploads/cms/executives/executive-123.png
            normalized = normalized.replace('uploads/', 'uploads/cms/executives/');
          } else if (!normalized.includes('cms/executives') && (normalized.includes('executive-') || normalized.includes('expert-'))) {
            // Has uploads but missing cms/executives
            if (normalized.startsWith('uploads/')) {
              normalized = normalized.replace('uploads/', 'uploads/cms/executives/');
            }
          }
          
          // Add leading slash
          return '/' + normalized;
        };
        
        // Helper to parse JSON arrays
        const parseArray = (value: any): string[] => {
          if (Array.isArray(value)) return value;
          if (typeof value === 'string') {
            try {
              const parsed = JSON.parse(value);
              return Array.isArray(parsed) ? parsed : [];
            } catch {
              return [];
            }
          }
          return [];
        };

        setContent({
          mission: { en: about.missionEn || '', am: about.missionAm || '' },
          vision: { en: about.visionEn || '', am: about.visionAm || '' },
          description: { en: about.descriptionEn || '', am: about.descriptionAm || '' },
          values: { en: parseArray(about.valuesEn), am: parseArray(about.valuesAm) },
          history: { en: about.historyEn || '', am: about.historyAm || '' },
          objectives: { en: parseArray(about.objectivesEn), am: parseArray(about.objectivesAm) },
          structure: {
            title: { en: about.structureTitleEn || '', am: about.structureTitleAm || '' },
            departments: { en: parseArray(about.structureDepartmentsEn), am: parseArray(about.structureDepartmentsAm) },
          },
          stakeholders: {
            title: { en: about.stakeholdersTitleEn || '', am: about.stakeholdersTitleAm || '' },
            list: { en: parseArray(about.stakeholdersListEn), am: parseArray(about.stakeholdersListAm) },
          },
        });
        
        // Map executives and experts with full image URLs
        const executivesWithImages = (executivesResponse.data.data || []).map((exec: any) => {
          const imagePath = exec.image || exec.photoUrl;
          const normalizedPath = normalizeImagePath(imagePath);
          return {
            ...exec,
            image: normalizedPath ? getImageUrl(normalizedPath) : null
          };
        });
        
        const expertsWithImages = (expertsResponse.data.data || []).map((expert: any) => {
          const imagePath = expert.image || expert.photoUrl;
          const normalizedPath = normalizeImagePath(imagePath);
          return {
            ...expert,
            image: normalizedPath ? getImageUrl(normalizedPath) : null
          };
        });
        
        // Debug: Log mapped data with image URLs
        console.log('Executives with images:', executivesWithImages);
        console.log('Experts with images:', expertsWithImages);
        
        setExecutives(executivesWithImages);
        setExperts(expertsWithImages);
      } catch (error) {
        console.error('Failed to load about content:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  // const cardVariants = {
  //   hidden: { opacity: 0, scale: 0.9 },
  //   visible: { opacity: 1, scale: 1 }
  // };

  // Carousel navigation
  const nextExpert = () => {
    if (experts.length > 0) {
      setCurrentExpertIndex((prev) => (prev + 1) % experts.length);
    }
  };

  const prevExpert = () => {
    if (experts.length > 0) {
      setCurrentExpertIndex((prev) => 
        prev === 0 ? experts.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!content) {
    return <div>Error loading content</div>;
  }

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
              ? 'Ethiopian Transport and Communication Workers Union Industrial Federation'
              : 'የኢትዮጵያ የትራንስፖርትና ኮሙኒኬሽን ሠራተኞች ህብረት የኢንዱስትሪ ፌዴሬሽን'}
          </motion.p>
        </div>
        <div className={styles.heroOverlay} />
      </motion.section>

      <div className={styles.content}>
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
              style={{ backgroundColor: '#F59E0B' }}
            >
              <FaBook color="white" size={20} />
            </motion.div>
            <div className={styles.sectionContent}>
              <h2 className={styles.sectionTitle}>{t('about.history')}</h2>
              <div className={styles.sectionText} style={{ whiteSpace: 'pre-line' }}>
                {processTextWithLineBreaks(content.history[lang])}
              </div>
            </div>
          </div>
          
          {/* History Images Horizontal Scroll */}
          <div className={styles.historyImagesContainer}>
            <div className={styles.historyImagesScroll}>
              <div className={styles.historyImagesTrack}>
                {/* First set of images */}
                {[
 '/history_images/10th.jpg',
                  '/history_images/9th.jpg',
                  '/history_images/8th.jpg',
                  '/history_images/7th.jpg',
                  '/history_images/6th.jpg',
                  '/history_images/5th.jpg',
                  '/history_images/4th.jpg',
                  '/history_images/3rd.jpg',
                  '/history_images/2nd.jpg',
                  '/history_images/1st.jpg',
                ].map((img, index) => (
                  <div key={`img-${index}`} className={styles.historyImageWrapper}>
                    <img 
                      src={img} 
                      alt={`History ${index + 1}`}
                      className={styles.historyImage}
                      loading="lazy"
                    />
                  </div>
                ))}
                {/* Duplicate set for seamless loop */}
                {[
                  '/history_images/10th.jpg',
                  '/history_images/9nd.jpg',
                  '/history_images/8rd.jpg',
                  '/history_images/7th.jpg',
                  '/history_images/6th.jpg',
                  '/history_images/5th.jpg',
                  '/history_images/4th.jpg',
                  '/history_images/3rd.jpg',
                  '/history_images/2nd.jpg',
                  '/history_images/1st.jpg',
                ].map((img, index) => (
                  <div key={`img-dup-${index}`} className={styles.historyImageWrapper}>
                    <img 
                      src={img} 
                      alt={`History ${index + 1}`}
                      className={styles.historyImage}
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Mission Section */}
        <motion.section
          className={`${styles.section} ${styles.missionSection}`}
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
              style={{ backgroundColor: '#3B82F6' }}
            >
              <FaBullseye color="white" size={20} />
            </motion.div>
            <div className={styles.sectionContent}>
              <h2 className={styles.sectionTitle}>{t('about.mission')}</h2>
              <p className={styles.sectionText}>{content.mission[lang]}</p>
            </div>
          </div>
        </motion.section>

        {/* Vision Section */}
        <motion.section
          className={`${styles.section} ${styles.visionSection}`}
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
              style={{ backgroundColor: '#10B981' }}
            >
              <FaEye color="white" size={20} />
            </motion.div>
            <div className={styles.sectionContent}>
              <h2 className={styles.sectionTitle}>{t('about.vision')}</h2>
              <div className={styles.sectionText} style={{ whiteSpace: 'pre-line' }}>
                {(() => {
                  const visionText = content.vision[lang] || '';
                  // If text contains bullet points on the same line (no line breaks), split them
                  if (visionText.includes('•') && !visionText.includes('\n')) {
                    return visionText.split('•').filter((item: string) => item.trim()).map((item: string, index: number) => (
                      <React.Fragment key={index}>
                        {index > 0 && '• '}
                        {item.trim()}
                        {index < visionText.split('•').filter((i: string) => i.trim()).length - 1 && <br />}
                      </React.Fragment>
                    ));
                  }
                  // Otherwise, preserve line breaks with whiteSpace: pre-line
                  return visionText;
                })()}
              </div>
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
            {content.values[lang].map((value: string, index: number) => (
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

        {/* About Us Description Section */}
        {content.description[lang] && (
          <motion.section
            className={styles.descriptionSection}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={sectionVariants}
            transition={{ duration: 0.6 }}
          >
            <div className={styles.descriptionContent}>
              {(() => {
                const descriptionText = processTextWithLineBreaks(content.description[lang]);
                if (!descriptionText) return null;
                
                // Split by first line break or newline to get first sentence/line
                const firstLineBreak = descriptionText.indexOf('\n');
                let firstLine = '';
                let restOfText = '';
                
                if (firstLineBreak > 0) {
                  // If there's a newline, use the first line as title
                  firstLine = descriptionText.substring(0, firstLineBreak).trim();
                  restOfText = descriptionText.substring(firstLineBreak + 1).trim();
                } else {
                  // If no newline, try to get first sentence (up to first period)
                  const firstPeriodIndex = descriptionText.indexOf('.');
                  if (firstPeriodIndex > 0) {
                    firstLine = descriptionText.substring(0, firstPeriodIndex + 1).trim();
                    restOfText = descriptionText.substring(firstPeriodIndex + 1).trim();
                  } else {
                    // If no period, use the whole text as title
                    firstLine = descriptionText.trim();
                    restOfText = '';
                  }
                }
                
                return (
                  <>
                    {firstLine && (
                      <h3 className={styles.descriptionTitle}>{firstLine}</h3>
                    )}
                    {restOfText && (
                      <div className={styles.descriptionText} style={{ whiteSpace: 'pre-line' }}>
                        {restOfText}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </motion.section>
        )}

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
            {content.objectives[lang].map((objective: string, index: number) => (
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
            {content.structure.departments[lang].map((dept: string, index: number) => (
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
            {executives.map((exec, index) => (
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
                    <img src={exec.image} alt={lang === 'en' ? exec.nameEn : exec.nameAm} />
                  ) : (
                    <div className={styles.executivePlaceholder}>
                      <FaUsers />
                    </div>
                  )}
                </div>
                <div className={styles.executiveInfo}>
                  <h3 className={styles.executiveName}>{lang === 'en' ? exec.nameEn : exec.nameAm}</h3>
                  <p className={styles.executivePosition}>{lang === 'en' ? exec.positionEn : exec.positionAm}</p>
                  {(exec.bioEn || exec.bioAm) && (
                    <p className={styles.executiveBio}>{lang === 'en' ? exec.bioEn : exec.bioAm}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Other Experts Carousel */}
        {experts.length > 0 && (
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
                    {experts[currentExpertIndex] && (
                      <>
                        <div className={styles.carouselImage}>
                          {experts[currentExpertIndex].image ? (
                            <img 
                              src={experts[currentExpertIndex].image} 
                              alt={lang === 'en' ? experts[currentExpertIndex].nameEn : experts[currentExpertIndex].nameAm} 
                            />
                          ) : (
                            <div className={styles.carouselPlaceholder}>
                              <FaUsers />
                            </div>
                          )}
                        </div>
                        <div className={styles.carouselInfo}>
                          <h3 className={styles.carouselName}>
                            {lang === 'en' ? experts[currentExpertIndex].nameEn : experts[currentExpertIndex].nameAm}
                          </h3>
                          <p className={styles.carouselPosition}>
                            {lang === 'en' ? experts[currentExpertIndex].positionEn : experts[currentExpertIndex].positionAm}
                          </p>
                          {(experts[currentExpertIndex].bioEn || experts[currentExpertIndex].bioAm) && (
                            <p className={styles.carouselBio}>
                              {lang === 'en' ? experts[currentExpertIndex].bioEn : experts[currentExpertIndex].bioAm}
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
              {experts.map((_, index) => (
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
            {content.stakeholders.list[lang].map((stakeholder: string, index: number) => (
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
