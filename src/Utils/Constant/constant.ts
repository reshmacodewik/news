export const SCREEN_NAMES = {
  splash: 'Splash',
  login: 'Login',
  signup: 'Signup',
  articleDetail: 'ArticleDetail',
  privacy: 'PrivacyPolicy',

  // bottom tabs
  home: 'Home',
  about: 'Fast News',
  trending: 'Trending',
  subscription: 'Premium',
  more: 'More',
  editProfile: 'EditProfile',
  termsAndConditions: 'TermsAndConditions',
  forgotPassword: 'ForgotPassword',
  otpScreen: 'OTPScreen',
  resetPassword: 'ResetPassword',
  paymentsuccess: 'PaymentSuccess',
  SubscriptionBillingScreen:'SubscriptionBillingScreen',
} as const;

export type RootStackParamList = {
  Home: undefined;
  more: undefined;
  Login: undefined;
  subscription: undefined;
  Signup: undefined;
  editProfile: undefined;
  Register: undefined;
  'Forgot Password': undefined;
  ForgotPassword: undefined;
  OTPScreen: { email: string }; // OTPScreen expects the email parameter
  ResetPassword: { email: string; otp: string };
  Profile: undefined;
  Help: undefined;
  FAQ: undefined;
  Reports: undefined;
};
