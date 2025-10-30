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
  Platform,
} from 'react-native';
import { styles } from '../../style/LoginScreenstyles';
import { navigate } from '../../Navigators/utils';
import { useFormik } from 'formik';
import { loginSchema } from '../../validation/signupSchema';
import ShowToast from '../../Utils/ShowToast';
import { apiPost } from '../../Utils/api/common';
import { API_LOGIN } from '../../Utils/api/APIConstant'; // <-- ensure this exists
import { AuthSession, useAuth } from './AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { jwtDecode } from 'jwt-decode';
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';

const LoginScreen = () => {
  const isFocused = useIsFocused();
  const { signIn, session } = useAuth();

  // --- GOOGLE CONFIG (Android needs the *WEB* client id here for idToken) ---
  useEffect(() => {
    GoogleSignin.configure({
      // IMPORTANT: Use your OAuth 2.0 Client ID of type "Web application"
      webClientId:
        '702876724757-g0m95a0bjcsca87lq2t8muegdkje0rn5.apps.googleusercontent.com',
      iosClientId:
        '702876724757-l3vlvrcp65lf5iqnfo18obnb71fu89fh.apps.googleusercontent.com',
      offlineAccess: true,
      scopes: ['profile', 'email'],
      forceCodeForRefreshToken: false,
    });
  }, []);

  const googleSignOut = async () => {
    try {
      await GoogleSignin.signOut();
      // await GoogleSignin.revokeAccess();
    } catch {}
  };

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

  // ---------- GOOGLE -> API_GOOGLE_LOGIN ----------
  const handleGoogleSignIn = async () => {
    console.log('👉 Pressed Google Sign-In button');
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      // If a previous attempt exists, ensure clean state on Android
      try {
        await GoogleSignin.signOut();
      } catch {}

      // Start Google flow
      // Start Google flow
      const gUser: any = await GoogleSignin.signIn();
      console.log('✅ Google user (basic):', JSON.stringify(gUser));

      // Get tokens (idToken is what your backend verifies)
      // const { getCurrentUser } = await GoogleSignin.getTokens();
      // if (!getCurrentUser) {
      //   return ShowToast(
      //     'No idToken from Google. Check webClientId & SHA-1/SHA-256.',
      //     'error',
      //   );
      // }

      // let email = '';
      // let name = '';
      // try {
      //   const payload: any = jwtDecode(idToken);
      //    console.log(payload);
      //   email = payload?.email ?? gUser?.user?.email ?? '';
      //   name = payload?.name ?? gUser?.user?.name ?? '';

      // } catch {}

      // === Hit your backend to exchange Google token for your app session ===
      // Body shape must match your server's controller
      // const res = await apiPost({
      //   url: API_GOOGLE_LOGIN, // e.g. '/auth/google/mobile'
      //   values: {
      //     tokenId: idToken,
      //     email,
      //     name,
      //     // You can also send gUser.user.photo if you store avatars
      //     googleId: gUser?.user?.id, // or payload.sub if you prefer
      //     // device info if you log sessions
      //   },
      // });

      // if (!res?.success || !res?.data?.token) {
      //   console.log('🔴 Google exchange error:', res);
      //   return ShowToast(
      //     res?.message || res?.error || 'Google login failed',
      //     'error',
      //   );
      // }

      // // Build your session exactly like email/password path
      // const newSession: AuthSession = {
      //   accessToken: res.data.token,
      //   user: {
      //     id: res.data.id,
      //     name: res.data.name ?? name,
      //     email: res.data.email ?? email,
      //   },
      // };

      // signIn(newSession);
      // await AsyncStorage.setItem('userSession', JSON.stringify(newSession));
      // ShowToast(res?.message ?? 'Login successful', 'success');
      // navigate('Home' as never);
    } catch (err: any) {
      console.log('❌ Google Sign-In Error:', JSON.stringify(err, null, 2));

      if (err.code === statusCodes.SIGN_IN_CANCELLED)
        return ShowToast('Sign-in cancelled', 'info');
      if (err.code === statusCodes.IN_PROGRESS)
        return ShowToast('Google sign-in already in progress', 'info');
      if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE)
        return ShowToast('Update Google Play Services', 'error');

      // Common Android auth codes: 10 (DEVELOPER_ERROR), 12500 (SIGN_IN_FAILED)
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
