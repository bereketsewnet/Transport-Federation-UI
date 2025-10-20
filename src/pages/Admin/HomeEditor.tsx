import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-hot-toast';
import { Button } from '@components/Button/Button';
import { FormField } from '@components/FormField/FormField';
import { TextArea } from '@components/TextArea/TextArea';
import { Loading } from '@components/Loading/Loading';
import { getHomeContent, updateHomeContent, uploadHeroImage } from '@api/cms-endpoints';
import { getImageUrl } from '@api/client';
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
  const [loading, setLoading] = useState(true);
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [currentHeroImage, setCurrentHeroImage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<HomeFormData>({
    resolver: yupResolver(homeSchema),
  });

  // Load current content on mount
  useEffect(() => {
    const loadContent = async () => {
      try {
        const response = await getHomeContent();
        const content = response.data.data;
        
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

        // Reset form with loaded data
        reset({
          heroTitleEn: content.heroTitleEn,
          heroTitleAm: content.heroTitleAm,
          heroSubtitleEn: content.heroSubtitleEn,
          heroSubtitleAm: content.heroSubtitleAm,
          overviewEn: content.overviewEn,
          overviewAm: content.overviewAm,
          stat1Value: content.stat1Value,
          stat2Value: content.stat2Value,
          stat3Value: content.stat3Value,
          stat4Value: content.stat4Value,
        });

        setCurrentHeroImage(normalizeImagePath(content.heroImage));
      } catch (error) {
        console.error('Failed to load home content:', error);
        toast.error('Failed to load home content');
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [reset]);

  const onSubmit = async (data: HomeFormData) => {
    try {
      // Update text content
      await updateHomeContent({
        heroTitleEn: data.heroTitleEn,
        heroTitleAm: data.heroTitleAm,
        heroSubtitleEn: data.heroSubtitleEn,
        heroSubtitleAm: data.heroSubtitleAm,
        overviewEn: data.overviewEn,
        overviewAm: data.overviewAm,
        stat1Value: Number(data.stat1Value),
        stat2Value: Number(data.stat2Value),
        stat3Value: Number(data.stat3Value),
        stat4Value: Number(data.stat4Value),
      });

      // Upload hero image if selected
      if (heroImageFile) {
        const imageResponse = await uploadHeroImage(heroImageFile);
        // Normalize uploaded image path (backend might return various formats)
        let imagePath = imageResponse.data.imageUrl as string;
        // Convert backslashes to forward slashes
        imagePath = imagePath.replace(/\\/g, '/');
        // Remove leading slash temporarily
        imagePath = imagePath.replace(/^\/+/, '');
        
        // Fix directory structure if needed
        if (imagePath.startsWith('hero-')) {
          imagePath = `uploads/cms/hero/${imagePath}`;
        } else if (imagePath.startsWith('uploads/hero-')) {
          imagePath = imagePath.replace('uploads/', 'uploads/cms/hero/');
        } else if (!imagePath.includes('cms/hero') && imagePath.includes('hero-')) {
          if (imagePath.startsWith('uploads/')) {
            imagePath = imagePath.replace('uploads/', 'uploads/cms/hero/');
          }
        }
        
        // Add leading slash and convert to full URL
        const fullUrl = getImageUrl('/' + imagePath);
        setCurrentHeroImage(fullUrl);
        setHeroImageFile(null);
      }

      toast.success('Home page updated successfully!');
    } catch (error) {
      console.error('Failed to update home content:', error);
      toast.error('Failed to update home content');
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setHeroImageFile(file);
    }
  };

  if (loading) {
    return <Loading />;
  }

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

        {/* Hero Image Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Hero Image</h2>
          {currentHeroImage && (
            <div style={{ marginBottom: 'var(--spacing-4)' }}>
              <img 
                src={currentHeroImage} 
                alt="Current hero" 
                style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }} 
              />
            </div>
          )}
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageSelect}
            style={{ marginBottom: 'var(--spacing-2)' }}
          />
          {heroImageFile && (
            <p style={{ color: 'var(--color-success)', fontSize: '14px' }}>
              New image selected: {heroImageFile.name}
            </p>
          )}
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

