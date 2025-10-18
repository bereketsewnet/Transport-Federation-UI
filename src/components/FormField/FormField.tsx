import React, { forwardRef } from 'react';
import { cn } from '@utils/helpers';
import styles from './FormField.module.css';

export interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(({
  label,
  error,
  helperText,
  required,
  className,
  id,
  ...props
}, ref) => {
  const inputId = id || `field-${Math.random().toString(36).substring(7)}`;

  return (
    <div className={styles.formField}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={cn(styles.input, error && styles.inputError, className)}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
        {...props}
      />
      {error && (
        <span id={`${inputId}-error`} className={styles.error} role="alert">
          {error}
        </span>
      )}
      {!error && helperText && (
        <span id={`${inputId}-helper`} className={styles.helper}>
          {helperText}
        </span>
      )}
    </div>
  );
});

FormField.displayName = 'FormField';

export default FormField;

