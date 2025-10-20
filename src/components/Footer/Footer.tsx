import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@components/Button/Button';
import { getContactInfo } from '@api/cms-endpoints';
import styles from './Footer.module.css';

export const Footer: React.FC = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'en' | 'am';
  const currentYear = new Date().getFullYear();
  const [contactInfo, setContactInfo] = useState<any>(null);

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const response = await getContactInfo();
        setContactInfo(response.data.data);
      } catch (error) {
        console.error('Failed to load contact info for footer:', error);
      }
    };
    fetchContactInfo();
  }, []);

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* About Section */}
          <div className={styles.section}>
            <h3 className={styles.title}>Transport & Communication Workers Federation</h3>
            <p className={styles.description}>
              Empowering workers in the transport and communication sectors across Ethiopia.
            </p>
          </div>

          {/* Quick Links */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>{t('nav.home')}</h4>
            <nav className={styles.links}>
              <Link to="/" className={styles.link}>
                {t('nav.home')}
              </Link>
              <Link to="/about" className={styles.link}>
                {t('nav.about')}
              </Link>
              <Link to="/news" className={styles.link}>
                {t('nav.news')}
              </Link>
              <Link to="/gallery" className={styles.link}>
                {t('nav.gallery')}
              </Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>{t('contact.title')}</h4>
            <div className={styles.contact}>
              <p>{contactInfo ? (lang === 'en' ? contactInfo.addressEn : contactInfo.addressAm) : 'Loading...'}</p>
              {contactInfo && (
                <>
                  <p>
                    {contactInfo.phone}
                    {contactInfo.phone2 && <><br /> {contactInfo.phone2}</>}
                  </p>
                  <p>{contactInfo.email}</p>
                </>
              )}
            </div>
            <Link to="/contact">
              <Button size="sm" className={styles.contactButton}>
                {t('contact.title')}
              </Button>
            </Link>
          </div>

          {/* Social Media */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Follow Us</h4>
            <div className={styles.social}>
              {contactInfo?.facebookUrl && (
                <a href={contactInfo.facebookUrl} target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Facebook">
                  <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
              )}
              {contactInfo?.twitterUrl && (
                <a href={contactInfo.twitterUrl} target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Twitter">
                  <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </a>
              )}
              {contactInfo?.linkedinUrl && (
                <a href={contactInfo.linkedinUrl} target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="LinkedIn">
                  <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              )}
              {contactInfo?.telegramUrl && (
                <a href={contactInfo.telegramUrl} target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Telegram">
                  <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                </a>
              )}
              {contactInfo?.youtubeUrl && (
                <a href={contactInfo.youtubeUrl} target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="YouTube">
                  <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {currentYear} Transport & Communication Workers Federation. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

