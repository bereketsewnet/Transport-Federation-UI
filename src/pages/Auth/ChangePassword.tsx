import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
// import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@components/Button/Button';
import { FormField } from '@components/FormField/FormField';
import { Select } from '@components/Select/Select';
import { Loading } from '@components/Loading/Loading';
import { changePassword, getSecurityQuestions, SecurityQuestion } from '@api/endpoints';
import { toast } from 'react-hot-toast';
import styles from './ChangePassword.module.css';

interface ChangePasswordFormData {
  newPassword: string;
  confirmPassword: string;
  question1: number;
  answer1: string;
  question2: number;
  answer2: string;
  question3: number;
  answer3: string;
}

const schema = yup.object({
  newPassword: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
  confirmPassword: yup.string().required('Please confirm password').oneOf([yup.ref('newPassword')], 'Passwords must match'),
  question1: yup.number().required('Security question 1 is required'),
  answer1: yup.string().required('Answer 1 is required'),
  question2: yup.number().required('Security question 2 is required'),
  answer2: yup.string().required('Answer 2 is required'),
  question3: yup.number().required('Security question 3 is required'),
  answer3: yup.string().required('Answer 3 is required'),
});

export const ChangePassword: React.FC = () => {
  // const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [securityQuestions, setSecurityQuestions] = useState<SecurityQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    // setValue,
  } = useForm<ChangePasswordFormData>({
    resolver: yupResolver(schema),
  });

  const selectedQuestions = [watch('question1'), watch('question2'), watch('question3')];

  useEffect(() => {
    loadSecurityQuestions();
  }, []);

  const loadSecurityQuestions = async () => {
    try {
      const response = await getSecurityQuestions();
      setSecurityQuestions(response.data.questions);
    } catch (error) {
      console.error('Failed to load security questions:', error);
      toast.error('Failed to load security questions');
    } finally {
      setLoadingQuestions(false);
    }
  };

  const getAvailableQuestions = (currentIndex: number) => {
    return securityQuestions.filter(q => {
      const isSelected = selectedQuestions.includes(q.id);
      const isCurrentSelection = selectedQuestions[currentIndex] === q.id;
      return !isSelected || isCurrentSelection;
    });
  };

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      setIsLoading(true);
      
      const payload = {
        newPassword: data.newPassword,
        securityQuestions: [
          { questionId: data.question1, answer: data.answer1 },
          { questionId: data.question2, answer: data.answer2 },
          { questionId: data.question3, answer: data.answer3 },
        ],
      };

      const response = await changePassword(payload);

      if (response.data.token) {
        // Update token
        localStorage.setItem('jwt_token', response.data.token);
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        
        toast.success('Password changed successfully!');
        
        // Navigate based on role
        if (response.data.user?.role === 'member') {
          navigate('/member/dashboard');
        } else {
          navigate('/admin/dashboard');
        }
      }
    } catch (error: any) {
      console.error('Change password error:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingQuestions) {
    return <Loading />;
  }

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className={styles.header}>
          <div className={styles.iconCircle}>
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className={styles.title}>Change Password</h1>
          <p className={styles.subtitle}>Set your new password and security questions</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          {/* New Password Section */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>New Password</h3>
            
            <FormField
              type="password"
              label="New Password"
              placeholder="Enter new password (min 6 characters)"
              error={errors.newPassword?.message}
              register={register('newPassword')}
              required
            />

            <FormField
              type="password"
              label="Confirm Password"
              placeholder="Re-enter your password"
              error={errors.confirmPassword?.message}
              register={register('confirmPassword')}
              required
            />
          </div>

          {/* Security Questions Section */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Security Questions</h3>
            <p className={styles.sectionDesc}>
              Choose 3 different security questions to help you recover your account
            </p>

            {/* Question 1 */}
            <div className={styles.questionGroup}>
              <Select
                label="Security Question 1"
                error={errors.question1?.message}
                required
                register={register('question1', { valueAsNumber: true })}
                options={[
                  { value: '', label: 'Select a question' },
                  ...getAvailableQuestions(0).map(q => ({ value: q.id.toString(), label: q.question }))
                ]}
              />
              <FormField
                label="Answer 1"
                placeholder="Your answer"
                error={errors.answer1?.message}
                register={register('answer1')}
                required
              />
            </div>

            {/* Question 2 */}
            <div className={styles.questionGroup}>
              <Select
                label="Security Question 2"
                error={errors.question2?.message}
                required
                register={register('question2', { valueAsNumber: true })}
                options={[
                  { value: '', label: 'Select a question' },
                  ...getAvailableQuestions(1).map(q => ({ value: q.id.toString(), label: q.question }))
                ]}
              />
              <FormField
                label="Answer 2"
                placeholder="Your answer"
                error={errors.answer2?.message}
                register={register('answer2')}
                required
              />
            </div>

            {/* Question 3 */}
            <div className={styles.questionGroup}>
              <Select
                label="Security Question 3"
                error={errors.question3?.message}
                required
                register={register('question3', { valueAsNumber: true })}
                options={[
                  { value: '', label: 'Select a question' },
                  ...getAvailableQuestions(2).map(q => ({ value: q.id.toString(), label: q.question }))
                ]}
              />
              <FormField
                label="Answer 3"
                placeholder="Your answer"
                error={errors.answer3?.message}
                register={register('answer3')}
                required
              />
            </div>
          </div>

          <Button type="submit" fullWidth isLoading={isLoading}>
            {isLoading ? 'Changing Password...' : 'Change Password & Continue'}
          </Button>
        </form>
      </motion.div>

      <div className={styles.decoration}>
        <div className={styles.circle1}></div>
        <div className={styles.circle2}></div>
      </div>
    </div>
  );
};

export default ChangePassword;
