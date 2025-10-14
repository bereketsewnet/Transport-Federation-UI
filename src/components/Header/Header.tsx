import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import useAuth from '@hooks/useAuth';
import styles from './Header.module.css';

export const Header: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'am' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo */}
        <Link to="/" className={styles.logo} onClick={closeMobileMenu}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="6" fill="var(--primary)" />
            <path
              d="M16 8L8 12V20L16 24L24 20V12L16 8Z"
              stroke="white"
              strokeWidth="2"
              fill="none"
            />
          </svg>
          <span className={styles.logoText}>TCWF</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className={styles.desktopNav}>
          <Link to="/" className={styles.navLink}>
            {t('nav.home')}
          </Link>
          <Link to="/about" className={styles.navLink}>
            {t('nav.about')}
          </Link>
          <Link to="/news" className={styles.navLink}>
            {t('nav.news')}
          </Link>
          <Link to="/gallery" className={styles.navLink}>
            {t('nav.gallery')}
          </Link>
          <Link to="/contact" className={styles.navLink}>
            {t('nav.contact')}
          </Link>
        </nav>

        {/* Actions */}
        <div className={styles.actions}>
          <button onClick={toggleLanguage} className={styles.langButton} aria-label="Switch language">
            {i18n.language === 'en' ? 'አማ' : 'EN'}
          </button>

          {isAuthenticated ? (
            <div className={styles.userMenu}>
              <button
                className={styles.userButton}
                onClick={() => navigate('/admin/dashboard')}
              >
                {user?.username}
              </button>
              <button onClick={handleLogout} className={styles.logoutButton}>
                {t('auth.logout')}
              </button>
            </div>
          ) : (
            <Link to="/login" className={styles.loginButton}>
              {t('auth.login')}
            </Link>
          )}

          {/* Mobile menu button */}
          <button
            className={styles.mobileMenuButton}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              {mobileMenuOpen ? (
                <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              ) : (
                <>
                  <path d="M4 6H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className={styles.mobileMenu}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <nav className={styles.mobileNav}>
              <Link to="/" className={styles.mobileNavLink} onClick={closeMobileMenu}>
                {t('nav.home')}
              </Link>
              <Link to="/about" className={styles.mobileNavLink} onClick={closeMobileMenu}>
                {t('nav.about')}
              </Link>
              <Link to="/news" className={styles.mobileNavLink} onClick={closeMobileMenu}>
                {t('nav.news')}
              </Link>
              <Link to="/gallery" className={styles.mobileNavLink} onClick={closeMobileMenu}>
                {t('nav.gallery')}
              </Link>
              <Link to="/contact" className={styles.mobileNavLink} onClick={closeMobileMenu}>
                {t('nav.contact')}
              </Link>
              {isAuthenticated && (
                <>
                  <Link to="/admin/dashboard" className={styles.mobileNavLink} onClick={closeMobileMenu}>
                    {t('nav.dashboard')}
                  </Link>
                  <button onClick={handleLogout} className={styles.mobileLogoutButton}>
                    {t('auth.logout')}
                  </button>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;

