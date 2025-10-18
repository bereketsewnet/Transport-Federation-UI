import React, { forwardRef } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';
import { cn } from '@utils/helpers';
import styles from './TextArea.module.css';

export interface TextAreaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'required'> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  register?: UseFormRegisterReturn;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(({ 
  label,
  error,
  helperText,
  required,
  className,
  id,
  rows = 4,
  register,
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
        {...register}
        ref={(element) => {
          if (register && typeof register.ref === 'function') {
            register.ref(element);
          }
          if (typeof ref === 'function') {
            ref(element);
          } else if (ref && 'current' in (ref as any)) {
            (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = element;
          }
        }}
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

