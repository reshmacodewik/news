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
  Alert,
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
  SignInResponse,
} from '@react-native-google-signin/google-signin';
import axios from 'axios';

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
    try {
      console.log('🔵 Starting Google Sign-In...');
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      const signInResponse = await GoogleSignin.signIn();

      // ✅ Extract user & token correctly for the latest version
      const user = signInResponse.data?.user;
      const idToken = signInResponse.data?.idToken;

      if (!user || !idToken) {
        Alert.alert('Error', 'Google sign-in failed. Please try again.');
        return;
      }

      const googleData = {
        googleId: user.id,
        email: user.email,
        name: user.name || '',
        picture: user.photo,
        idToken,
      };

      console.log('📤 Sending to backend:', googleData);

      const response = await axios.post(
        'http://192.168.1.36:9991/api/users/social_login',
        googleData,
        { timeout: 10000 },
      );

      console.log('🌍 Backend response:', response.data);

      if (response.data.success && response.data.data?.token) {
        const newSession: AuthSession = {
          accessToken: response.data.data.token,
          user: {
            id: response.data.data.id,
            name: response.data.data.name,
            email: response.data.data.email,
            photo: response.data.data.photo, // if backend sends it
          },
        };

        // ✅ Save session to context + storage
        signIn(newSession);
        await AsyncStorage.setItem('userSession', JSON.stringify(newSession));

        ShowToast('Login successful', 'success');
        navigate('Home' as never);
      } else {
        ShowToast(
          response.data.message || response.data.error || 'Login failed',
          'error',
        );
      }
    } catch (error: any) {
      console.log('🔥 Google Sign-In Error:', error);

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('Cancelled', 'You cancelled Google sign-in.');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('In Progress', 'Google sign-in is already running.');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('Error', 'Google Play Services not available.');
      } else if (error.message?.includes('Network Error')) {
        console.log(
          'Network Error',
          'Please check your internet or server URL.',
        );
      } else {
        console.log('Error', error.message || 'Something went wrong.');
      }
    }
  };
const handleFacebookSignIn = async () => {
  try {
    // ensure logout before new login
    try { LoginManager.logOut(); } catch {}

    // request permissions
    const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
    if (result.isCancelled) {
      ShowToast('Facebook sign-in cancelled', 'info');
      return;
    }

    const data = await AccessToken.getCurrentAccessToken();
    if (!data) {
      ShowToast('No access token received from Facebook', 'error');
      return;
    }

    const { accessToken } = data;

    // optionally fetch user info
    const fbUser = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${accessToken}`).then(res => res.json());

    const socialData = {
      facebookId: fbUser.id,
      name: fbUser.name,
      email: fbUser.email,
      picture: fbUser.picture?.data?.url,
      accessToken,
    };

    console.log('📤 Sending to backend:', socialData);

    const response = await axios.post('http://192.168.1.36:9991/api/users/social_login', socialData);
    console.log('🌍 Backend response:', response.data);

    if (response.data.success && response.data.data?.token) {
      const newSession = {
        accessToken: response.data.data.token,
        user: {
          id: response.data.data.id,
          name: response.data.data.name,
          email: response.data.data.email,
          photo: response.data.data.photo,
        },
      };

      const { signIn } = useAuth();
      signIn(newSession);
      await AsyncStorage.setItem('userSession', JSON.stringify(newSession));

      ShowToast('Login successful', 'success');
      navigate('Home' as never);
    } else {
      ShowToast(response.data.message || 'Facebook login failed', 'error');
    }

  } catch (e: any) {
    console.log('🔥 Facebook Login Error:', e);
    ShowToast(e?.message || 'Facebook login failed', 'error');
  }
};
  const isIOS = Platform.OS === 'ios';
  const buttonIcon = isIOS
    ? require('../../icons/apple.png')
    : require('../../icons/Facebook.png');

  const buttonText = isIOS ? 'Sign in with Apple' : 'Sign in with Facebook';

   const handlePress = isIOS ? handleAppleSignIn : handleFacebookSignIn;

  const handleAppleSignIn = async () => {
    try {
      try { LoginManager.logOut(); } catch {}
      const result = await LoginManager.logInWithPermissions(
        ['public_profile', 'email']
      );
      if (result.isCancelled) return ShowToast('Facebook sign-in cancelled', 'info');

      const tok = await AccessToken.getCurrentAccessToken();
      if (!tok?.accessToken) return ShowToast('No Facebook access token', 'error');

      const res = await apiPost({
        url: API_SOCIAL_LOGIN,
        values: { accessToken: tok.accessToken.toString() },
      });

      if (!res?.success || !res?.data?.token) {
        return ShowToast(res?.message || res?.error || 'Facebook login failed', 'error');
      }

      const session = {
        accessToken: res.data.token,
        user: { id: res.data.id, name: res.data.name, email: res.data.email },
      };
      signIn(session);
      await AsyncStorage.setItem('userSession', JSON.stringify(session));
      ShowToast('Login successful', 'success');
      navigate('Home' as never);
    } catch (e: any) {
      ShowToast(e?.message || 'Facebook sign-in failed', 'error');
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

            <TouchableOpacity style={styles.socialButton}  onPress={handlePress}>
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
