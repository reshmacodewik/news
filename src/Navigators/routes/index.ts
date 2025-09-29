import React from 'react';  
import { SCREEN_NAMES } from '../../Utils/Constant/constant';
import LoginScreen from '../../Screens/Auth/LoginScreen';
import SplashScreen from '../../Screens/SplashScreen';
import SignupScreen from '../../Screens/Auth/SignupScreen';
import BottomTab from '../Navigation/BottomTab/BottomTab';
import ArticleDetailScreen from '../../Screens/ArticleDetailScreen';
import PrivacyPolicyScreen from '../../Screens/PrivacyPolicyScreen';
import EditProfileScreen from '../../Screens/EditProfileScreen';

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
  }
  
];

// export const authenticateTabRoutes = [
//   {
//     label: SCREEN_NAMES.Slot,
//     tabLabel: 'Slot Timing',
//     routeName: SCREEN_NAMES.Slot,
//     component: SlotScreen,
//     // activeIcon: PlusActiveIcon,
//     // inActiveIcon: PlusIcon,
//     headerShown: false,
//     // header: () => <Header variant='default' headerHeading='profile' />
//   },
//   {
//     label: SCREEN_NAMES.boatDetail,
//     tabLabel: 'Booking Page',
//     routeName: SCREEN_NAMES.boatDetail,
//     component: BoatDetails,
//     // activeIcon: PlusActiveIcon,
//     // inActiveIcon: PlusIcon,
//     headerShown: false,
//     // header: () => <Header variant='default' headerHeading='profile' />
//   },
//   {
//     label: SCREEN_NAMES.editProfile,
//     tabLabel: 'Edit Profile',
//     routeName: SCREEN_NAMES.editProfile,
//     component: EditProfile,
//     // activeIcon: PlusActiveIcon,
//     // inActiveIcon: PlusIcon,
//     headerShown: false,
//     // header: () => <Header variant='default' headerHeading='profile' />
//   },
// ];



// export const applicationBottomTabRoutes = [
//   {
//     label: SCREEN_NAMES.home,
//     tabLabel: 'Home',
//     routeName: SCREEN_NAMES.home,
//     component: HomeScreen,
//     icon: '🏠',
//     // activeIcon: HomeActiveIcon,
//     // inActiveIcon: HomeIcon,
//     headerShown: false,
//     // header: () => <Header variant='home' />
//   },
//   {
//     label: SCREEN_NAMES.myBooking,
//     tabLabel: 'Booking Page',
//     routeName: SCREEN_NAMES.myBooking,
//     component: MyBooking,
//     icon: '📅',
//     // activeIcon: PlusActiveIcon,
//     // inActiveIcon: PlusIcon,
//     headerShown: false,
//     // header: () => <Header variant='default' headerHeading='profile' />
//   },
//   {
//     label: SCREEN_NAMES.account,
//     tabLabel: 'Account',
//     routeName: SCREEN_NAMES.account,
//     component: Account,
//     icon: '👤',
//     // activeIcon: PlusActiveIcon,
//     // inActiveIcon: PlusIcon,
//     headerShown: false,
//     // header: () => <Header variant='default' headerHeading='profile' />
//   },
// ];

// export const drawerRoutes = [
//   {
//     label: SCREEN_NAMES.contactUs,
//     routeName: SCREEN_NAMES.contactUs,
//     component: ContactUsScreen,
//     drawerLabel: 'contactUs',
//     optionIcon: CallIcon,
//     headerShown: true,
//     headerHeading: 'contactUs',
//     header: null
//   },
//   {
//     label: SCREEN_NAMES.help,
//     routeName: SCREEN_NAMES.help,
//     component: HelpScreen,
//     drawerLabel: 'help',
//     optionIcon: HelpIcon,
//     headerShown: true,
//     headerHeading: 'help',
//     header: null
//   }
// ];
