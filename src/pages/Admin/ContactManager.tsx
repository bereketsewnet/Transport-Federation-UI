import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { getContacts, Contact } from '@api/endpoints';
import { DataTable, Column } from '@components/DataTable/DataTable';
import { useTable } from '@hooks/useTable';
import { Button } from '@components/Button/Button';
import { Modal } from '@components/Modal/Modal';
import styles from './ContactManager.module.css';

export const ContactManager: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const { page, per_page, setPage, setPerPage } = useTable();
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    loadContacts();
  }, [page, per_page]);

  const loadContacts = async () => {
    setIsLoading(true);
    try {
      const response = await getContacts({ page, per_page });
      setContacts(response.data.data);
      setTotalPages(response.data.meta?.total_pages || 1);
      setTotalItems(response.data.meta?.total || 0);
    } catch (error) {
      console.error('Failed to load contacts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString(i18n.language, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const columns: Column<Contact>[] = [
    {
      key: 'name',
      label: t('contact.name'),
      sortable: true,
    },
    {
      key: 'email_or_phone',
      label: t('contact.emailOrPhone'),
    },
    {
      key: 'subject',
      label: t('contact.subject'),
      render: (val) => {
        const subject = String(val || '');
        return subject.length > 40 ? subject.substring(0, 40) + '...' : subject;
      },
    },
    {
      key: 'created_at',
      label: t('common.date'),
      sortable: true,
      render: (val) => formatDate(val as string),
    },
  ];

  const actions = (row: Contact) => (
    <Button size="sm" onClick={() => setSelectedContact(row)}>
      {t('common.view')}
    </Button>
  );

  return (
    <div className={styles.container}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>{t('contact.title')} Submissions</h1>
            <p className={styles.subtitle}>
              View and manage contact form submissions
            </p>
          </div>
        </div>

        <div className={styles.infoBox}>
          <div className={styles.infoIcon}>ℹ️</div>
          <div>
            <h3>Contact Information Settings</h3>
            <p>
              To update company contact info (address, phone, email), edit the <code>.env</code> file:
            </p>
            <pre className={styles.codeBlock}>
{`VITE_CONTACT_ADDRESS=Your Address
VITE_CONTACT_PHONE=+251-11-XXX-XXXX
VITE_CONTACT_EMAIL=info@yourorg.org
VITE_CONTACT_MAP_URL=https://...`}
            </pre>
            <p><small>Then restart the dev server for changes to take effect.</small></p>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={contacts}
          isLoading={isLoading}
          actions={actions}
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          perPage={per_page}
          onPageChange={setPage}
          onPerPageChange={setPerPage}
          emptyMessage="No contact submissions yet"
        />
      </motion.div>

      {/* View Contact Modal */}
      <Modal
        isOpen={selectedContact !== null}
        onClose={() => setSelectedContact(null)}
        title="Contact Submission"
      >
        {selectedContact && (
          <div className={styles.contactDetail}>
            <div className={styles.detailRow}>
              <strong>{t('contact.name')}:</strong>
              <span>{selectedContact.name}</span>
            </div>
            <div className={styles.detailRow}>
              <strong>{t('contact.emailOrPhone')}:</strong>
              <span>{selectedContact.email_or_phone}</span>
            </div>
            <div className={styles.detailRow}>
              <strong>{t('contact.subject')}:</strong>
              <span>{selectedContact.subject}</span>
            </div>
            <div className={styles.detailRow}>
              <strong>{t('common.date')}:</strong>
              <span>{formatDate(selectedContact.created_at)}</span>
            </div>
            <div className={styles.messageSection}>
              <strong>{t('contact.message')}:</strong>
              <p className={styles.messageText}>{selectedContact.message}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ContactManager;

