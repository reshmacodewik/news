import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Linking,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Alert,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from '../../style/MoreStyles';
import BottomSheet from '../../Components/BottomSheet';
import { navigate } from '../../Navigators/utils';
import { apiDelete, apiPost, getApiWithOutQuery } from '../../Utils/api/common';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  API_CHANGE_PASSWORD,
  API_DELETE_ACCOUNT,
  API_GET_PROFILE,
} from '../../Utils/api/APIConstant';
import ShowToast from '../../Utils/ShowToast';
import DeviceInfo from 'react-native-device-info';
import { useAuth } from '../Auth/AuthContext';
import { useIsFocused } from '@react-navigation/native';
import Header from '../../Components/Header';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useTheme } from '../../context/ThemeContext';


// ---- Assets ----
const LOGO = require('../../icons/logoblack.png');
const AVATAR_BG = require('../../icons/user.png');
const MAIL = require('../../icons/email.png');
const EDIT = require('../../icons/edit.png');
const LOCK = require('../../icons/password.png');
const PLAN = require('../../icons/bell.png');
const ABOUT = require('../../icons/About.png');
const SHIELD1 = require('../../icons/bell.png');
const TERMS = require('../../icons/note.png');
const CHAT = require('../../icons/chat.png');
const SHIELD = require('../../icons/policy.png');
const LAYERS = require('../../icons/verison.png');
const LOGOUT = require('../../icons/logout.png');
const CHEVRON = require('../../icons/arrow.png');
const AVATAR = require('../../icons/user.png');
const DELETE = require('../../icons/delete.png');
const DARKMODE = require('../../icons/dark_mode.png');
const LIGHTMODE = require('../../icons/day-mode.png');
// ---- End Assets ----
const scale = (size: number) => (Dimensions.get('window').width / 375) * size;

// Reusable Row Component


const MoreScreen: React.FC = () => {
  const Row = ({
  icon,
  label,
  right = true,
  onPress,
  style,
 
}: {
  icon: any;
  label: string;
  right?: boolean;
  onPress?: () => void;
  style?: any;
}) => (
  <TouchableOpacity
    style={[styles.row, style]}
    onPress={onPress} // ✅ ADD THIS LINE
    activeOpacity={0.8}
  >
    <Image source={icon} style={[styles.rowIcon, { tintColor: colors.text }]} />
    <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
    {right && <Image source={CHEVRON} style={[styles.chevron, { tintColor: colors.text }]} />}
  </TouchableOpacity>
);
  const version = DeviceInfo.getVersion();
  const buildNumber = DeviceInfo.getBuildNumber();
  const inset = useSafeAreaInsets();
  const { signOut, session } = useAuth();
  const [sheet, setSheet] = useState<'none' | 'newPassword'>('none');
  const [visible, setVisible] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const confirmRef = React.useRef<TextInput>(null);
  const isFocused = useIsFocused();
  const { theme, toggleTheme,colors } = useTheme();

  const userId = session?.user?.id;

  const openNewPassword = () => {
    if (!session?.accessToken) {
      ShowToast('Please login to change password');
      return;
    }
    setVisible(true);
  };
  const queryClient = useQueryClient();

  // Close the BottomSheet and reset inputs
  const close = () => {
    setVisible(false);
    setNewPassword('');
    setConfirmPassword('');
  };

  useEffect(() => {
    // Close the BottomSheet when the screen is not focused
    if (!isFocused) {
      close();
    }
  }, [isFocused]);

  // Get profile data
  const {
    data: profile,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['profile-info'],
    queryFn: async () => {
      const res = await getApiWithOutQuery({ url: API_GET_PROFILE });
      return res?.data;
    },
    staleTime: 0,
  });
  useEffect(() => {
    if (isFocused && session?.accessToken) {
      queryClient.invalidateQueries({ queryKey: ['profile-info'] });
      refetch(); // extra safety to ensure UI updates instantly
    }
  }, [isFocused, session?.accessToken]);

  // Reset password API
  const resetPassword = useMutation({
    mutationFn: async (values: {
      newPassword: string;
      confirmPassword: string;
    }) => {
      const res = await apiPost({
        url: API_CHANGE_PASSWORD,
        values,
      });
      return res.data;
    },
    onSuccess: () => {
      ShowToast('Password reset successfully');
      Keyboard.dismiss();
      setVisible(false);
    },
    onError: err => {
      console.log('Reset password error', err);
      ShowToast('Failed to reset password');
    },
  });
  const PasswordSchema = Yup.object().shape({
    newPassword: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .required('New password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword')], 'Passwords must match')
      .required('Confirm password is required'),
  });

  const onEmail = () => Linking.openURL('mailto:support@arcalisnews.com');

  const handleLogout = async () => {
    try {
      await signOut(); // clears session in AsyncStorage and state
      ShowToast('Logged out successfully');
      navigate('Home' as never); // redirect to login screen
    } catch (err) {
      console.log('Logout error:', err);
      ShowToast('Failed to logout. Try again.');
    }
  };
  const handleDeleteAccount = async () => {
    if (!userId) {
      ShowToast('User not logged in');
      return;
    }

    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await apiDelete({
                url: `${API_DELETE_ACCOUNT}/${userId}`,
              });

              if (res?.success) {
                ShowToast(res?.message || 'Account deleted successfully');
                await signOut();
                navigate('Home' as never);
              } else {
                ShowToast(res?.message || 'Failed to delete account');
              }
            } catch (err) {
              console.log('Delete error:', err);
              ShowToast('Something went wrong. Please try again.');
            }
          },
        },
      ],
    );
  };
