import React, { useState } from 'react';
import { Modal } from '../Modal/Modal';
import { Button } from '../Button/Button';
import { FormField } from '../FormField/FormField';
import styles from './TerminateDialog.module.css';

export interface TerminateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { termination_reason: string; terminated_date: string }) => void;
  unionName?: string;
  isLoading?: boolean;
}

export const TerminateDialog: React.FC<TerminateDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  unionName = '',
  isLoading = false,
}) => {
  const [terminationReason, setTerminationReason] = useState('');
  const [terminatedDate, setTerminatedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [errors, setErrors] = useState<{ reason?: string; date?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: { reason?: string; date?: string } = {};
    if (!terminationReason.trim()) {
      newErrors.reason = 'Termination reason is required';
    }
    if (!terminatedDate) {
      newErrors.date = 'Termination date is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onConfirm({
      termination_reason: terminationReason.trim(),
      terminated_date: terminatedDate,
    });
  };

  const handleClose = () => {
    setTerminationReason('');
    setTerminatedDate(new Date().toISOString().split('T')[0]);
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Terminate Union"
      size="md"
      showCloseButton={!isLoading}
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.content}>
          <p className={styles.message}>
            Are you sure you want to terminate <strong>{unionName}</strong>? 
            This will move the union to the Terminated Unions list.
          </p>

          <div className={styles.fields}>
            <div className={styles.field}>
              <label className={styles.label}>
                Termination Reason *
                {errors.reason && <span className={styles.errorText}> - {errors.reason}</span>}
              </label>
              <textarea
                value={terminationReason}
                onChange={(e) => {
                  setTerminationReason(e.target.value);
                  if (errors.reason) {
                    setErrors((prev) => ({ ...prev, reason: undefined }));
                  }
                }}
                placeholder="Enter the reason for termination"
                rows={4}
                className={`${styles.textarea} ${errors.reason ? styles.textareaError : ''}`}
              />
            </div>

            <FormField
              label="Termination Date *"
              type="date"
              value={terminatedDate}
              onChange={(e) => {
                setTerminatedDate(e.target.value);
                if (errors.date) {
                  setErrors((prev) => ({ ...prev, date: undefined }));
                }
              }}
              error={errors.date}
              required
              className={styles.field}
            />
          </div>
        </div>

        <div className={styles.actions}>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="danger"
            isLoading={isLoading}
          >
            Terminate Union
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TerminateDialog;

