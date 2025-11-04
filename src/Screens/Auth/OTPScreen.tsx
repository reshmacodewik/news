import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { styles } from '../../style/OTPScreenstyles';
import ShowToast from '../../Utils/ShowToast';
import { navigate } from '../../Navigators/utils';
import { RootStackParamList } from '../../Utils/Constant/constant';
import { apiPost } from '../../Utils/api/common';
import { API_VERIFY_OTP } from '../../Utils/api/APIConstant';
import { useTheme } from '../../context/ThemeContext';

type OTPScreenRouteProp = RouteProp<RootStackParamList, 'OTPScreen'>;

const OTPScreen = () => {
  const route = useRoute<OTPScreenRouteProp>();
  const { email } = route.params;
  const { theme, toggleTheme, colors } = useTheme();
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Handle OTP input
  const handleChange = (text: string, index: number) => {
    if (/^\d*$/.test(text)) {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);

      if (text && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // ✅ API Call to verify OTP
  const handleVerify = async () => {
    const code = otp.join('');

    if (code.length < 6) {
      ShowToast('Please enter the complete OTP', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const response = await apiPost({
        url: API_VERIFY_OTP,
        values: { email, otp: code },
      });

      if (response?.success) {
        ShowToast(response.message || 'OTP Verified Successfully', 'success');
        navigate('ResetPassword', {
          email,
          otp: ''
        });
      } else {
        ShowToast(response?.error || 'Invalid OTP', 'error');
      }
    } catch (error) {
      ShowToast('Something went wrong. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ UI
  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ImageBackground
          source={require('../../icons/background.png')}
          resizeMode="cover"
          style={styles.bg}
        >
          {/* Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Please Check Your Email</Text>
            <Text style={styles.subtitle}>We have sent the code to {email}</Text>
          </View>

          {/* OTP Input Boxes */}
          <View style={[styles.otpmainContainer, { backgroundColor: colors.background }]}>
            <View style={[styles.otpContainer, { backgroundColor: colors.background }]}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  value={digit}
                  style={styles.otpInput}
                  keyboardType="number-pad"
                  maxLength={1}
                  onChangeText={(text) => handleChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  autoFocus={index === 0}
                />
              ))}
            </View>

            {/* Resend Button */}
            <TouchableOpacity
              style={styles.resendButton}
              onPress={() => ShowToast('OTP resent to your email', 'success')}
            >
              <Text style={[styles.resendText, { color: colors.headingtext }]}>Resend OTP</Text>
            </TouchableOpacity>

            {/* Verify Button */}
            <TouchableOpacity
              style={[styles.verifyButton, submitting && { opacity: 0.6 }]}
              onPress={handleVerify}
              disabled={submitting}
            >
              <Text style={styles.verifyText}>
                {submitting ? 'Verifying...' : 'Verify'}
              </Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </KeyboardAvoidingView>
    </View>
  );
};

export default OTPScreen;
