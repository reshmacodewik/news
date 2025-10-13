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
import * as Yup from 'yup'; // Import Yup for form validation
import ShowToast from '../../Utils/ShowToast';
import { apiPost } from '../../Utils/api/common';
import { API_RESET_PASSWORD } from '../../Utils/api/APIConstant';
import { styles } from '../../style/ForgotpasswordStyles';
import { navigate } from '../../Navigators/utils';
import { changepasswordSchema } from '../../validation/signupSchema';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../Utils/Constant/constant';

type ResetScreenRouteProp = RouteProp<RootStackParamList, 'ResetPassword'>;

const ResetPasswordScreen = () => {
  const route = useRoute<ResetScreenRouteProp>(); // Use the route prop with the type
  const { email, otp } = route.params;
  const formik = useFormik({
    initialValues: { newPassword: '', confirmPassword: '' },
    validationSchema: changepasswordSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
         const res = await apiPost({
          url: API_RESET_PASSWORD,
          values: {
            email,                 
            otp,                    
            newPassword: values.newPassword,  // Sending new password from form
            confirmPassword: values.confirmPassword  // Sending confirm password from form
          }
        });
        if (res?.success) {
          ShowToast(res.message || 'Password changed successfully', 'success');
          navigate('Login'); // Navigate to Login screen after successful reset
        } else {
          ShowToast(res?.error || 'Error updating password', 'error');
        }
      } catch (e: any) {
        ShowToast(e?.message || 'Something went wrong', 'error');
      } finally {
        setSubmitting(false);
      }
    },
  });

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
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section */}
          <View style={styles.headerContainer}>
            <Image
              source={require('../../icons/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Create New Password</Text>
            <Text style={styles.subtitle}>
              This password should be different from the previous password.
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.otpmainContainer}>
            {/* New Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>New Password</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter new password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                value={formik.values.newPassword}
                onChangeText={formik.handleChange('newPassword')}
                onBlur={formik.handleBlur('newPassword')}
                returnKeyType="next"
              />
              {formik.touched.newPassword && formik.errors.newPassword && (
                <Text style={{ color: 'red', fontSize: 12, marginLeft: 10 }}>
                  {formik.errors.newPassword}
                </Text>
              )}
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Confirm your password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                value={formik.values.confirmPassword}
                onChangeText={formik.handleChange('confirmPassword')}
                onBlur={formik.handleBlur('confirmPassword')}
                returnKeyType="done"
              />
              {formik.touched.confirmPassword &&
                formik.errors.confirmPassword && (
                  <Text style={{ color: 'red', fontSize: 12, marginLeft: 10 }}>
                    {formik.errors.confirmPassword}
                  </Text>
                )}
            </View>

            {/* Verify Button */}
            <TouchableOpacity
              style={styles.verifyButton}
              onPress={formik.handleSubmit}
              disabled={formik.isSubmitting}
            >
              <Text style={styles.verifyText}>
                {formik.isSubmitting ? 'Sending...' : 'Reset Password'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

export default ResetPasswordScreen;
