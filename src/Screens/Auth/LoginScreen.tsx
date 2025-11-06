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
import { useTheme } from '../../context/ThemeContext';
import appleAuth from '@invertase/react-native-apple-authentication';

const LoginScreen = () => {
  const isFocused = useIsFocused();
  const { signIn, session } = useAuth();
  const { theme, toggleTheme, colors } = useTheme();
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
          API_SOCIAL_LOGIN,
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
      try {
        LoginManager.logOut();
      } catch {}

      // request permissions
      const result = await LoginManager.logInWithPermissions([
        'public_profile',
        'email',
      ]);
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
      const fbUser = await fetch(
        `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${accessToken}`,
      ).then(res => res.json());

      const socialData = {
        facebookId: fbUser.id,
        name: fbUser.name,
        email: fbUser.email,
        picture: fbUser.picture?.data?.url,
        accessToken,
      };

      console.log('📤 Sending to backend:', socialData);

      const response = await axios.post(
        API_SOCIAL_LOGIN,
        socialData,
      );
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
        console.log(newSession);
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

  const handleAppleSignIn = async () => {
    // 1) APPLE AUTH REQUEST
    try {
      if (!appleAuth.isSupported) {
        ShowToast('Apple Sign-In not supported on this device.', 'error');
        return;
      }

      const res = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      const {
        user: appleUserId,
        email: emailFromRes,
        fullName,
        identityToken,
      } = res;

      if (!identityToken) {
        ShowToast('Apple returned no identity token.', 'error');
        return;
      }

      // optional: verify credential state (authorized / revoked / transferred)
      try {
        const state = await appleAuth.getCredentialStateForUser(appleUserId);
        if (state !== appleAuth.State.AUTHORIZED) {
          ShowToast(`Apple credential state: ${state}`, 'error');
          return;
        }
      } catch (e) {
        console.log('getCredentialStateForUser error:', e);
      }

      // Decode + build display data
      type AppleIdToken = { sub?: string; email?: string };
      let decoded: AppleIdToken = {};
      try {
        decoded = jwtDecode<AppleIdToken>(identityToken);
      } catch {}

      const builtName = [fullName?.givenName, fullName?.familyName]
        .filter(Boolean)
        .join(' ')
        .trim();

      const savedEmail = await AsyncStorage.getItem('apple:lastEmail');
      const savedName = await AsyncStorage.getItem('apple:lastName');

      const finalEmail = emailFromRes || decoded.email || savedEmail || '';
      const finalName = builtName || savedName || 'Apple User';

      if (finalEmail) await AsyncStorage.setItem('apple:lastEmail', finalEmail);
      if (builtName) await AsyncStorage.setItem('apple:lastName', builtName);

      // 2) BACKEND LOGIN
      try {
        const response = await axios.post(
            API_SOCIAL_LOGIN,
          {
            provider: 'apple',
            appleId: appleUserId ,
            email: finalEmail ,
            name: finalName,
            idToken: identityToken,
          },
          { timeout: 10000 },
        );
        console.log(response);
        if (response.data?.success && response.data?.data?.token) {
          const newSession: AuthSession = {
            accessToken: response.data.data.token,
            user: {
              id: response.data.data.id,
              name: response.data.data.name || finalName,
              email: response.data.data.email || finalEmail,
              photo: response.data.data.photo,
            },
          };
          console.log(newSession);
          await AsyncStorage.setItem('userSession', JSON.stringify(newSession));
          signIn(newSession);
          ShowToast(`Welcome ${newSession.user.name}!`, 'success');
          navigate('Home' as never);
          return;
        }

        console.log('Backend Apple login failed:', response.data);
        ShowToast(
          response.data?.message || 'Apple backend login failed',
          'error',
        );
      } catch (netErr: any) {
        console.log(
          'Network/backend error:',
          netErr?.response?.data || netErr?.message || netErr,
        );
        ShowToast(
          netErr?.response?.data?.message || netErr?.message || 'Network error',
          'error',
        );
      }
    } catch (appleErr: any) {
      // DETAILED APPLE ERRORS
      console.log(
        '🍎 Apple Sign-In Error (raw):',
        appleErr,
        JSON.stringify(appleErr),
      );
      if (appleErr?.code === appleAuth.Error.CANCELED) {
        ShowToast('Apple Sign-In cancelled', 'info');
      } else if (appleErr?.code === appleAuth.Error.FAILED) {
        ShowToast('Apple Sign-In failed', 'error');
      } else if (appleErr?.code === appleAuth.Error.INVALID_RESPONSE) {
        ShowToast('Invalid response from Apple', 'error');
      } else if (appleErr?.code === appleAuth.Error.NOT_HANDLED) {
        ShowToast('Apple Sign-In not handled', 'error');
      } else if (appleErr?.code === appleAuth.Error.UNKNOWN) {
        ShowToast('Unknown Apple Sign-In error', 'error');
      } else {
        ShowToast(
          appleErr?.message || 'Unexpected Apple Sign-In error',
          'error',
        );
      }
    }
  };

  const handlePress = isIOS ? handleAppleSignIn : handleFacebookSignIn;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
          <View
            style={[
              styles.formContainer,
              { backgroundColor: colors.background },
            ]}
          >
            {/* Email */}
          <View style={[styles.inputContainer, styles.fieldMax]}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Email
              </Text>
              <TextInput
                style={[styles.textInput]}
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
            <View style={[styles.inputContainer, styles.fieldMax]}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Password
              </Text>
              <TextInput
                style={[styles.textInput]}
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
            <View style={styles.fieldRowRight}>
            <TouchableOpacity
              style={styles.forgotPasswordContainer}
              onPress={() => navigate('ForgotPassword' as never)}
            >
              <Text
                style={[
                  styles.forgotPasswordText,
                  { color: colors.headingtext },
                ]}
              >
                Forgot Password?
              </Text>
            </TouchableOpacity>
          </View> 
            {/* Email/Password Sign In */}
            <TouchableOpacity
              style={[styles.signInButton, styles.fieldMax]}
              onPress={() => formik.handleSubmit()}
              disabled={formik.isSubmitting}
            >
              <Text style={styles.signInButtonText}>
                {formik.isSubmitting ? 'Signing in...' : 'Sign in'}
              </Text>
            </TouchableOpacity>

            {/* Or */}
           <View style={[styles.separatorContainer, styles.fieldMax]}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>Or</Text>
              <View style={styles.separatorLine} />
            </View>

            {/* Google */}
            <TouchableOpacity
               style={[styles.socialButton, styles.fieldMax,
                {
                  backgroundColor: theme === 'dark' ? '#222' : '#fff',
                  borderWidth: 1,
                  borderColor: theme === 'dark' ? '#fff' : '#ddd',
                },
              ]}
              onPress={handleGoogleSignIn}
            >
              <Image
                source={require('../../icons/Google.png')}
                style={styles.socialIcon}
              />
              <Text style={[styles.socialButtonText, { color: colors.text }]}>
                Sign in with Google
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialButton, styles.fieldMax,
                {
                  backgroundColor: theme === 'dark' ? '#222' : '#fff',
                  borderWidth: 1,
                  borderColor: theme === 'dark' ? '#fff' : '#ddd',
                },
              ]}
              onPress={handlePress}
            >
              <Image source={buttonIcon} style={styles.socialIcon} />
              <Text style={[styles.socialButtonText, { color: colors.text }]}>
                {buttonText}
              </Text>
            </TouchableOpacity>

            {/* Sign Up */}
            <View style={styles.signUpContainer}>
              <Text style={[styles.signUpText, { color: colors.text }]}>
                Don't you have an account?{' '}
                <Text
                  style={[styles.signUpLink, { color: colors.headingtext }]}
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
