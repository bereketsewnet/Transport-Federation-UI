import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { getContacts, deleteContact, Contact } from '@api/endpoints';
import { ConfirmDialog } from '@components/ConfirmDialog/ConfirmDialog';
import { toast } from 'react-hot-toast';
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
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; contact: Contact | null }>({
    isOpen: false,
    contact: null,
  });
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

  const handleDelete = async () => {
    if (!deleteDialog.contact) return;

    try {
      await deleteContact(deleteDialog.contact.id);
      toast.success('Contact deleted successfully');
      setDeleteDialog({ isOpen: false, contact: null });
      await loadContacts();
    } catch (error) {
      console.error('Failed to delete contact:', error);
      toast.error('Failed to delete contact');
    }
  };

  const actions = (row: Contact) => (
    <>
      <Button size="sm" variant="secondary" onClick={() => setSelectedContact(row)}>
        {t('common.view')}
      </Button>
      <Button 
        size="sm" 
        variant="danger" 
        onClick={() => setDeleteDialog({ isOpen: true, contact: row })}
      >
        Delete
      </Button>
    </>
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, contact: null })}
        onConfirm={handleDelete}
        title="Delete Contact Submission"
        message={`Are you sure you want to delete the contact submission from ${deleteDialog.contact?.name}?`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default ContactManager;

