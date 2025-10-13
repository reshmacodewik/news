import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useFormik } from 'formik';
import { forgotPassword } from '../../validation/signupSchema';
import ShowToast from '../../Utils/ShowToast';
import { apiPost } from '../../Utils/api/common';
import { API_VERIFY_EMAIL } from '../../Utils/api/APIConstant';
import { styles } from '../../style/ForgotpasswordStyles';
import { goBackNavigation, navigate } from '../../Navigators/utils';

const ForgotPasswordScreen = () => {
  const BACK_ARROW = require('../../icons/back.png');
  const formik = useFormik({
    initialValues: { email: '' },
    validationSchema: forgotPassword,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const res = await apiPost({ url: API_VERIFY_EMAIL, values });
        if (res?.success) {
          ShowToast(res.message || 'OTP sent successfully', 'success');
          navigate('OTPScreen' as never, { email: values.email } as never);
        } else {
          formik.setFieldError('email', res?.error || 'Invalid email');
        }
      } catch (e: any) {
        ShowToast(e?.message || 'Something went wrong', 'error');
      } finally {
        setSubmitting(false);
      }
    },
  });
 const handleBackPress = () => {
      goBackNavigation();
  };

  return (
    <ImageBackground
      source={require('../../icons/background.png')}
      resizeMode="cover"
      style={{ flex: 1 }}
    >
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <TouchableOpacity
        style={styles.backButton}
        onPress={handleBackPress}

      >
        <Image source={BACK_ARROW} style={styles.backIcon} />
      </TouchableOpacity>
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <Image
            source={require('../../icons/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.subtitle}>
            Update password instructions will be sent to the email address
            listed below.
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.otpmainContainer}>
          <View style={styles.otpContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Example@email.com"
              placeholderTextColor="#9CA3AF"
              value={formik.values.email}
              onChangeText={formik.handleChange('email')}
              onBlur={formik.handleBlur('email')}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="done"
            />
            {formik.touched.email && formik.errors.email && (
              <Text style={{ color: 'red', fontSize: 12, marginLeft: 10 }}>
                {formik.errors.email}
              </Text>
            )}
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            style={styles.verifyButton}
            onPress={formik.handleSubmit as any}
            disabled={formik.isSubmitting}
          >
            <Text style={styles.verifyText}>
              {formik.isSubmitting ? 'Sending...' : 'Verify'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

export default ForgotPasswordScreen;
