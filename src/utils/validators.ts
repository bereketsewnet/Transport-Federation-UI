import * as yup from 'yup';

// Common validation schemas
export const emailSchema = yup
  .string()
  .email('Please enter a valid email')
  .required('Email is required');

export const phoneSchema = yup
  .string()
  .matches(/^\+251\d{9}$/, 'Phone must be in format +251XXXXXXXXX')
  .required('Phone is required');

export const passwordSchema = yup
  .string()
  .min(8, 'Password must be at least 8 characters')
  .matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Password must contain uppercase, lowercase, number and special character'
  )
  .required('Password is required');

export const requiredString = (field: string) => yup.string().required(`${field} is required`);

export const requiredNumber = (field: string) =>
  yup.number().typeError(`${field} must be a number`).required(`${field} is required`);

export const requiredDate = (field: string) =>
  yup.date().typeError(`${field} must be a valid date`).required(`${field} is required`);

export const positiveNumber = (field: string) =>
  yup
    .number()
    .typeError(`${field} must be a number`)
    .positive(`${field} must be positive`)
    .required(`${field} is required`);

// Login validation schema
export const loginValidationSchema = yup.object({
  username: yup.string().required('Username is required'),
  password: yup.string().required('Password is required'),
});

// Change password validation schema
export const changePasswordValidationSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .required('Confirm password is required'),
});

// Member validation schema
export const memberValidationSchema = yup.object({
  union_id: requiredNumber('Union'),
  member_code: requiredString('Member code'),
  first_name: requiredString('First name'),
  father_name: requiredString('Father name'),
  surname: requiredString('Surname'),
  sex: requiredString('Sex'),
  birthdate: requiredDate('Birthdate'),
  education: requiredString('Education'),
  phone: phoneSchema,
  email: emailSchema,
  salary: positiveNumber('Salary'),
  registry_date: requiredDate('Registry date'),
});

// Union validation schema
export const unionValidationSchema = yup.object({
  union_code: requiredString('Union code'),
  name_en: requiredString('Name (English)'),
  name_am: requiredString('Name (Amharic)'),
  sector: requiredString('Sector'),
  organization: requiredString('Organization'),
  established_date: requiredDate('Established date'),
  terms_of_election: positiveNumber('Terms of election'),
  strategic_plan_in_place: yup.boolean(),
});

// Contact form validation schema
export const contactValidationSchema = yup.object({
  name: requiredString('Name'),
  email_or_phone: yup.string().required('Email or phone is required'),
  subject: requiredString('Subject'),
  message: requiredString('Message'),
});

// News validation schema
export const newsValidationSchema = yup.object({
  title: requiredString('Title'),
  body: requiredString('Body'),
  summary: requiredString('Summary'),
  published_at: requiredDate('Published date'),
  is_published: yup.boolean(),
});

// Gallery validation schema
export const galleryValidationSchema = yup.object({
  title: requiredString('Title'),
  description: yup.string(),
});

// CBA validation schema
export const cbaValidationSchema = yup.object({
  union_id: requiredNumber('Union'),
  duration_years: positiveNumber('Duration'),
  status: requiredString('Status'),
  registration_date: requiredDate('Registration date'),
  next_end_date: requiredDate('End date'),
  round: requiredString('Round'),
});

// Executive validation schema
export const executiveValidationSchema = yup.object({
  union_id: requiredNumber('Union'),
  mem_id: requiredNumber('Member'),
  position: requiredString('Position'),
  appointed_date: requiredDate('Appointed date'),
  term_length_years: positiveNumber('Term length'),
});

