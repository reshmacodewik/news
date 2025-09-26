import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ImageBackground,
} from 'react-native';
import { styles } from '../../style/SignupScreenstyles';

const SignupScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [subscribeNews, setSubscribeNews] = useState(false);

  const handleSignUp = () => {
    if (!agreeTerms) return; // guard
    console.log('Sign up pressed', { name, email, subscribeNews });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
            <Text style={styles.welcomeText}>Create Your Account</Text>
            <Text style={styles.subtitleText}>
              Sign up to receive breaking news, trending stories, and
              personalized updates.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Name"
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            {/* Email */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Example@email.com"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.textInput}
                placeholder="at least 8 characters"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* --- Checkboxes --- */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setAgreeTerms(v => !v)}
              style={styles.checkboxRow}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: agreeTerms }}
            >
              <View
                style={[
                  styles.checkboxBox,
                  agreeTerms && styles.checkboxBoxChecked,
                ]}
              >
                {agreeTerms ? <Text style={styles.checkIcon}>✓</Text> : null}
              </View>
              <Text style={styles.checkboxText}>
                I agree to the website’s{' '}
                <Text style={styles.linkText}>Terms & Conditions</Text> and{' '}
                <Text style={styles.linkText}>Privacy Policy</Text>.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setSubscribeNews(v => !v)}
              style={styles.checkboxRow}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: subscribeNews }}
            >
              <View
                style={[
                  styles.checkboxBox,
                  subscribeNews && styles.checkboxBoxChecked,
                ]}
              >
                {subscribeNews ? <Text style={styles.checkIcon}>✓</Text> : null}
              </View>
              <Text style={styles.checkboxText}>
                I want to receive newsletters, updates, and personalized news.
              </Text>
            </TouchableOpacity>

            {/* CTA */}
            <TouchableOpacity
              style={[styles.signInButton, !agreeTerms && { opacity: 0.6 }]}
              onPress={handleSignUp}
              disabled={!agreeTerms}
              activeOpacity={0.9}
            >
              <Text style={styles.signInButtonText}>Sign Up</Text>
            </TouchableOpacity>

            {/* Footer link */}
            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>
                Already have an account?{' '}
                <Text
                  style={styles.signUpLink}
                  onPress={() => console.log('Go to Sign In')}
                >
                  Login In
                </Text>
              </Text>
            </View>
          </View>
        </ImageBackground>
      </ScrollView>
    </View>
  );
};

export default SignupScreen;
