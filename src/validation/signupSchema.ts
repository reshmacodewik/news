// validation/signupSchema.ts
import * as Yup from 'yup';


export const signupSchema = Yup.object()
  .shape({

    name: Yup.string().required(' Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .required('Password is required'),
       agreeTerms: Yup.boolean()
    .oneOf([true], "You must agree to the Terms & Conditions"),
      subscribeNews: Yup.boolean()
    .oneOf([true], "You must agree to receive newsletters"),
    
  });

export const loginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
});
export const forgotPassword = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
 
});

export const otpSchema = Yup.object().shape({
  otp: Yup.string()
    .length(4, 'OTP must be 4 digits')
    .required('OTP is required'),
});

export const changepasswordSchema = Yup.object().shape({
  

  newPassword: Yup.string()
    .min(8, 'New password must be at least 8 characters')
    .required('New password is required'),

  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Confirm password is required'),
});
const PasswordSchema = Yup.object().shape({
  newPassword: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Confirm password is required'),
});

