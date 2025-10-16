import React, { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@components/Button/Button';
import { Loading } from '@components/Loading/Loading';
import styles from './FileUpload.module.css';

export interface FileUploadProps {
  onUpload: (files: File[]) => Promise<void>;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
  url?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUpload,
  accept = '*/*',
  multiple = false,
  maxSize = 10, // 10MB default
  maxFiles = 5,
  disabled = false,
  className,
  children
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return t('fileUpload.errors.fileTooLarge', { maxSize });
    }

    // Check file type if accept is specified
    if (accept !== '*/*') {
      const acceptedTypes = accept.split(',').map(type => type.trim());
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      const mimeType = file.type;
      
      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return fileExtension === type;
        }
        return mimeType.match(type.replace('*', '.*'));
      });

      if (!isAccepted) {
        return t('fileUpload.errors.invalidFileType');
      }
    }

    return null;
  };

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    // Check max files limit
    if (fileArray.length > maxFiles) {
      alert(t('fileUpload.errors.tooManyFiles', { maxFiles }));
      return;
    }

    // Validate files
    const validFiles: File[] = [];
    const errors: string[] = [];

    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      alert(errors.join('\n'));
    }

    if (validFiles.length === 0) return;

    // Create uploaded files state
    const newUploadedFiles: UploadedFile[] = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: 'uploading'
    }));

    setUploadedFiles(prev => [...prev, ...newUploadedFiles]);
    setIsUploading(true);

    try {
      await onUpload(validFiles);
      
      // Update status to success
      setUploadedFiles(prev => 
        prev.map(f => 
          newUploadedFiles.some(nf => nf.id === f.id) 
            ? { ...f, status: 'success' as const, progress: 100 }
            : f
        )
      );
    } catch (error) {
      // Update status to error
      setUploadedFiles(prev => 
        prev.map(f => 
          newUploadedFiles.some(nf => nf.id === f.id) 
            ? { 
                ...f, 
                status: 'error' as const, 
                error: error instanceof Error ? error.message : t('fileUpload.errors.uploadFailed')
              }
            : f
        )
      );
    } finally {
      setIsUploading(false);
    }
  }, [onUpload, maxSize, maxFiles, accept, t]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [disabled, handleFiles]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
    // Reset input value
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFiles]);

  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  const removeFile = useCallback((id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setUploadedFiles([]);
  }, []);

  return (
    <div className={`${styles.container} ${className || ''}`}>
      {/* Upload Area */}
      <div
        className={`${styles.uploadArea} ${isDragOver ? styles.dragOver : ''} ${disabled ? styles.disabled : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInputChange}
          className={styles.fileInput}
          disabled={disabled}
        />
        
        {children || (
          <div className={styles.uploadContent}>
            <div className={styles.uploadIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h3 className={styles.uploadTitle}>
              {t('fileUpload.title')}
            </h3>
            <p className={styles.uploadSubtitle}>
              {t('fileUpload.subtitle')}
            </p>
            <p className={styles.uploadInfo}>
              {t('fileUpload.info', { maxSize, maxFiles })}
            </p>
            <Button
              type="button"
              variant="secondary"
              disabled={disabled}
              className={styles.uploadButton}
            >
              {t('fileUpload.selectFiles')}
            </Button>
          </div>
        )}
      </div>

      {/* Uploaded Files List */}
      <AnimatePresence>
        {uploadedFiles.length > 0 && (
          <motion.div
            className={styles.filesList}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className={styles.filesHeader}>
              <h4 className={styles.filesTitle}>
                {t('fileUpload.uploadedFiles')} ({uploadedFiles.length})
              </h4>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={clearAll}
                disabled={isUploading}
              >
                {t('fileUpload.clearAll')}
              </Button>
            </div>

            <div className={styles.filesGrid}>
              {uploadedFiles.map((file) => (
                <motion.div
                  key={file.id}
                  className={`${styles.fileItem} ${styles[file.status]}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className={styles.fileIcon}>
                    {file.status === 'uploading' && <Loading size="sm" />}
                    {file.status === 'success' && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {file.status === 'error' && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>

                  <div className={styles.fileInfo}>
                    <div className={styles.fileName}>{file.file.name}</div>
                    <div className={styles.fileSize}>{formatFileSize(file.file.size)}</div>
                    {file.error && (
                      <div className={styles.fileError}>{file.error}</div>
                    )}
                  </div>

                  {file.status === 'uploading' && (
                    <div className={styles.progressBar}>
                      <div 
                        className={styles.progressFill}
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                  )}

                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    disabled={isUploading}
                    className={styles.removeButton}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUpload;
