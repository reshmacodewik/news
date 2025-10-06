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
} as const;

export type RootStackParamList = {
  Home: undefined;
  OtpVerified: undefined;
  Login: undefined;
  Signup: undefined;
  Slot: undefined;
  boatDetail: undefined;
  myBooking: undefined;
  account: undefined;
  editProfile: undefined;
  Register: undefined;
  'Forgot Password': undefined;
  Profile: undefined;
  Help: undefined;
  FAQ: undefined;
  Reports: undefined;
  'Contact Us': undefined;
  'My Booking': undefined;
};
