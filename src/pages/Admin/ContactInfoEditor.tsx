import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Button } from '@components/Button/Button';
import { FormField } from '@components/FormField/FormField';
import { TextArea } from '@components/TextArea/TextArea';
import { Loading } from '@components/Loading/Loading';
import { getContactInfo, updateContactInfo } from '@api/cms-endpoints';
import styles from './ContactManager.module.css';

type Language = 'en' | 'am';

export const ContactInfoEditor: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [currentLang, setCurrentLang] = useState<Language>('en');
  const [saved, setSaved] = useState(false);
  
  const [contactInfo, setContactInfo] = useState({
    address: { en: '', am: '' },
    phone: '',
    phone2: '',
    email: '',
    fax: '',
    poBox: '',
    mapUrl: '',
    latitude: null as number | null,
    longitude: null as number | null,
    facebookUrl: '',
    twitterUrl: '',
    linkedinUrl: '',
    telegramUrl: '',
    youtubeUrl: '',
    workingHours: { en: '', am: '' },
  });

  // Load contact info on mount
  useEffect(() => {
    const loadContactInfo = async () => {
      try {
        const response = await getContactInfo();
        const data = response.data.data;
        
        if (data) {
          setContactInfo({
            address: { 
              en: data.addressEn || '', 
              am: data.addressAm || '' 
            },
            phone: data.phone || '',
            phone2: data.phone2 || '',
            email: data.email || '',
            fax: data.fax || '',
            poBox: data.poBox || '',
            mapUrl: data.mapUrl || '',
            latitude: data.latitude || null,
            longitude: data.longitude || null,
            facebookUrl: data.facebookUrl || '',
            twitterUrl: data.twitterUrl || '',
            linkedinUrl: data.linkedinUrl || '',
            telegramUrl: data.telegramUrl || '',
            youtubeUrl: data.youtubeUrl || '',
            workingHours: {
              en: data.workingHoursEn || '',
              am: data.workingHoursAm || '',
            },
          });
        }
      } catch (error) {
        console.error('Failed to load contact info:', error);
        toast.error('Failed to load contact information. Using default values.');
      } finally {
        setLoading(false);
      }
    };

    loadContactInfo();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateContactInfo({
        addressEn: contactInfo.address.en,
        addressAm: contactInfo.address.am,
        phone: contactInfo.phone,
        phone2: contactInfo.phone2 || undefined,
        email: contactInfo.email,
        fax: contactInfo.fax || undefined,
        poBox: contactInfo.poBox || undefined,
        mapUrl: contactInfo.mapUrl || undefined,
        latitude: contactInfo.latitude || undefined,
        longitude: contactInfo.longitude || undefined,
        facebookUrl: contactInfo.facebookUrl || undefined,
        twitterUrl: contactInfo.twitterUrl || undefined,
        linkedinUrl: contactInfo.linkedinUrl || undefined,
        telegramUrl: contactInfo.telegramUrl || undefined,
        youtubeUrl: contactInfo.youtubeUrl || undefined,
        workingHoursEn: contactInfo.workingHours.en || undefined,
        workingHoursAm: contactInfo.workingHours.am || undefined,
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      toast.success('Contact information updated successfully!');
    } catch (error) {
      console.error('Failed to update contact info:', error);
      toast.error('Failed to update contact information');
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className={styles.container}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Contact Information Editor</h1>
            <p className={styles.subtitle}>Manage organization contact details</p>
          </div>
          {saved && (
            <motion.div 
              className={styles.savedBadge}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              ✓ {t('messages.updateSuccess')}
            </motion.div>
          )}
        </div>

        {/* Language Tabs */}
        <div style={{ marginBottom: 'var(--spacing-6)', display: 'flex', gap: 'var(--spacing-2)' }}>
          <button
            type="button"
            onClick={() => setCurrentLang('en')}
            style={{
              padding: 'var(--spacing-3) var(--spacing-6)',
              border: '1px solid var(--color-border)',
              background: currentLang === 'en' ? 'var(--color-primary)' : 'white',
              color: currentLang === 'en' ? 'white' : 'var(--color-text)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontWeight: '500',
            }}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setCurrentLang('am')}
            style={{
              padding: 'var(--spacing-3) var(--spacing-6)',
              border: '1px solid var(--color-border)',
              background: currentLang === 'am' ? 'var(--color-primary)' : 'white',
              color: currentLang === 'am' ? 'white' : 'var(--color-text)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontWeight: '500',
            }}
          >
            አማርኛ (Amharic)
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Address Section */}
          <div style={{ marginBottom: 'var(--spacing-6)' }}>
            <h3 style={{ marginBottom: 'var(--spacing-4)', fontSize: '1.25rem', fontWeight: '600' }}>
              Address
            </h3>
            <TextArea
              label={`Address (${currentLang === 'en' ? 'English' : 'Amharic'})`}
              value={contactInfo.address[currentLang]}
              onChange={(e) => setContactInfo(prev => ({
                ...prev,
                address: { ...prev.address, [currentLang]: e.target.value }
              }))}
              rows={3}
              placeholder={`Enter address in ${currentLang === 'en' ? 'English' : 'Amharic'}...`}
            />
          </div>

          {/* Contact Numbers */}
          <div style={{ marginBottom: 'var(--spacing-6)' }}>
            <h3 style={{ marginBottom: 'var(--spacing-4)', fontSize: '1.25rem', fontWeight: '600' }}>
              Contact Numbers
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-4)' }}>
              <FormField
                label="Primary Phone"
                value={contactInfo.phone}
                onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+251-11-XXX-XXXX"
              />
              <FormField
                label="Secondary Phone (Optional)"
                value={contactInfo.phone2}
                onChange={(e) => setContactInfo(prev => ({ ...prev, phone2: e.target.value }))}
                placeholder="+251-11-YYY-YYYY"
              />
              <FormField
                label="Fax (Optional)"
                value={contactInfo.fax}
                onChange={(e) => setContactInfo(prev => ({ ...prev, fax: e.target.value }))}
                placeholder="+251-11-ZZZ-ZZZZ"
              />
            </div>
          </div>

          {/* Email & PO Box */}
          <div style={{ marginBottom: 'var(--spacing-6)' }}>
            <h3 style={{ marginBottom: 'var(--spacing-4)', fontSize: '1.25rem', fontWeight: '600' }}>
              Email & Postal
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-4)' }}>
              <FormField
                type="email"
                label="Email Address"
                value={contactInfo.email}
                onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                placeholder="info@example.org"
              />
              <FormField
                label="P.O. Box (Optional)"
                value={contactInfo.poBox}
                onChange={(e) => setContactInfo(prev => ({ ...prev, poBox: e.target.value }))}
                placeholder="P.O. Box 1234"
              />
            </div>
          </div>

          {/* Location */}
          <div style={{ marginBottom: 'var(--spacing-6)' }}>
            <h3 style={{ marginBottom: 'var(--spacing-4)', fontSize: '1.25rem', fontWeight: '600' }}>
              Location
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-4)' }}>
              <FormField
                label="Map URL (Optional)"
                value={contactInfo.mapUrl}
                onChange={(e) => setContactInfo(prev => ({ ...prev, mapUrl: e.target.value }))}
                placeholder="https://maps.google.com/..."
              />
              <FormField
                type="number"
                step="any"
                label="Latitude (Optional)"
                value={contactInfo.latitude?.toString() || ''}
                onChange={(e) => setContactInfo(prev => ({ 
                  ...prev, 
                  latitude: e.target.value ? Number(e.target.value) : null 
                }))}
                placeholder="9.0320"
              />
              <FormField
                type="number"
                step="any"
                label="Longitude (Optional)"
                value={contactInfo.longitude?.toString() || ''}
                onChange={(e) => setContactInfo(prev => ({ 
                  ...prev, 
                  longitude: e.target.value ? Number(e.target.value) : null 
                }))}
                placeholder="38.7469"
              />
            </div>
          </div>

          {/* Social Media */}
          <div style={{ marginBottom: 'var(--spacing-6)' }}>
            <h3 style={{ marginBottom: 'var(--spacing-4)', fontSize: '1.25rem', fontWeight: '600' }}>
              Social Media Links
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-4)' }}>
              <FormField
                label="Facebook URL (Optional)"
                value={contactInfo.facebookUrl}
                onChange={(e) => setContactInfo(prev => ({ ...prev, facebookUrl: e.target.value }))}
                placeholder="https://facebook.com/..."
              />
              <FormField
                label="Twitter URL (Optional)"
                value={contactInfo.twitterUrl}
                onChange={(e) => setContactInfo(prev => ({ ...prev, twitterUrl: e.target.value }))}
                placeholder="https://twitter.com/..."
              />
              <FormField
                label="LinkedIn URL (Optional)"
                value={contactInfo.linkedinUrl}
                onChange={(e) => setContactInfo(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                placeholder="https://linkedin.com/company/..."
              />
              <FormField
                label="Telegram URL (Optional)"
                value={contactInfo.telegramUrl}
                onChange={(e) => setContactInfo(prev => ({ ...prev, telegramUrl: e.target.value }))}
                placeholder="https://t.me/..."
              />
              <FormField
                label="YouTube URL (Optional)"
                value={contactInfo.youtubeUrl}
                onChange={(e) => setContactInfo(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                placeholder="https://youtube.com/..."
              />
            </div>
          </div>

          {/* Working Hours */}
          <div style={{ marginBottom: 'var(--spacing-6)' }}>
            <h3 style={{ marginBottom: 'var(--spacing-4)', fontSize: '1.25rem', fontWeight: '600' }}>
              Working Hours
            </h3>
            <TextArea
              label={`Working Hours (${currentLang === 'en' ? 'English' : 'Amharic'})`}
              value={contactInfo.workingHours[currentLang]}
              onChange={(e) => setContactInfo(prev => ({
                ...prev,
                workingHours: { ...prev.workingHours, [currentLang]: e.target.value }
              }))}
              rows={2}
              placeholder={`e.g., Monday - Friday: 8:30 AM - 5:00 PM`}
            />
          </div>

          {/* Submit Button */}
          <div style={{ display: 'flex', gap: 'var(--spacing-4)' }}>
            <Button type="submit" size="lg">
              Save Changes
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ContactInfoEditor;