// const handlDarkModeToggle = async (isDarkMode: boolean) => {
//   try {
//     await setDarkMode(!isDarkMode);
//       toggleTheme(!isDarkMode);
//   } catch (error) {
//     console.log('Error toggling dark mode:', error);
//   }
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Safe top */}
      <View style={{ height: inset.top }} />

      {/* Top bar */}
      <Header
        logoSource={LOGO}
        avatarSource={AVATAR}
        guestRoute="More"
        authRoute="More"
      />

      <ScrollView
        style={[styles.scroll, { backgroundColor: colors.background }]}
        contentContainerStyle={{ paddingBottom: inset.bottom + scale(120) }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile card */}
        <View style={[styles.profileCard, { backgroundColor: colors.card }]}>
          <View style={styles.profileLeft}>
            <View style={styles.bigAvatarWrap}>
              <Image
                source={
                  profile?.photo
                    ? { uri: `${profile.photo}?v=${Date.now()}` }
                    : AVATAR_BG
                }
                style={styles.bigAvatar}
                resizeMode="cover"
              />
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.name, { color: colors.text }]}>
                {session?.accessToken ? profile?.name : 'Guest User'}
              </Text>
              <View style={styles.line}>
                <Image source={MAIL} style={[styles.smallIcon, { tintColor: colors.text }]} />
                <Text style={[styles.lineText, { color: colors.text }]}>
                  {session?.accessToken ? profile?.email : 'Login to see email'}
                </Text>
              </View>
            </View>
          </View>

          {session?.accessToken ? (
            <TouchableOpacity
              style={[styles.editBtn, { backgroundColor: colors.card }]}
              activeOpacity={0.9}
              onPress={() => navigate('EditProfile' as never)}
            >
              <Image source={EDIT} style={[styles.editIcon, { tintColor: colors.text }]} />
              <Text style={[styles.editText, { color: colors.text }]}>Edit Profile</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.loginBtn, { backgroundColor: colors.card }]}
              activeOpacity={0.9}
              onPress={() => navigate('Login' as never)}
            >
              <Text style={[styles.editText, { color: colors.text }]}>Login</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Others header */}
        <Text style={[styles.sectionTitle, { color: colors.headingtext }]}>Others</Text>

        {/* Group 1 */}
        <View style={[styles.cardGroup, { backgroundColor: colors.card }]}>
          <Row icon={LOCK} label="Change Password" onPress={openNewPassword} />
          <Row
            icon={PLAN}
            label="Subscription Plan"
            onPress={() => navigate('Premium' as never)}
            style={{ marginTop: -12}}
          />
          <Row
            icon={ABOUT}
            label="About Us"
            onPress={() => navigate('Fast News' as never)}
            style={[{ marginTop: -12 }, { color: colors.text }]}
          />
        </View>

        {/* Group 2 */}
        <View style={[styles.cardGroup, { backgroundColor: colors.card }]}>
          <Row
            icon={SHIELD}
            label="Privacy Policy"
            onPress={() => navigate('PrivacyPolicy' as never)}
       
          />
          <Row
            icon={TERMS}
            label="Terms of Usage & Conditions"
            onPress={() => navigate('TermsAndConditions' as never)}
            style={{ marginTop: -12 }}
          />
          <Row
            icon={PLAN}
            label="Subscription Billing"
            onPress={() => navigate('SubscriptionBillingScreen' as never)}
            style={{ marginTop: -12 }}
          />
          SubscriptionBillingScreen
        </View>

        {/* Contact + Version */}
        <View style={[styles.cardGroup, { backgroundColor: colors.card }]}>
          <View style={[styles.row, { alignItems: 'flex-start' }]}>
            <Image
              source={CHAT}
              style={[styles.rowIcon, { marginTop: scale(9) }, { tintColor: colors.text }]}
            />
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowLabel, { color: colors.text }]}>Contact Us</Text>
              <Text style={[styles.contactBody, { color: colors.text }]}>
                Please reach out to us on{' '}
                <Text style={[styles.link, { color: colors.text }]} onPress={onEmail}>
                  support@arcalisnews.com
                </Text>{' '}
                for any support or discussions. We’ll be more than happy to help
                you.
              </Text>
            </View>
          </View>

          <View style={[styles.row, { alignItems: 'flex-start', }]}>
            <Image
              source={LAYERS}
              style={[styles.rowIcon, { marginTop: scale(9) }, { tintColor: colors.text }]}
            />
            <View>
              <Text style={[styles.rowLabel, { color: colors.text }]}>App Version</Text>
              <Text style={styles.subtle}>
                {version} ({buildNumber})
              </Text>
            </View>
          </View>
          <View style={[styles.row, { alignItems: 'center' }]}>
            <Image
              source={theme === 'dark' ? LIGHTMODE : DARKMODE}
              style={[
                styles.rowIcon,
                { tintColor: theme === 'dark' ? '#fff' : '#000' },
              ]}
            />
            <Text
              style={[
                styles.rowLabel,
                { color: theme === 'dark' ? '#fff' : '#000' },
              ]}
            >
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </Text>
            <Switch
              value={theme === 'dark'}
              onValueChange={toggleTheme}
              thumbColor={theme === 'dark' ? '#fff' : '#000'}
              trackColor={{ false: '#ccc', true: '#666' }}
            />
          </View>
        </View>

        {session?.accessToken && (
          <TouchableOpacity
            style={[styles.logoutRow, { backgroundColor: colors.card }]}
            activeOpacity={0.85}
            onPress={() => handleDeleteAccount()}
          >
            <Image source={DELETE} style={[styles.logoutIcon, { tintColor: colors.text }]} />
            <Text style={[styles.logoutText, { color: colors.text }]}>Delete Account</Text>
          </TouchableOpacity>
        )}
        {session?.accessToken && (
          <TouchableOpacity
            style={[styles.logoutRow, { backgroundColor: colors.card }]}
            activeOpacity={0.85}
            onPress={() => handleLogout()}
          >
            <Image source={LOGOUT} style={[styles.logoutIcon, { tintColor: colors.text }]} />
            <Text style={[styles.logoutText, { color: colors.text }]}>Logout</Text>
          </TouchableOpacity>
        )}

        {/* BottomSheet for Reset Password */}
        <BottomSheet visible={visible} onClose={close}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={100}
            style={{ flex: 1, }}
          >
            <Formik
              initialValues={{ newPassword: '', confirmPassword: '' }}
              validationSchema={PasswordSchema}
              onSubmit={values => {
                resetPassword.mutate(values); // pass values directly
              }}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
              }) => (
                <ScrollView
                  contentContainerStyle={{ paddingBottom: 40 }}
                  keyboardShouldPersistTaps="handled"
                >
                  <Text style={[styles.sheetTitle, { color: colors.text }]}>Create New Password</Text>
                  <Text style={[styles.sheetSub, { color: colors.text }]}>
                    This password should be different from the previous
                    password.
                  </Text>

                  <Text style={[styles.inputLabel, { color: colors.text }]}>New Password</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.card }]}
                    placeholder="New Password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry
                    value={values.newPassword}
                    onChangeText={handleChange('newPassword')}
                    onBlur={handleBlur('newPassword')}
                    returnKeyType="next"
                    onSubmitEditing={() => confirmRef.current?.focus()}
                    blurOnSubmit={false}
                  />
                  {errors.newPassword && touched.newPassword && (
                    <Text style={styles.errorText}>{errors.newPassword}</Text>
                  )}

                  <Text style={[styles.inputLabel, { color: colors.text }]}>Confirm Password</Text>
                  <TextInput
                    ref={confirmRef}
                    style={[styles.input, { backgroundColor: colors.card }]}
                    placeholder="Confirm Password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry
                    value={values.confirmPassword}
                    onChangeText={handleChange('confirmPassword')}
                    onBlur={handleBlur('confirmPassword')}
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit}
                  />
                  {errors.confirmPassword && touched.confirmPassword && (
                    <Text style={styles.errorText}>
                      {errors.confirmPassword}
                    </Text>
                  )}

                  <TouchableOpacity
                    style={[styles.primaryBtn, { marginTop: 16, backgroundColor: colors.headingtext }]}
                    onPress={handleSubmit as any}
                    disabled={resetPassword.isPending}
                  >
                    <Text style={styles.primaryBtnText}>
                      {resetPassword.isPending
                        ? 'Resetting...'
                        : 'Reset Password'}
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              )}
            </Formik>
          </KeyboardAvoidingView>
        </BottomSheet>
      </ScrollView>
    </View>
  );
};

export default MoreScreen;
