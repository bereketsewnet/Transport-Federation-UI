import React from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';
import { cn } from '@utils/helpers';
import styles from './FormField.module.css';

export interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  register?: UseFormRegisterReturn;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  helperText,
  required,
  register,
  className,
  id,
  ...props
}) => {
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
        id={inputId}
        className={cn(styles.input, error && styles.inputError, className)}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
        {...register}
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
};

export default FormField;

