import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ImageBackground, KeyboardAvoidingView, Platform } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native'; // To access the route params
 // Import the param list
import { styles } from '../../style/OTPScreenstyles';
import ShowToast from '../../Utils/ShowToast';
import { navigate } from '../../Navigators/utils';
import { RootStackParamList } from '../../Utils/Constant/constant';

type OTPScreenRouteProp = RouteProp<RootStackParamList, 'OTPScreen'>;  // Specify the type of the route params

const OTPScreen = () => {
  const route = useRoute<OTPScreenRouteProp>();  // Use the route prop with the type
  const { email } = route.params;  // Now email is typed

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(TextInput | null)[]>([]);

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

  const handleVerify = () => {
    const code = otp.join('');
    if (code.length < 6) {
      ShowToast('Please enter the complete OTP', 'error');
      return;
    }
    ShowToast('OTP Verified Successfully', 'success');
    navigate('ResetPassword', { email, otp: code });  // Pass email and OTP to ResetPassword screen
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ImageBackground source={require('../../icons/background.png')} resizeMode="cover" style={styles.bg}>
          {/* Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Please Check Your Email</Text>
            <Text style={styles.subtitle}>We have sent the code to {email}</Text>
          </View>

          {/* OTP Input Boxes */}
          <View style={styles.otpmainContainer}>
            <View style={styles.otpContainer}>
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
            <TouchableOpacity style={styles.resendButton} onPress={() => ShowToast('OTP resent to your email', 'success')}>
              <Text style={styles.resendText}>Resend OTP</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.verifyButton} onPress={handleVerify}>
              <Text style={styles.verifyText}>Verify</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </KeyboardAvoidingView>
    </View>
  );
};

export default OTPScreen;
