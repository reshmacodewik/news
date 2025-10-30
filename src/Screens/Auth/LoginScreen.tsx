import React, { useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ImageBackground,
  Platform,
} from 'react-native';
import { styles } from '../../style/LoginScreenstyles';
import { navigate } from '../../Navigators/utils';
import { useFormik } from 'formik';
import { loginSchema } from '../../validation/signupSchema';
import ShowToast from '../../Utils/ShowToast';
import { apiPost } from '../../Utils/api/common';
import { API_LOGIN, API_SOCIAL_LOGIN } from '../../Utils/api/APIConstant';
import { AuthSession, useAuth } from './AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { jwtDecode } from 'jwt-decode';
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';
import {
  GoogleSignin,
  statusCodes,
  SignInSuccessResponse,
} from '@react-native-google-signin/google-signin';

const LoginScreen = () => {
  const isFocused = useIsFocused();
  const { signIn, session } = useAuth();

  // --- GOOGLE CONFIGURATION ---
  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '702876724757-g0m95a0bjcsca87lq2t8muegdkje0rn5.apps.googleusercontent.com', // <-- Web Client ID
      iosClientId:
        '702876724757-l3vlvrcp65lf5iqnfo18obnb71fu89fh.apps.googleusercontent.com',
      offlineAccess: true,
      scopes: ['profile', 'email'],
      forceCodeForRefreshToken: false,
    });
  }, []);

  useEffect(() => {
    if (isFocused && session) navigate('Home' as never);
  }, [isFocused, session]);

  // ---------- EMAIL/PASSWORD LOGIN ----------
  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: loginSchema,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      try {
        const res = await apiPost({ url: API_LOGIN, values });
        if (res?.success && res?.data?.token) {
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

  // ---------- GOOGLE LOGIN ----------
  const handleGoogleSignIn = async () => {
    console.log('👉 Google Sign-In button pressed');
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // Sign-in flow
      const gUser = (await GoogleSignin.signIn()) as SignInSuccessResponse;
      console.log('✅ Google user:', gUser);

      const tokens = await GoogleSignin.getTokens();
      const idToken = tokens?.idToken;

      if (!idToken) {
        return ShowToast('No ID token from Google', 'error');
      }

      // Extract user details safely
      const googleUser = gUser.data?.user ?? {};
      let decoded: any = {};
      try {
        decoded = jwtDecode(idToken);
      } catch {}

      const name = googleUser.name ?? decoded?.name ?? '';
      const email = googleUser.email ?? decoded?.email ?? '';
      const picture = googleUser.photo ?? decoded?.picture ?? '';
      const googleId = googleUser.id ?? decoded?.sub ?? '';

      console.log('📦 Sending to backend:', {
        tokenId: idToken,
        name,
        email,
        picture,
        googleId,
      });

      const res = await apiPost({
        url: API_SOCIAL_LOGIN,
        values: {
          tokenId: idToken,
          name,
          email,
          picture,
          googleId,
        },
      });

      console.log('🌍 Backend response:', res);

      if (res?.success && res?.data?.token) {
        const newSession: AuthSession = {
          accessToken: res.data.token,
          user: {
            id: res.data.id,
            name: res.data.name ?? name,
            email: res.data.email ?? email,
          },
        };
        signIn(newSession);
        await AsyncStorage.setItem('userSession', JSON.stringify(newSession));
        ShowToast(res?.message ?? 'Google login successful', 'success');
        navigate('Home' as never);
      } else {
        console.log('❌ Google login backend error:', res);
        ShowToast(res?.message || 'Google login failed', 'error');
      }
    } catch (err: any) {
      console.log('❌ Google Sign-In Error:', err);
      if (err.code === statusCodes.SIGN_IN_CANCELLED)
        return ShowToast('Sign-in cancelled', 'info');
      if (err.code === statusCodes.IN_PROGRESS)
        return ShowToast('Google sign-in already in progress', 'info');
      if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE)
        return ShowToast('Update Google Play Services', 'error');
      ShowToast(err?.message || 'Google sign-in failed', 'error');
    }
  };


  const isIOS = Platform.OS === 'ios';
  const buttonIcon = isIOS
    ? require('../../icons/apple.png')
    : require('../../icons/Facebook.png');

  const buttonText = isIOS ? 'Sign in with Apple' : 'Sign in with Facebook';

  // const handlePress = isIOS ? handleAppleSignIn : handleFacebookSignIn;

  // const handleFacebookSignIn = async () => {
  //   try {
  //     try { LoginManager.logOut(); } catch {}
  //     const result = await LoginManager.logInWithPermissions(
  //       ['public_profile', 'email']
  //     );
  //     if (result.isCancelled) return ShowToast('Facebook sign-in cancelled', 'info');

  //     const tok = await AccessToken.getCurrentAccessToken();
  //     if (!tok?.accessToken) return ShowToast('No Facebook access token', 'error');

  //     const res = await apiPost({
  //       url: API_FACEBOOK_LOGIN,
  //       values: { accessToken: tok.accessToken.toString() },
  //     });

  //     if (!res?.success || !res?.data?.token) {
  //       return ShowToast(res?.message || res?.error || 'Facebook login failed', 'error');
  //     }

  //     const session = {
  //       accessToken: res.data.token,
  //       user: { id: res.data.id, name: res.data.name, email: res.data.email },
  //     };
  //     signIn(session);
  //     await AsyncStorage.setItem('userSession', JSON.stringify(session));
  //     ShowToast('Login successful', 'success');
  //     navigate('Home' as never);
  //   } catch (e: any) {
  //     ShowToast(e?.message || 'Facebook sign-in failed', 'error');
  //   }
  // };
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
                <Text
                  style={{
                    color: 'red',
                    fontSize: 12,
                    marginLeft: 10,
                    marginTop: 5,
                  }}
                >
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
                <Text
                  style={{
                    color: 'red',
                    fontSize: 12,
                    marginLeft: 10,
                    marginTop: 5,
                  }}
                >
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

            <TouchableOpacity style={styles.socialButton} onPress={() => {}}>
              <Image source={buttonIcon} style={styles.socialIcon} />
              <Text style={styles.socialButtonText}>{buttonText}</Text>
            </TouchableOpacity>

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
