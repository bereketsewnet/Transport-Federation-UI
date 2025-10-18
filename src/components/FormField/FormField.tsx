import React, { forwardRef } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';
import { cn } from '@utils/helpers';
import styles from './FormField.module.css';

export interface FormFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'required'> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  register?: UseFormRegisterReturn;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(({ 
  label,
  error,
  helperText,
  required,
  className,
  id,
  register,
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
        // Spread react-hook-form register handlers/name first so consumer props can override if needed
        {...register}
        ref={(element) => {
          // Pass element to react-hook-form
          if (register && typeof register.ref === 'function') {
            register.ref(element);
          }
          // Also forward ref to parent if provided
          if (typeof ref === 'function') {
            ref(element);
          } else if (ref && 'current' in (ref as any)) {
            (ref as React.MutableRefObject<HTMLInputElement | null>).current = element;
          }
        }}
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

