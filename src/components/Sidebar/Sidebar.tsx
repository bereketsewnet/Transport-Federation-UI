import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@hooks/useAuth';
import { cn } from '@utils/helpers';
import styles from './Sidebar.module.css';

interface MenuItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { user } = useAuth();
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 1024);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Member menu items - only dashboard and change password
  const memberMenuItems: MenuItem[] = [
    {
      path: '/member/dashboard',
      label: 'My Profile',
      icon: (
        <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
          <path
            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
            fill="currentColor"
          />
        </svg>
      ),
    },
    {
      path: '/member/change-password',
      label: 'Change Password',
      icon: (
        <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
            fill="currentColor"
          />
        </svg>
      ),
    },
  ];

  // Admin menu items - full access
  const adminMenuItems: MenuItem[] = [
    {
      path: '/admin/dashboard',
      label: t('nav.dashboard'),
      icon: (
        <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
          <path
            d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
            fill="currentColor"
          />
        </svg>
      ),
    },
    {
      path: '/admin/reports',
      label: t('nav.reports'),
      icon: (
        <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
          <path
            d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"
            fill="currentColor"
          />
        </svg>
      ),
    },
    {
      path: '/admin/members',
      label: t('nav.members'),
      icon: (
        <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
          <path
            d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"
            fill="currentColor"
          />
        </svg>
      ),
    },
    {
      path: '/admin/unions',
      label: t('nav.unions'),
      icon: (
        <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
          <path
            d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm0 6h6v2H7v-2z"
            fill="currentColor"
          />
        </svg>
      ),
    },
    {
      path: '/admin/executives',
      label: t('nav.executives'),
      icon: (
        <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
          <path
            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
            fill="currentColor"
          />
        </svg>
      ),
    },
    {
      path: '/admin/cbas',
      label: t('nav.cbas'),
      icon: (
        <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
          <path
            d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"
            fill="currentColor"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h6a1 1 0 100-2H7zm0 4a1 1 0 100 2h6a1 1 0 100-2H7z"
            fill="currentColor"
          />
        </svg>
      ),
    },
    {
      path: '/admin/archives',
      label: t('nav.archives'),
      icon: (
        <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
          <path
            d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z"
            fill="currentColor"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"
            fill="currentColor"
          />
        </svg>
      ),
    },
    {
      path: '/admin/terminated-unions',
      label: t('nav.terminatedUnions'),
      icon: (
        <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            fill="currentColor"
          />
        </svg>
      ),
    },
    {
      path: '/admin/news',
      label: t('nav.news'),
      icon: (
        <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
          <path
            d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z"
            fill="currentColor"
          />
          <path
            d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z"
            fill="currentColor"
          />
        </svg>
      ),
    },
    {
      path: '/admin/gallery',
      label: t('nav.gallery'),
      icon: (
        <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
            fill="currentColor"
          />
        </svg>
      ),
    },
    {
      path: '/admin/contacts',
      label: 'Contact Forms',
      icon: (
        <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
          <path
            d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"
            fill="currentColor"
          />
          <path
            d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"
            fill="currentColor"
          />
        </svg>
      ),
    },
    {
      path: '/admin/about-editor',
      label: 'About Editor',
      icon: (
        <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
          <path
            d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
            fill="currentColor"
          />
        </svg>
      ),
    },
    {
      path: '/admin/test-form',
      label: '🧪 Test Form',
      icon: (
        <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
          <path
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            fill="currentColor"
          />
        </svg>
      ),
    },
    {
      path: '/admin/simple-test',
      label: '🔧 Simple Test',
      icon: (
        <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
          <path
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            fill="currentColor"
          />
        </svg>
      ),
    },
  ];

  // Determine which menu to show based on user role
  const menuItems = user?.role === 'member' ? memberMenuItems : adminMenuItems;
  const panelTitle = user?.role === 'member' ? 'Member Portal' : 'Admin Panel';

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && isMobile && (
        <div
          className={styles.overlay}
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(styles.sidebar, isOpen && styles.open)}
      >
        <div className={styles.header}>
          <h2 className={styles.title}>{panelTitle}</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close sidebar">
            <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
              <path d="M6 6L14 14M6 14L14 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <nav className={styles.nav}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(styles.navItem, isActive(item.path) && styles.active)}
              onClick={onClose}
            >
              <span className={styles.icon}>{item.icon}</span>
              <span className={styles.label}>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;

