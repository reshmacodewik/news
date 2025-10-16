// LoginScreen.tsx
import React, { useEffect } from 'react';
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
import { navigate } from '../../Navigators/utils';
import { useFormik } from 'formik';
import { loginSchema } from '../../validation/signupSchema';
import ShowToast from '../../Utils/ShowToast';
import { apiPost } from '../../Utils/api/common';
import { API_LOGIN } from '../../Utils/api/APIConstant';
import { AuthSession, useAuth } from './AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';

import {
  GoogleSignin,
  statusCodes,
  User as GoogleUser,
} from '@react-native-google-signin/google-signin';

const LoginScreen = () => {
  const isFocused = useIsFocused();
  const { signIn, session } = useAuth();

  // --- GOOGLE CONFIG ---
  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '702876724757-g0m95a0bjcsca87lq2t8muegdkje0rn5.apps.googleusercontent.com',
      iosClientId:
        '702876724757-l3vlvrcp65lf5iqnfo18obnb71fu89fh.apps.googleusercontent.com',
    });
  }, []);

  useEffect(() => {
    if (isFocused && session) navigate('Home' as never);
  }, [isFocused, session]);

  // ---------- EMAIL/PASSWORD -> API_LOGIN ----------
  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: loginSchema,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      try {
        const res = await apiPost({ url: API_LOGIN, values });
        if (res?.success && res?.data?.token) {
          const newSession: AuthSession = {
            accessToken: res.data.token, // <-- maps your sample
            user: {
              id: res.data.id,
              name: res.data.name,
              email: res.data.email,
            },
          };
          signIn(newSession);
          await AsyncStorage.setItem('userSession', JSON.stringify(newSession));
          ShowToast(res?.message ?? 'Login successful', 'success');
          navigate('Home' as never);
        } else {
          setFieldError('password', res?.error ?? 'Invalid credentials');
        }
      } catch (e: any) {
        ShowToast(e?.message || 'Something went wrong', 'error');
      } finally {
        setSubmitting(false);
      }
    },
  });

  // ---------- GOOGLE -> API_GOOGLE_LOGIN ----------
  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      // Start Google flow
      const gUser = await GoogleSignin.signIn();
      console.log("user",gUser)
      // Ensure idToken
      const tokens = await GoogleSignin.getTokens();
      const idToken = tokens?.idToken ?? (gUser as any)?.idToken;
      if (!idToken)
        return ShowToast(
          'No idToken from Google. Check webClientId & SHA keys.',
          'error',
        );

      // Hit your separate Google auth API
      const res = await apiPost({
        url: API_LOGIN,
        values: { idToken }, // backend verifies & returns your app token
      });

      // Expecting SAME shape as simple login:
      // { success, code, message, data: { id, name, email, token } }
      if (!res?.success || !res?.data?.token) {
        return ShowToast(res?.error || 'Google login failed', 'error');
      }

      const newSession: AuthSession = {
        accessToken: res.data.token,
        user: {
          id: res.data.id,
          name: res.data.name,
          email: res.data.email,
        },
      };

      signIn(newSession);
      await AsyncStorage.setItem('userSession', JSON.stringify(newSession));
      ShowToast(res?.message ?? 'Login successful', 'success');
      navigate('Home' as never);
    } catch (err: any) {
      if (err.code === statusCodes.SIGN_IN_CANCELLED) return;
      if (err.code === statusCodes.IN_PROGRESS)
        return ShowToast('Google sign-in in progress', 'info');
      if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE)
        return ShowToast('Update Google Play Services', 'error');
      ShowToast(err?.message || 'Google sign-in failed', 'error');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      >
        <ImageBackground
          source={require('../../icons/background.png')}
          resizeMode="cover"
          style={{ flex: 1 }}
        >
          {/* Header */}
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

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Email */}
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
                returnKeyType="next"
              />
              {formik.touched.email && formik.errors.email ? (
                <Text style={{ color: 'red', fontSize: 12, marginLeft: 10 }}>
                  {formik.errors.email}
                </Text>
              ) : null}
            </View>

            {/* Password */}
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
                returnKeyType="done"
                onSubmitEditing={() => formik.handleSubmit()}
              />
              {formik.touched.password && formik.errors.password ? (
                <Text style={{ color: 'red', fontSize: 12, marginLeft: 10 }}>
                  {formik.errors.password}
                </Text>
              ) : null}
            </View>

            {/* Forgot */}
            <TouchableOpacity
              style={styles.forgotPasswordContainer}
              onPress={() => navigate('ForgotPassword' as never)}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Email/Password Sign In */}
            <TouchableOpacity
              style={styles.signInButton}
              onPress={() => formik.handleSubmit()}
              disabled={formik.isSubmitting}
            >
              <Text style={styles.signInButtonText}>
                {formik.isSubmitting ? 'Signing in...' : 'Sign in'}
              </Text>
            </TouchableOpacity>

            {/* Or */}
            <View style={styles.separatorContainer}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>Or</Text>
              <View style={styles.separatorLine} />
            </View>

            {/* Google */}
            <TouchableOpacity
              style={styles.socialButton}
              onPress={handleGoogleSignIn}
            >
              <Image
                source={require('../../icons/Google.png')}
                style={styles.socialIcon}
              />
              <Text style={styles.socialButtonText}>Sign in with Google</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              //onPress={handleFacebookSignIn}
            >
              <Image
                source={require('../../icons/Facebook.png')}
                style={styles.socialIcon}
              />
              <Text style={styles.socialButtonText}>Sign in with Facebook</Text>
            </TouchableOpacity>
            {/* (Optional) Facebook can be added later and point to API_FACEBOOK_LOGIN */}

            {/* Sign Up */}
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
