import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCheckCircle, FaKey, FaUser, FaLock } from 'react-icons/fa';
import { Button } from '@components/Button/Button';
import { FormField } from '@components/FormField/FormField';
import { TextArea } from '@components/TextArea/TextArea';
import {
  forgotPasswordStep1,
  forgotPasswordStep2,
} from '@api/endpoints';
import styles from './ForgotPassword.module.css';

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

export const ForgotPassword: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>('username');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [securityQuestions, setSecurityQuestions] = useState<Array<{ questionId: number; question: string }>>([]);
  const [securityAnswers, setSecurityAnswers] = useState<string[]>(['', '', '']);

  const {
    register: registerUsername,
    handleSubmit: handleSubmitUsername,
    formState: { errors: usernameErrors },
  } = useForm<UsernameFormData>({
    resolver: yupResolver(usernameSchema),
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
      setError(err.response?.data?.message || 'User not found or no security questions set');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Submit security answers and new password (combined)
  const onSubmitResetPassword = async (data: ResetFormData) => {
    // Validate all questions are answered
    const unanswered = securityAnswers.find(answer => !answer.trim());
    if (unanswered !== undefined) {
      setError('Please answer all security questions');
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
    } catch (err: any) {
      // Provide specific error messages based on response
      if (err.response?.status === 401) {
        const message = err.response?.data?.message || 'Incorrect security answers';
        setError(message + '. Please make sure your answers match exactly what you set up.');
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.message || 'Invalid request. Please check all fields.');
      } else if (err.response?.status === 404) {
        setError('Username not found. Please contact your administrator.');
      } else {
        setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
      }
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
            {currentStep === 'success' ? 'Password Reset Successful' : 'Forgot Password'}
          </h1>
          <p className={styles.subtitle}>
            {currentStep === 'username' && 'Enter your username to reset your password'}
            {currentStep === 'questions' && 'Answer your security questions and create a new password'}
            {currentStep === 'success' && 'Your password has been reset'}
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
                label="Username"
                placeholder="Enter your username"
                error={usernameErrors.username?.message}
                register={registerUsername('username')}
                autoComplete="username"
              />

              <Button type="submit" fullWidth isLoading={isLoading}>
                Continue
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
                      Question {index + 1}: {question.question}
                    </label>
                    <TextArea
                      value={securityAnswers[index] || ''}
                      onChange={(e) => handleAnswerChange(index, e.target.value)}
                      placeholder="Your answer..."
                      rows={2}
                    />
                  </div>
                ))}
              </div>

              <FormField
                type="password"
                label="New Password"
                placeholder="Enter new password (min 6 characters)"
                error={passwordErrors.newPassword?.message}
                register={registerPassword('newPassword')}
                autoComplete="new-password"
              />

              <FormField
                type="password"
                label="Confirm Password"
                placeholder="Confirm new password"
                error={passwordErrors.confirmPassword?.message}
                register={registerPassword('confirmPassword')}
                autoComplete="new-password"
              />

              <div className={styles.formActions}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCurrentStep('username');
                    setError('');
                  }}
                >
                  <FaArrowLeft /> Back
                </Button>
                <Button type="submit" isLoading={isLoading}>
                  Reset Password
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
                Your password has been successfully reset. You can now log in with your new password.
              </p>
              <Button fullWidth onClick={() => navigate('/login')}>
                Go to Login
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        {currentStep !== 'success' && (
          <div className={styles.footer}>
            <Link to="/login" className={styles.backLink}>
              <FaArrowLeft /> Back to Login
            </Link>
          </div>
        )}
      </motion.div>

      {/* Background decoration */}
      <div className={styles.decoration}>
        <div className={styles.circle1}></div>
        <div className={styles.circle2}></div>
      </div>
    </div>
  );
};

export default ForgotPassword;

