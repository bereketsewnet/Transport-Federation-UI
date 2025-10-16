import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { defaultAboutContent, loadContentFromStorage, saveContentToStorage, AboutContent } from '@config/content';
import { Button } from '@components/Button/Button';
import { TextArea } from '@components/TextArea/TextArea';
import styles from './AboutEditor.module.css';

type Language = 'en' | 'am';

export const AboutEditor: React.FC = () => {
  const { t } = useTranslation();
  const [currentLang, setCurrentLang] = useState<Language>('en');
  const [saved, setSaved] = useState(false);
  
  const content = loadContentFromStorage('about', defaultAboutContent);

  const { register, handleSubmit } = useForm({
    defaultValues: content,
  });

  // TODO: Fix TypeScript issues with dynamic field names
  // const { fields: valueFields, append: appendValue, remove: removeValue } = useFieldArray({
  //   control,
  //   name: `values.${currentLang}` as any,
  // });

  // const { fields: objectiveFields, append: appendObjective, remove: removeObjective } = useFieldArray({
  //   control,
  //   name: `objectives.${currentLang}` as any,
  // });

  const onSubmit = (data: AboutContent) => {
    saveContentToStorage('about', data);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className={styles.container}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>{t('about.title')} Content Editor</h1>
            <p className={styles.subtitle}>Edit About Us page content</p>
          </div>
          {saved && (
            <div className={styles.savedBadge}>
              ✓ {t('messages.updateSuccess')}
            </div>
          )}
        </div>

        {/* Language Tabs */}
        <div className={styles.langTabs}>
          <button
            type="button"
            className={`${styles.langTab} ${currentLang === 'en' ? styles.active : ''}`}
            onClick={() => setCurrentLang('en')}
          >
            English
          </button>
          <button
            type="button"
            className={`${styles.langTab} ${currentLang === 'am' ? styles.active : ''}`}
            onClick={() => setCurrentLang('am')}
          >
            አማርኛ (Amharic)
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          {/* Mission */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>{t('about.mission')}</h3>
            <TextArea
              {...register(`mission.${currentLang}`)}
              rows={4}
              placeholder="Enter mission statement..."
            />
          </div>

          {/* Vision */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>{t('about.vision')}</h3>
            <TextArea
              {...register(`vision.${currentLang}`)}
              rows={4}
              placeholder="Enter vision statement..."
            />
          </div>

          {/* Values */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>{t('about.values')}</h3>
            {/* TODO: Fix TypeScript issues with dynamic field arrays */}
            <TextArea
              {...register(`values.${currentLang}`)}
              rows={4}
              placeholder="Enter values (one per line)..."
            />
          </div>

          {/* History */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>{t('about.history')}</h3>
            <TextArea
              {...register(`history.${currentLang}`)}
              rows={6}
              placeholder="Enter history..."
            />
          </div>

          {/* Objectives */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>{t('about.objectives')}</h3>
            {/* TODO: Fix TypeScript issues with dynamic field arrays */}
            <TextArea
              {...register(`objectives.${currentLang}`)}
              rows={6}
              placeholder="Enter objectives (one per line)..."
            />
          </div>

          <div className={styles.formActions}>
            <Button type="submit" size="lg">
              {t('common.save')} Changes
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AboutEditor;

