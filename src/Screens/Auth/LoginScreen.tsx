import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ImageBackground,
} from 'react-native';
import { styles } from '../../style/LoginScreenstyles';
import React from 'react';
import { navigate } from '../../Navigators/utils';
import { useFormik } from 'formik';
import { loginSchema } from '../../validation/signupSchema';
import ShowToast from '../../Utils/ShowToast';
import { apiPost } from '../../Utils/api/common';
import { API_LOGIN } from '../../Utils/api/APIConstant';
import { AuthSession, useAuth } from './AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = () => {
  const { signIn } = useAuth();
  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: loginSchema,
    onSubmit: async values => {
      try {
        const res = await apiPost({ url: API_LOGIN, values });
        if (res?.success) {
          const session: AuthSession = {
            accessToken: res.data.token,
            user: {
              id: res.data.id,
              name: res.data.name,
              email: res.data.email,
            },
          };
          signIn(session);
          await AsyncStorage.setItem('userSession', JSON.stringify(session));
          ShowToast(res?.message, 'success');
          navigate('Home' as never);
        } else {
          formik.setFieldError('password', res?.error);
        }
      } catch (e: any) {
        ShowToast(e?.message || 'Something went wrong', 'error');
      }
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ImageBackground
          source={require('../../icons/background.png')}
          resizeMode="cover"
          style={{ flex: 1 }}
        >
          {/* Header Section */}
          <View style={styles.headerContainer}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../icons/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.welcomeText}>Welcome Readers 👋</Text>
            <Text style={styles.subtitleText}>
              Stay connected with breaking headlines and insights
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
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
              />
              {formik.touched.email && formik.errors.email && (
                <Text style={{ color: 'red', fontSize: 12 }}>
                  {formik.errors.email}
                </Text>
              )}
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter a password"
                placeholderTextColor="#9CA3AF"
                value={formik.values.password}
                onChangeText={formik.handleChange('password')}
                onBlur={formik.handleBlur('password')}
                secureTextEntry
                autoCapitalize="none"
              />
              {formik.touched.password && formik.errors.password && (
                <Text style={{ color: 'red', fontSize: 12 }}>
                  {formik.errors.password}
                </Text>
              )}
            </View>

            {/* Forgot Password Link */}
            <TouchableOpacity
              style={styles.forgotPasswordContainer}
              onPress={() => console.log('Forgot Password pressed')}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <TouchableOpacity
              style={styles.signInButton}
              onPress={() => formik.handleSubmit()}
            >
              <Text style={styles.signInButtonText}>Sign in</Text>
            </TouchableOpacity>

            {/* Or Separator */}
            <View style={styles.separatorContainer}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>Or</Text>
              <View style={styles.separatorLine} />
            </View>

            {/* Social Sign In Buttons */}
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => console.log('Google Sign in pressed')}
            >
              <Image
                source={require('../../icons/Google.png')}
                style={styles.socialIcon}
              />
              <Text style={styles.socialButtonText}>Sign in with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => console.log('Facebook Sign in pressed')}
            >
              <Image
                source={require('../../icons/Facebook.png')}
                style={styles.socialIcon}
              />
              <Text style={styles.socialButtonText}>Sign in with Facebook</Text>
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>
                Don't you have an account?{' '}
                <Text
                  style={styles.signUpLink}
                  onPress={() => navigate('Signup' as never)}
                >
                  Sign up
                </Text>
              </Text>
            </View>
          </View>
        </ImageBackground>
      </ScrollView>
    </View>
  );
};

export default LoginScreen;
