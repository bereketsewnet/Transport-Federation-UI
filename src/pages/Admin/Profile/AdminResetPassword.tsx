import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@hooks/useAuth';
import { FaArrowLeft, FaCheckCircle, FaKey, FaUser, FaLock } from 'react-icons/fa';
import { Button } from '@components/Button/Button';
import { FormField } from '@components/FormField/FormField';
import { TextArea } from '@components/TextArea/TextArea';
import {
  forgotPasswordStep1,
  forgotPasswordStep2,
} from '@api/endpoints';
import { toast } from 'react-hot-toast';
import styles from './AdminResetPassword.module.css';

type Step = 'username' | 'questions' | 'success';

interface UsernameFormData {
  username: string;
}

interface ResetFormData {
  newPassword: string;
  confirmPassword: string;
}

const usernameSchema = yup.object({
  username: yup.string().required('Username is required'),
});

const resetPasswordSchema = yup.object({
  newPassword: yup
    .string()
    .required('New password is required')
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('newPassword')], 'Passwords must match'),
});

export const AdminResetPassword: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>('username');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [username, setUsername] = useState<string>(user?.username || '');
  const [securityQuestions, setSecurityQuestions] = useState<Array<{ questionId: number; question: string }>>([]);
  const [securityAnswers, setSecurityAnswers] = useState<string[]>(['', '', '']);

  const {
    register: registerUsername,
    handleSubmit: handleSubmitUsername,
    formState: { errors: usernameErrors },
  } = useForm<UsernameFormData>({
    resolver: yupResolver(usernameSchema),
    defaultValues: {
      username: user?.username || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
  } = useForm<ResetFormData>({
    resolver: yupResolver(resetPasswordSchema),
  });

  // Step 1: Submit username and get security questions
  const onSubmitUsername = async (data: UsernameFormData) => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await forgotPasswordStep1({ username: data.username });
      
      setUsername(data.username);
      setSecurityQuestions(response.data.securityQuestions);
      setSecurityAnswers(['', '', '']); // Reset answers
      setCurrentStep('questions');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || t('adminProfile.resetPasswordError');
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Submit security answers and new password (combined)
  const onSubmitResetPassword = async (data: ResetFormData) => {
    // Validate all questions are answered
    const unanswered = securityAnswers.find(answer => !answer.trim());
    if (unanswered !== undefined) {
      setError(t('adminProfile.answerAllQuestions'));
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      await forgotPasswordStep2({
        username,
        answers: securityAnswers,
        newPassword: data.newPassword,
      });
      
      setCurrentStep('success');
      toast.success(t('adminProfile.resetPasswordSuccess'));
    } catch (err: any) {
      // Provide specific error messages based on response
      let errorMessage = t('adminProfile.resetPasswordError');
      
      if (err.response?.status === 401) {
        errorMessage = err.response?.data?.message || t('adminProfile.incorrectAnswers');
      } else if (err.response?.status === 400) {
        errorMessage = err.response?.data?.message || t('adminProfile.invalidRequest');
      } else if (err.response?.status === 404) {
        errorMessage = t('adminProfile.usernameNotFound');
      } else {
        errorMessage = err.response?.data?.message || t('adminProfile.resetPasswordError');
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (index: number, value: string) => {
    setSecurityAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[index] = value;
      return newAnswers;
    });
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.iconContainer}>
            <FaKey className={styles.keyIcon} />
          </div>
          <h1 className={styles.title}>
            {currentStep === 'success' ? t('adminProfile.resetPasswordSuccessTitle') : t('adminProfile.resetPassword')}
          </h1>
          <p className={styles.subtitle}>
            {currentStep === 'username' && t('adminProfile.enterUsername')}
            {currentStep === 'questions' && t('adminProfile.answerQuestions')}
            {currentStep === 'success' && t('adminProfile.passwordResetComplete')}
          </p>
        </div>

        {/* Progress Indicator */}
        {currentStep !== 'success' && (
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <motion.div
                className={styles.progressFill}
                initial={{ width: '0%' }}
                animate={{
                  width: currentStep === 'username' ? '50%' : '100%',
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className={styles.progressSteps}>
              <div className={`${styles.step} ${currentStep === 'username' ? styles.active : styles.completed}`}>
                <FaUser />
              </div>
              <div className={`${styles.step} ${currentStep === 'questions' ? styles.active : ''}`}>
                <FaLock />
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              className={styles.errorBanner}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {/* Step 1: Username */}
          {currentStep === 'username' && (
            <motion.form
              key="username"
              onSubmit={handleSubmitUsername(onSubmitUsername)}
              className={styles.form}
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
              noValidate
            >
              <FormField
                label={t('adminProfile.username')}
                placeholder={t('adminProfile.enterUsernamePlaceholder')}
                error={usernameErrors.username?.message}
                register={registerUsername('username')}
                autoComplete="username"
              />

              <Button type="submit" fullWidth isLoading={isLoading}>
                {t('auth.continueButton')}
              </Button>
            </motion.form>
          )}

          {/* Step 2: Security Questions + New Password */}
          {currentStep === 'questions' && (
            <motion.form
              key="questions"
              onSubmit={handleSubmitPassword(onSubmitResetPassword)}
              className={styles.form}
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
              noValidate
            >
              <div className={styles.questionsContainer}>
                {securityQuestions.map((question, index) => (
                  <div key={question.questionId} className={styles.questionBlock}>
                    <label className={styles.questionLabel}>
                      {t('adminProfile.question')} {index + 1}: {question.question}
                    </label>
                    <TextArea
                      value={securityAnswers[index] || ''}
                      onChange={(e) => handleAnswerChange(index, e.target.value)}
                      placeholder={t('adminProfile.answerPlaceholder')}
                      rows={2}
                    />
                  </div>
                ))}
              </div>

              <FormField
                type="password"
                label={t('adminProfile.newPassword')}
                placeholder={t('adminProfile.newPasswordPlaceholder')}
                error={passwordErrors.newPassword?.message}
                register={registerPassword('newPassword')}
                autoComplete="new-password"
              />

              <FormField
                type="password"
                label={t('adminProfile.confirmPassword')}
                placeholder={t('adminProfile.confirmPasswordPlaceholder')}
                error={passwordErrors.confirmPassword?.message}
                register={registerPassword('confirmPassword')}
                autoComplete="new-password"
              />

              <div className={styles.formActions}>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setCurrentStep('username');
                    setError('');
                  }}
                >
                  <FaArrowLeft /> {t('common.back')}
                </Button>
                <Button type="submit" isLoading={isLoading}>
                  {t('adminProfile.resetPassword')}
                </Button>
              </div>
            </motion.form>
          )}

          {/* Success */}
          {currentStep === 'success' && (
            <motion.div
              key="success"
              className={styles.successContainer}
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className={styles.successIcon}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                <FaCheckCircle />
              </motion.div>
              <p className={styles.successMessage}>
                {t('adminProfile.resetPasswordSuccessMessage')}
              </p>
              <div className={styles.successActions}>
                <Button variant="secondary" onClick={() => navigate('/admin/profile')}>
                  {t('common.back')}
                </Button>
                <Button fullWidth onClick={() => navigate('/login')}>
                  {t('adminProfile.goToLogin')}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default AdminResetPassword;

