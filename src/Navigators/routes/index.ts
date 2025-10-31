import React from 'react';
import { SCREEN_NAMES } from '../../Utils/Constant/constant';
import LoginScreen from '../../Screens/Auth/LoginScreen';
import SplashScreen from '../../Screens/SplashScreen';
import SignupScreen from '../../Screens/Auth/SignupScreen';
import BottomTab from '../Navigation/BottomTab/BottomTab';
import ArticleDetailScreen from '../../Screens/ArticleDetailScreen';
import PrivacyPolicyScreen from '../../Screens/PrivacyPolicyScreen';
import EditProfileScreen from '../../Screens/EditProfileScreen';
import TermsAndConditionsScreen from '../../Screens/Terms&Conditions';
import ForgotPasswordScreen from '../../Screens/Auth/ForgotPasswordScreen';
import OTPScreen from '../../Screens/Auth/OTPScreen';
import ResetPasswordScreen from '../../Screens/Auth/ResetPassword';
import PaymentSuccess from '../../Screens/PaymentSuccess';
import SubscriptionBillingScreen from '../../Screens/SubscriptionBillingScreen';
import MoreScreen from '../../Screens/Bottom Tab/MoreScreen';
import PricingScreen from '../../Screens/Bottom Tab/PricingScreen';
import AboutScreen from '../../Screens/Bottom Tab/AboutScreen';

export const notAuthenticatedRoutes = [
  {
    routeName: SCREEN_NAMES.splash,
    headerHeading: 'Splash',
    component: SplashScreen,
    headerShown: false,
  },
  {
    routeName: SCREEN_NAMES.login,
    headerHeading: 'Login',
    component: LoginScreen,
    headerShown: false,
  },
  {
    routeName: SCREEN_NAMES.signup,
    headerHeading: 'Signup',
    component: SignupScreen,
    headerShown: false,
  },
  {
    routeName: SCREEN_NAMES.home, // <-- add Home for now (so you can navigate to it)
    headerHeading: 'Home',
    component: BottomTab,
    headerShown: false,
  },
  {
    routeName: SCREEN_NAMES.articleDetail,
    headerHeading: 'ArticleDetail',
    component: ArticleDetailScreen,
    headerShown: false,
  },
  {
    routeName: SCREEN_NAMES.privacy,
    headerHeading: 'PrivacyPolicy',
    component: PrivacyPolicyScreen,
    headerShown: false,
  },
  {
    routeName: SCREEN_NAMES.editProfile,
    headerHeading: 'EditProfile',
    component: EditProfileScreen,
    headerShown: false,
  },
  {
    routeName: SCREEN_NAMES.termsAndConditions,
    headerHeading: 'TermsAndConditions',
    component: TermsAndConditionsScreen,
    headerShown: false,
  },
  {
    routeName: SCREEN_NAMES.forgotPassword,
    headerHeading: 'ForgotPassword',
    component: ForgotPasswordScreen,
    headerShown: false,
  },
  {
    routeName: SCREEN_NAMES.otpScreen,
    headerHeading: 'OTPScreen',
    component: OTPScreen,
    headerShown: false,
  },
  {
    routeName: SCREEN_NAMES.resetPassword,
    headerHeading: 'ResetPassword',
    component: ResetPasswordScreen,
    headerShown: false,
  },
  {
    routeName: SCREEN_NAMES.paymentsuccess,
    headerHeading: 'PaymentSuccess',
    component: PaymentSuccess,
    headerShown: false,
  },
  {
    routeName: SCREEN_NAMES.SubscriptionBillingScreen,
    headerHeading: 'SubscriptionBillingScreen',
    component: SubscriptionBillingScreen,
    headerShown: false,
  },
  {
   
    routeName: SCREEN_NAMES.more,
    headerHeading: 'MoreScreen',
    component: MoreScreen,
    headerShown: false,

  },
   {
   
    routeName: SCREEN_NAMES.subscription,
    headerHeading: 'PricingScreen',
    component: PricingScreen,
    headerShown: false,

  },
  {
    routeName: SCREEN_NAMES.about,
    headerHeading: 'AboutScreen',
    component: AboutScreen,
    headerShown: false,
  }
];
