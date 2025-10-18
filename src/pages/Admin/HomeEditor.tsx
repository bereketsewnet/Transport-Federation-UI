import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button } from '@components/Button/Button';
import { FormField } from '@components/FormField/FormField';
import { TextArea } from '@components/TextArea/TextArea';
import styles from './HomeEditor.module.css';

const homeSchema = yup.object({
  heroTitleEn: yup.string().required('Hero title (English) is required'),
  heroTitleAm: yup.string().required('Hero title (Amharic) is required'),
  heroSubtitleEn: yup.string().required('Hero subtitle (English) is required'),
  heroSubtitleAm: yup.string().required('Hero subtitle (Amharic) is required'),
  overviewEn: yup.string().required('Overview (English) is required'),
  overviewAm: yup.string().required('Overview (Amharic) is required'),
  stat1Value: yup.number().positive().required('Stat 1 value is required'),
  stat2Value: yup.number().positive().required('Stat 2 value is required'),
  stat3Value: yup.number().positive().required('Stat 3 value is required'),
  stat4Value: yup.number().positive().required('Stat 4 value is required'),
});

interface HomeFormData {
  heroTitleEn: string;
  heroTitleAm: string;
  heroSubtitleEn: string;
  heroSubtitleAm: string;
  overviewEn: string;
  overviewAm: string;
  stat1Value: number;
  stat2Value: number;
  stat3Value: number;
  stat4Value: number;
}

export const HomeEditor: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<HomeFormData>({
    resolver: yupResolver(homeSchema),
    defaultValues: {
      heroTitleEn: 'Transport & Communication Workers Federation',
      heroTitleAm: 'የትራንስፖርትና መገናኛ ሠራተኞች ማኅበራት ፌዴሬሽን',
      heroSubtitleEn: 'Empowering workers across Ethiopia\'s transport and communication sectors',
      heroSubtitleAm: 'በኢትዮጵያ የትራንስፖርትና መገናኛ ዘርፎች ሠራተኞችን የማብቃት',
      overviewEn: 'The Industrial Federation of Transport and Communication Trade Unions was re-established in November 1974...',
      overviewAm: 'የትራንስፖርትና መገናኛ ሠራተኞች ማኅበራት ኢንዱስትሪ ፌዴሬሽን ህዳር ቀን 1974 ዓ.ም...',
      stat1Value: 1250,
      stat2Value: 19,
      stat3Value: 50,
      stat4Value: 100,
    },
  });

  const onSubmit = async (data: HomeFormData) => {
    console.log('Home page data:', data);
    
    // Here you would typically:
    // 1. Save the form data to your backend
    // 2. Update the translation files
    
    alert('Home page updated successfully!');
  };

  return (
    <div className={styles.homeEditor}>
      <div className={styles.header}>
        <h1 className={styles.title}>Home Page Editor</h1>
        <p className={styles.subtitle}>Manage your home page content and hero image</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
        {/* Hero Text Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Hero Section</h2>
          
          <div className={styles.languageGrid}>
            <div>
              <h3 className={styles.langTitle}>English</h3>
              <FormField
                label="Hero Title"
                register={register('heroTitleEn')}
                error={errors.heroTitleEn?.message}
                placeholder="Enter hero title in English"
              />
              <TextArea
                label="Hero Subtitle"
                register={register('heroSubtitleEn')}
                error={errors.heroSubtitleEn?.message}
                placeholder="Enter hero subtitle in English"
                rows={3}
              />
            </div>

            <div>
              <h3 className={styles.langTitle}>አማርኛ (Amharic)</h3>
              <FormField
                label="የጀግና ርዕስ"
                register={register('heroTitleAm')}
                error={errors.heroTitleAm?.message}
                placeholder="በአማርኛ የጀግና ርዕስ ያስገቡ"
              />
              <TextArea
                label="የጀግና ንዑስ ርዕስ"
                register={register('heroSubtitleAm')}
                error={errors.heroSubtitleAm?.message}
                placeholder="በአማርኛ የጀግና ንዑስ ርዕስ ያስገቡ"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Statistics</h2>
          <div className={styles.statsGrid}>
            <FormField
              type="number"
              label="Active Members"
              register={register('stat1Value')}
              error={errors.stat1Value?.message}
              placeholder="1250"
            />
            <FormField
              type="number"
              label="Worker Unions"
              register={register('stat2Value')}
              error={errors.stat2Value?.message}
              placeholder="19"
            />
            <FormField
              type="number"
              label="Years of Service"
              register={register('stat3Value')}
              error={errors.stat3Value?.message}
              placeholder="50"
            />
            <FormField
              type="number"
              label="Protection Rate (%)"
              register={register('stat4Value')}
              error={errors.stat4Value?.message}
              placeholder="100"
            />
          </div>
        </div>

        {/* Overview Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Overview Section</h2>
          
          <div className={styles.languageGrid}>
            <div>
              <h3 className={styles.langTitle}>English</h3>
              <TextArea
                label="Overview Content"
                register={register('overviewEn')}
                error={errors.overviewEn?.message}
                placeholder="Enter overview content in English..."
                rows={6}
              />
            </div>

            <div>
              <h3 className={styles.langTitle}>አማርኛ (Amharic)</h3>
              <TextArea
                label="የአጠቃላይ እይታ ይዘት"
                register={register('overviewAm')}
                error={errors.overviewAm?.message}
                placeholder="በአማርኛ የአጠቃላይ እይታ ይዘት ያስገቡ..."
                rows={6}
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className={styles.actions}>
          <Button type="submit" disabled={isSubmitting} size="lg">
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button type="button" variant="secondary" size="lg">
            Preview
          </Button>
        </div>
      </form>
    </div>
  );
};

export default HomeEditor;

