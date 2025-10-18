import React, { forwardRef } from 'react';
import { cn } from '@utils/helpers';
import styles from './TextArea.module.css';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(({
  label,
  error,
  helperText,
  required,
  className,
  id,
  rows = 4,
  ...props
}, ref) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substring(7)}`;

  return (
    <div className={styles.textareaField}>
      {label && (
        <label htmlFor={textareaId} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={cn(styles.textarea, error && styles.textareaError, className)}
        aria-invalid={!!error}
        aria-describedby={
          error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined
        }
        {...props}
      />
      {error && (
        <span id={`${textareaId}-error`} className={styles.error} role="alert">
          {error}
        </span>
      )}
      {!error && helperText && (
        <span id={`${textareaId}-helper`} className={styles.helper}>
          {helperText}
        </span>
      )}
    </div>
  );
});

TextArea.displayName = 'TextArea';

export default TextArea;

