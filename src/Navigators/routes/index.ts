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
    routeName: SCREEN_NAMES.home,          // <-- add Home for now (so you can navigate to it)
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
  
];

