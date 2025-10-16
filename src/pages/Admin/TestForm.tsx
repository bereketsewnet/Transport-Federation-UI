import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button } from '@components/Button/Button';
import { FormField } from '@components/FormField/FormField';

const testSchema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
});

interface TestFormData {
  name: string;
  email: string;
}

export const TestForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch
  } = useForm<TestFormData>({
    resolver: yupResolver(testSchema),
  });

  const watchedValues = watch();

  const onSubmit = async (data: TestFormData) => {
    console.log('🧪 Test form submitted with data:', data);
    console.log('🧪 Form errors:', errors);
    alert('Form submitted successfully! Check console for data.');
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '500px', margin: '0 auto' }}>
      <h2>🧪 Test Form</h2>
      <p>This is a simple test form to debug form validation issues.</p>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormField
          label="Name"
          {...register('name')}
          error={errors.name?.message}
          required
          placeholder="Enter your name"
        />
        
        <FormField
          label="Email"
          type="email"
          {...register('email')}
          error={errors.email?.message}
          required
          placeholder="Enter your email"
        />
        
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Test Form'}
        </Button>
      </form>
      
      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f5f5f5' }}>
        <h3>Debug Info:</h3>
        <p><strong>Form Values:</strong></p>
        <pre>{JSON.stringify(watchedValues, null, 2)}</pre>
        <p><strong>Form Errors:</strong></p>
        <pre>{JSON.stringify(errors, null, 2)}</pre>
        <p><strong>Is Submitting:</strong> {isSubmitting ? 'Yes' : 'No'}</p>
      </div>
    </div>
  );
};

export default TestForm;
