import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '@hooks/useAuth';
import {
  changePassword,
  getSecurityQuestions,
  SecurityQuestion,
} from '@api/endpoints';
import { FormField } from '@components/FormField/FormField';
import { Button } from '@components/Button/Button';
import { Select } from '@components/Select/Select';
import styles from './ChangePassword.module.css';

const schema = yup.object({
  newPassword: yup
    .string()
    .required('New password is required')
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('newPassword')], 'Passwords must match'),
}).required();

interface FormData {
  newPassword: string;
  confirmPassword: string;
}

export const MemberChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const { setUser, setToken } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [securityQuestions, setSecurityQuestions] = useState<SecurityQuestion[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<
    Array<{ questionId: number; answer: string }>
  >([
    { questionId: 0, answer: '' },
    { questionId: 0, answer: '' },
    { questionId: 0, answer: '' },
  ]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    loadSecurityQuestions();
  }, []);

  const loadSecurityQuestions = async () => {
    try {
      const response = await getSecurityQuestions();
      setSecurityQuestions(response.data.questions);
    } catch (error) {
      console.error('Error loading security questions:', error);
      toast.error('Failed to load security questions');
    }
  };

  const handleQuestionChange = (index: number, questionId: string) => {
    const newSelected = [...selectedQuestions];
    newSelected[index].questionId = parseInt(questionId);
    setSelectedQuestions(newSelected);
  };

  const handleAnswerChange = (index: number, answer: string) => {
    const newSelected = [...selectedQuestions];
    newSelected[index].answer = answer;
    setSelectedQuestions(newSelected);
  };

  const onSubmit = async (data: FormData) => {
    // Validate security questions
    const allQuestionsSelected = selectedQuestions.every((q) => q.questionId > 0);
    const allAnswersFilled = selectedQuestions.every((q) => q.answer.trim() !== '');
    const uniqueQuestions = new Set(selectedQuestions.map((q) => q.questionId)).size === 3;

    if (!allQuestionsSelected || !allAnswersFilled) {
      toast.error('Please answer all 3 security questions');
      return;
    }

    if (!uniqueQuestions) {
      toast.error('Please select 3 different security questions');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await changePassword({
        newPassword: data.newPassword,
        securityQuestions: selectedQuestions,
      });

      toast.success('Password changed successfully!');

      // Update user and token
      if (response.data.token && response.data.user) {
        setToken(response.data.token);
        setUser(response.data.user);
        
        // Navigate based on role
        if (response.data.user.role === 'member') {
          navigate('/member/dashboard');
        } else {
          navigate('/admin/dashboard');
        }
      }
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableQuestions = (currentIndex: number) => {
    const selectedIds = selectedQuestions
      .map((q, i) => (i !== currentIndex ? q.questionId : 0))
      .filter((id) => id > 0);
    return securityQuestions.filter((q) => !selectedIds.includes(q.id));
  };

  return (
    <div className={styles.container}>
      <div className={styles.background}>
        <div className={styles.shape}></div>
        <div className={styles.shape}></div>
      </div>

      <motion.div
        className={styles.formContainer}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className={styles.header}>
          <div className={styles.icon}>🔒</div>
          <h1>Change Password</h1>
          <p>Set a new password and answer security questions</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          {/* Password Fields */}
          <div className={styles.section}>
            <FormField
              label="New Password"
              type="password"
              {...register('newPassword')}
              error={errors.newPassword?.message}
              placeholder="Enter new password (min 6 characters)"
            />

            <FormField
              label="Confirm Password"
              type="password"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
              placeholder="Re-enter your password"
            />
          </div>

          {/* Security Questions */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Security Questions
            </h3>

            {selectedQuestions.map((selected, index) => (
              <motion.div
                key={index}
                className={styles.questionGroup}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <label className={styles.questionLabel}>
                  Question {index + 1}
                </label>
                <Select
                  value={selected.questionId.toString()}
                  onChange={(e) => handleQuestionChange(index, e.target.value)}
                  options={[
                    { value: '0', label: 'Select a question...' },
                    ...availableQuestions(index).map((q) => ({
                      value: q.id.toString(),
                      label: q.question,
                    })),
                  ]}
                />
                <input
                  type="text"
                  className={styles.answerInput}
                  placeholder="Your answer"
                  value={selected.answer}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                />
              </motion.div>
            ))}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Changing Password...' : 'Change Password & Continue'}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default MemberChangePassword;

