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
import { API_GET_PROFILE, API_RESET_PASSWORD, API_VERIFY_EMAIL, API_VERIFY_OTP } from '../../Utils/api/APIConstant';
import ShowToast from '../../Utils/ShowToast';
// ---- Assets (replace with your actual files) ----
const LOGO = require('../../icons/logoblack.png');
const AVATAR_BG = require('../../icons/user.png'); // a circular gradient PNG
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
  const inset = useSafeAreaInsets();
  const [sheet, setSheet] = useState<'none' | 'email' | 'code' | 'newPassword'>(
    'none',
  );
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const openEmail = () => setSheet('email');
  const openCode = () => setSheet('code');
  const close = () => setSheet('none');

  const {
    data: profile,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['profile-info'],
    queryFn: async () => {
      const res = await getApiWithOutQuery({ url: API_GET_PROFILE });
      console.log('API response ===>', res); // log it
      return res.data;
    },
  });
// Send password reset email
const requestPasswordReset = useMutation({
  mutationFn: async () => {
    const res = await apiPost({
      url: API_VERIFY_EMAIL,
      values: { email }
    });
    return res.data;
  },
  onSuccess: () => {
    openCode();
  },
  onError: (err) => {
    console.log('Request password reset error', err);
  },
});

// Verify OTP
const verifyOtp = useMutation({
  mutationFn: async () => {
    const res = await apiPost({
      url: API_VERIFY_OTP,
      values: { email,code}
    });
    return res.data;
  },
  onSuccess: () => {
    setSheet('newPassword');
  },
  onError: (err) => {
    console.log('Verify OTP error', err);
  },
});

// Reset password
const resetPassword = useMutation({
  mutationFn: async () => {
    const res = await apiPost({
      url: API_RESET_PASSWORD,
     values :{ email, newPassword, confirmPassword },
    });
    return res.data;
  },
  onSuccess: () => {
    setSheet('none');
  },
  onError: (err) => {
    console.log('Reset password error', err);
  },
});

 const handleSend = () => {
  if (!email) return ShowToast('Please enter your email');
  requestPasswordReset.mutate();
};

const handleVerify = () => {
  if (!code) return ShowToast('Please enter the OTP');
  verifyOtp.mutate();
};

const handleResetPassword = () => {
  if (!newPassword || !confirmPassword) return ShowToast('Please enter all fields');
  if (newPassword !== confirmPassword) return ShowToast('Passwords do not match');
  resetPassword.mutate();
};

  const onEmail = () => Linking.openURL('mailto:support@arcalisnews.com');

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
             
                <>
                  <Text style={styles.name}>{profile?.name }</Text>

                  <View style={styles.line}>
                    <Image source={MAIL} style={styles.smallIcon} />
                    <Text style={styles.lineText}>
                      {profile?.email }
                    </Text>
                  </View>

                  <View style={styles.line}>
                    <Image source={PHONE} style={styles.smallIcon} />
                    <Text style={styles.lineText}>
                      {profile?.phoneNumber }
                    </Text>
                  </View>
                </>
            
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
          <Row icon={LOCK} label="Change Password" onPress={openEmail} />
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
          <Row
            icon={TERMS}
            label="Terms of Usage & Conditions"
            onPress={() => {}}
          />
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
              <Text style={styles.subtle}>1.1 (104)</Text>
            </View>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutRow} activeOpacity={0.85}>
          <Image source={LOGOUT} style={styles.logoutIcon} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
        <BottomSheet visible={sheet !== 'none'} onClose={close}>
          {sheet === 'email' && (
            <>
              <Text style={styles.sheetTitle}>Change Password</Text>
              <Text style={styles.sheetSub}>
                Update password instructions will be sent to the email address
                listed below.
              </Text>

              <Text style={styles.inputLabel}>Email</Text>
               <TextInput
                style={styles.input}
                placeholder="Example@email.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />

              <TouchableOpacity style={[styles.primaryBtn, { marginTop: 16 }]} onPress={handleSend}>
                <Text style={styles.primaryBtnText}>
                  {requestPasswordReset.isPending ? 'Sending...' : 'Send'}
                </Text>
              </TouchableOpacity>
            </>
          )}

          {sheet === 'code' && (
            <>
              <Text style={styles.sheetTitle}>Please Check Your Email</Text>
              <Text style={styles.sheetSub}>
                We have sent the code to{' '}
                <Text style={styles.boldEmail}>
                  {email || 'xyz2@gmail.com'}
                </Text>
              </Text>

              <Text style={styles.inputLabel}>Code</Text>
                 <TextInput
                style={styles.input}
                placeholder="Enter Code"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
                maxLength={6}
                value={code}
                onChangeText={setCode}
              />

              <TouchableOpacity style={[styles.primaryBtn, { marginTop: 16 }]} onPress={handleVerify}>
                <Text style={styles.primaryBtnText}>
                  {verifyOtp.isPending ? 'Verifying...' : 'Verification'}
                </Text>
              </TouchableOpacity>
            </>
          )}

          {sheet === 'newPassword' && (
            <>
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

              <TouchableOpacity style={[styles.primaryBtn, { marginTop: 16 }]} onPress={handleResetPassword}>
                <Text style={styles.primaryBtnText}>
                  {resetPassword.isPending ? 'Resetting...' : 'Reset Password'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </BottomSheet>
      </ScrollView>
    </View>
  );
};

export default MoreScreen;
