import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaGlobe, FaFacebook, FaTwitter, FaLinkedin, FaTelegram, FaYoutube, FaClock, FaSave } from 'react-icons/fa';
import { Button } from '@components/Button/Button';
import { FormField } from '@components/FormField/FormField';
import { TextArea } from '@components/TextArea/TextArea';
import { Loading } from '@components/Loading/Loading';
import { getContactInfo, updateContactInfo } from '@api/cms-endpoints';
import styles from './ContactInfoEditor.module.css';

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
    <div className={styles.contactInfoEditor}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Contact Information Editor</h1>
            <p className={styles.subtitle}>Manage organization contact details and social media</p>
          </div>
          {saved && (
            <motion.div 
              className={styles.savedBadge}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              ✓ Saved Successfully
            </motion.div>
          )}
        </div>

        {/* Language Tabs */}
        <div className={styles.langTabs}>
          <button
            type="button"
            onClick={() => setCurrentLang('en')}
            className={`${styles.langTab} ${currentLang === 'en' ? styles.active : ''}`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setCurrentLang('am')}
            className={`${styles.langTab} ${currentLang === 'am' ? styles.active : ''}`}
          >
            አማርኛ (Amharic)
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Address Section */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <FaMapMarkerAlt className={styles.sectionIcon} />
              <h3 className={styles.sectionTitle}>Address</h3>
            </div>
            <div className={styles.formGridFull}>
              <TextArea
                label={`Address (${currentLang === 'en' ? 'English' : 'Amharic'})`}
                value={contactInfo.address[currentLang]}
                onChange={(e) => setContactInfo(prev => ({
                  ...prev,
                  address: { ...prev.address, [currentLang]: e.target.value }
                }))}
                rows={3}
                placeholder={`Enter full address in ${currentLang === 'en' ? 'English' : 'Amharic'}...`}
              />
            </div>
          </div>

          {/* Contact Numbers */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <FaPhone className={styles.sectionIcon} />
              <h3 className={styles.sectionTitle}>Contact Numbers</h3>
            </div>
            <div className={styles.formGrid}>
              <FormField
                label="Primary Phone *"
                value={contactInfo.phone}
                onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+251-11-XXX-XXXX"
                required
              />
              <FormField
                label="Secondary Phone"
                value={contactInfo.phone2}
                onChange={(e) => setContactInfo(prev => ({ ...prev, phone2: e.target.value }))}
                placeholder="+251-11-YYY-YYYY"
              />
              <FormField
                label="Fax"
                value={contactInfo.fax}
                onChange={(e) => setContactInfo(prev => ({ ...prev, fax: e.target.value }))}
                placeholder="+251-11-ZZZ-ZZZZ"
              />
            </div>
          </div>

          {/* Email & PO Box */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <FaEnvelope className={styles.sectionIcon} />
              <h3 className={styles.sectionTitle}>Email & Postal</h3>
            </div>
            <div className={styles.formGrid}>
              <FormField
                type="email"
                label="Email Address *"
                value={contactInfo.email}
                onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                placeholder="info@example.org"
                required
              />
              <FormField
                label="P.O. Box"
                value={contactInfo.poBox}
                onChange={(e) => setContactInfo(prev => ({ ...prev, poBox: e.target.value }))}
                placeholder="P.O. Box 1234"
              />
            </div>
          </div>

          {/* Location */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <FaGlobe className={styles.sectionIcon} />
              <h3 className={styles.sectionTitle}>Location & Map</h3>
            </div>
            <div className={styles.formGrid}>
              <FormField
                label="Google Maps URL"
                value={contactInfo.mapUrl}
                onChange={(e) => setContactInfo(prev => ({ ...prev, mapUrl: e.target.value }))}
                placeholder="https://maps.google.com/..."
              />
              <FormField
                type="number"
                step="any"
                label="Latitude"
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
                label="Longitude"
                value={contactInfo.longitude?.toString() || ''}
                onChange={(e) => setContactInfo(prev => ({ 
                  ...prev, 
                  longitude: e.target.value ? Number(e.target.value) : null 
                }))}
                placeholder="38.7469"
              />
            </div>
            <div className={styles.infoBox}>
              <p>💡 Tip: Get coordinates by right-clicking on Google Maps and selecting "What's here?"</p>
            </div>
          </div>

          {/* Social Media */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <FaGlobe className={styles.sectionIcon} />
              <h3 className={styles.sectionTitle}>Social Media Links</h3>
            </div>
            <div className={styles.socialGrid}>
              <div className={styles.socialField}>
                <FormField
                  label={<span><FaFacebook className={styles.socialIcon + ' ' + styles.facebook} /> Facebook</span>}
                  value={contactInfo.facebookUrl}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, facebookUrl: e.target.value }))}
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div className={styles.socialField}>
                <FormField
                  label={<span><FaTwitter className={styles.socialIcon + ' ' + styles.twitter} /> Twitter</span>}
                  value={contactInfo.twitterUrl}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, twitterUrl: e.target.value }))}
                  placeholder="https://twitter.com/..."
                />
              </div>
              <div className={styles.socialField}>
                <FormField
                  label={<span><FaLinkedin className={styles.socialIcon + ' ' + styles.linkedin} /> LinkedIn</span>}
                  value={contactInfo.linkedinUrl}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                  placeholder="https://linkedin.com/company/..."
                />
              </div>
              <div className={styles.socialField}>
                <FormField
                  label={<span><FaTelegram className={styles.socialIcon + ' ' + styles.telegram} /> Telegram</span>}
                  value={contactInfo.telegramUrl}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, telegramUrl: e.target.value }))}
                  placeholder="https://t.me/..."
                />
              </div>
              <div className={styles.socialField}>
                <FormField
                  label={<span><FaYoutube className={styles.socialIcon + ' ' + styles.youtube} /> YouTube</span>}
                  value={contactInfo.youtubeUrl}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                  placeholder="https://youtube.com/..."
                />
              </div>
            </div>
          </div>

          {/* Working Hours */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <FaClock className={styles.sectionIcon} />
              <h3 className={styles.sectionTitle}>Working Hours</h3>
            </div>
            <div className={styles.formGridFull}>
              <TextArea
                label={`Working Hours (${currentLang === 'en' ? 'English' : 'Amharic'})`}
                value={contactInfo.workingHours[currentLang]}
                onChange={(e) => setContactInfo(prev => ({
                  ...prev,
                  workingHours: { ...prev.workingHours, [currentLang]: e.target.value }
                }))}
                rows={3}
                placeholder={currentLang === 'en' 
                  ? 'e.g., Monday - Friday: 8:30 AM - 5:00 PM\nSaturday: 9:00 AM - 1:00 PM\nSunday: Closed'
                  : 'ምሳሌ: ሰኞ - አርብ: 8:30 ጠዋት - 5:00 ከሰዓት'
                }
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className={styles.actions}>
            <Button type="submit" size="lg" className={styles.saveButton}>
              <FaSave /> Save Changes
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ContactInfoEditor;

