import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Linking,
  Dimensions,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from '../../style/MoreStyles';
import BottomSheet from '../../Components/BottomSheet';
import { navigate } from '../../Navigators/utils';
import { apiPost, getApiWithOutQuery } from '../../Utils/api/common';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  API_GET_PROFILE,
  API_RESET_PASSWORD,
} from '../../Utils/api/APIConstant';
import ShowToast from '../../Utils/ShowToast';
import DeviceInfo from 'react-native-device-info';
import { useAuth } from '../Auth/AuthContext';

// ---- Assets ----
const LOGO = require('../../icons/logoblack.png');
const AVATAR_BG = require('../../icons/user.png');
const MAIL = require('../../icons/email.png');
const PHONE = require('../../icons/phone.png');
const EDIT = require('../../icons/edit.png');
const LOCK = require('../../icons/password.png');
const PLAN = require('../../icons/bell.png');
const ABOUT = require('../../icons/About.png');
const SHIELD = require('../../icons/bell.png');
const TERMS = require('../../icons/note.png');
const CHAT = require('../../icons/chat.png');
const LAYERS = require('../../icons/verison.png');
const LOGOUT = require('../../icons/logout.png');
const CHEVRON = require('../../icons/arrow.png');

const scale = (size: number) => (Dimensions.get('window').width / 375) * size;

// Reusable Row Component
const Row = ({
  icon,
  label,
  right = true,
  onPress,
}: {
  icon: any;
  label: string;
  right?: boolean;
  onPress?: () => void;
}) => (
  <TouchableOpacity style={styles.row} activeOpacity={0.85} onPress={onPress}>
    <Image source={icon} style={styles.rowIcon} />
    <Text style={styles.rowLabel}>{label}</Text>
    {right && <Image source={CHEVRON} style={styles.chevron} />}
  </TouchableOpacity>
);

const MoreScreen: React.FC = () => {
  const version = DeviceInfo.getVersion();
  const buildNumber = DeviceInfo.getBuildNumber();
  const inset = useSafeAreaInsets();

  // BottomSheet state
  const [sheet, setSheet] = useState<'none' | 'newPassword'>('none');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { signOut } = useAuth();
  // Open / close bottom sheet
  const openNewPassword = () => setSheet('newPassword');
  const close = () => setSheet('none');

  // Get profile data
  const { data: profile } = useQuery({
    queryKey: ['profile-info'],
    queryFn: async () => {
      const res = await getApiWithOutQuery({ url: API_GET_PROFILE });
      return res?.data ?? {};
    },
  });

  // Reset password API
  const resetPassword = useMutation({
    mutationFn: async () => {
      const res = await apiPost({
        url: API_RESET_PASSWORD,
        values: { newPassword, confirmPassword },
      });
      return res.data;
    },
    onSuccess: () => {
      ShowToast('Password reset successfully');
      setSheet('none');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: err => {
      console.log('Reset password error', err);
      ShowToast('Failed to reset password');
    },
  });

  // Handler
  const handleResetPassword = () => {
    if (!newPassword || !confirmPassword) {
      return ShowToast('Please enter all fields');
    }
    if (newPassword !== confirmPassword) {
      return ShowToast('Passwords do not match');
    }
    resetPassword.mutate();
  };

  // Contact email
  const onEmail = () => Linking.openURL('mailto:support@arcalisnews.com');
  const handleLogout = async () => {
    try {
      await signOut(); // clears session in AsyncStorage and state
      ShowToast('Logged out successfully');
      navigate('Login' as never); // redirect to login screen
    } catch (err) {
      console.log('Logout error:', err);
      ShowToast('Failed to logout. Try again.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Safe top */}
      <View style={{ height: inset.top }} />

      {/* Top bar */}
      <View style={styles.topBar}>
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        <View style={styles.avatarWrap}>
          <Image source={AVATAR_BG} style={styles.avatar} resizeMode="cover" />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: inset.bottom + scale(120) }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.profileLeft}>
            <View style={styles.bigAvatarWrap}>
              <Image
                source={AVATAR_BG}
                style={styles.bigAvatar}
                resizeMode="cover"
              />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{profile?.name}</Text>
              <View style={styles.line}>
                <Image source={MAIL} style={styles.smallIcon} />
                <Text style={styles.lineText}>{profile?.email}</Text>
              </View>
              <View style={styles.line}>
                <Image source={PHONE} style={styles.smallIcon} />
                <Text style={styles.lineText}>{profile?.phoneNumber}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.editBtn}
            activeOpacity={0.9}
            onPress={() => navigate('EditProfile' as never)}
          >
            <Image source={EDIT} style={styles.editIcon} />
            <Text style={styles.editText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Others header */}
        <Text style={styles.sectionTitle}>Others</Text>

        {/* Group 1 */}
        <View style={styles.cardGroup}>
          <Row icon={LOCK} label="Change Password" onPress={openNewPassword} />
          <Row icon={PLAN} label="Subscription Plan" onPress={() => {}} />
          <Row icon={ABOUT} label="About Us" onPress={() => {}} />
        </View>

        {/* Group 2 */}
        <View style={styles.cardGroup}>
          <Row
            icon={SHIELD}
            label="Privacy Policy"
            onPress={() => navigate('PrivacyPolicy' as never)}
          />
          <Row icon={TERMS} label="Terms of Usage & Conditions" />
        </View>

        {/* Contact + Version */}
        <View style={styles.cardGroup}>
          <View style={[styles.row, { alignItems: 'flex-start' }]}>
            <Image
              source={CHAT}
              style={[styles.rowIcon, { marginTop: scale(9) }]}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Contact Us</Text>
              <Text style={styles.contactBody}>
                Please reach out to us on{' '}
                <Text style={styles.link} onPress={onEmail}>
                  support@arcalisnews.com
                </Text>{' '}
                for any support or discussions. We’ll be more than happy to help
                you.
              </Text>
            </View>
          </View>

          <View style={[styles.row, { alignItems: 'flex-start' }]}>
            <Image
              source={LAYERS}
              style={[styles.rowIcon, { marginTop: scale(9) }]}
            />
            <View>
              <Text style={styles.rowLabel}>App Version</Text>
              <Text style={styles.subtle}>
                {version} ({buildNumber})
              </Text>
            </View>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutRow}
          activeOpacity={0.85}
          onPress={handleLogout}
        >
          <Image source={LOGOUT} style={styles.logoutIcon} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* BottomSheet for Reset Password */}
        <BottomSheet visible={sheet === 'newPassword'} onClose={close}>
          <Text style={styles.sheetTitle}>Create New Password</Text>
          <Text style={styles.sheetSub}>
            This password should be different from the previous password.
          </Text>

          <Text style={styles.inputLabel}>New Password</Text>
          <TextInput
            style={styles.input}
            placeholder="New Password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />

          <Text style={styles.inputLabel}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <TouchableOpacity
            style={[styles.primaryBtn, { marginTop: 16 }]}
            onPress={handleResetPassword}
            disabled={resetPassword.isPending}
          >
            <Text style={styles.primaryBtnText}>
              {resetPassword.isPending ? 'Resetting...' : 'Reset Password'}
            </Text>
          </TouchableOpacity>
        </BottomSheet>
      </ScrollView>
    </View>
  );
};

export default MoreScreen;
