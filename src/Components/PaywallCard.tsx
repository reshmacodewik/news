import React from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');
const isTablet = (Platform.OS === 'ios' && (Platform as any).isPad) || width >= 768;

type Props = {
  mode: 'login' | 'premium' | 'register';
  token?: string;
  onSignIn?: () => void;
  onSubscribe: () => void;
};

const PaywallCard: React.FC<Props> = ({ mode, token, onSignIn, onSubscribe }) => {
  const { theme, colors } = useTheme();
  const isDark = theme === 'dark';

  const isLoggedIn = !!token;
  const showSignIn = (mode === 'login' || mode === 'premium' || mode === 'register') && !isLoggedIn;
  const showSubscribe = mode !== 'register';

  const badgeText =
    mode === 'premium' ? 'Premium Content' :
    mode === 'register' ? 'Login Required' : 'Premium Content';

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        backgroundColor: colors.background,
      }}
    >
      <View
        style={{
          width: '100%',
          maxWidth: isTablet ? 720 : undefined, // keep card narrow on iPad
          backgroundColor: colors.card,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: isDark ? '#333' : '#E5E7EB',
          paddingVertical: 12,
          paddingHorizontal: 18,
          shadowColor: '#000',
          shadowOpacity: 0.05,
          marginTop: 40,
          elevation: 2,
          alignSelf: 'center',
        }}
      >
        {/* Badge */}
        <View
          style={{
            alignSelf: 'center',
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 999,
            backgroundColor: isDark ? '#222' : '#EEF3FB',
            marginBottom: 16,
          }}
        >
          <LockIcon tintColor={isDark ? '#fff' : '#000'} background={isDark ? '#222' : '#EEF3FB'} />
          <Text style={{ marginLeft: 6, fontSize: 12, fontWeight: '700', color: colors.text }}>
            {badgeText}
          </Text>
        </View>

        {/* Logo */}
        <View style={{ alignSelf: 'center', marginBottom: 12 }}>
          <Image
            source={require('../icons/logo1.png')}
            style={{
              width: isTablet ? 320 : 300,
              height: isTablet ? 64 : 60,
              resizeMode: 'contain',
              tintColor: isDark ? '#fff' : undefined,
            }}
          />
        </View>

        {/* Text */}
        <Text
          style={{
            textAlign: 'center',
            color: colors.text,
            fontWeight: '700',
            fontSize: 16,
            marginBottom: 8,
          }}
        >
          Continue reading this article with an Arcalis News subscription
        </Text>

        <Text
          style={{
            textAlign: 'center',
            color: colors.text || (isDark ? '#AAA' : '#6B7280'),
            fontSize: 13,
            lineHeight: 18,
            marginBottom: 20,
          }}
        >
          {mode === 'login'
            ? 'Sign in to your account to continue.'
            : mode === 'register'
            ? 'Please sign in to continue reading.'
            : 'Become a member to unlock this article and more.'}
        </Text>

        {/* Buttons */}
        {showSignIn && showSubscribe ? (
          // Two buttons, 50/50, centered with a max width
          <View
            style={{
              flexDirection: 'row',
              gap: 10,
              width: '100%',
              maxWidth: isTablet ? 560 : 520,
              alignSelf: 'center',
              marginTop: 2,
              marginBottom: 12,
            }}
          >
            <TouchableOpacity
              onPress={onSignIn}
              activeOpacity={0.85}
              style={{
                flex: 1,
                height: 46,
                borderRadius: 10,
                backgroundColor: '#2260B2',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 15 }}>Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onSubscribe}
              activeOpacity={0.85}
              style={{
                flex: 1,
                height: 46,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: '#2260B2',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#2260B2', fontWeight: '700', fontSize: 15 }}>Subscribe Now</Text>
            </TouchableOpacity>
          </View>
        ) : showSignIn ? (
          // Single Sign In button – centered
          <TouchableOpacity
            onPress={onSignIn}
            activeOpacity={0.85}
            style={{
              height: 46,
              width: '100%',
              maxWidth: isTablet ? 420 : 360,
              alignSelf: 'center',
              borderRadius: 10,
              backgroundColor: '#2260B2',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 15 }}>Sign In</Text>
          </TouchableOpacity>
        ) : showSubscribe ? (
          // Single Subscribe button – centered
          <TouchableOpacity
            onPress={onSubscribe}
            activeOpacity={0.85}
            style={{
              height: 46,
              width: '100%',
              maxWidth: isTablet ? 420 : 360,
              alignSelf: 'center',
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#2260B2',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}
          >
            <Text style={{ color: '#2260B2', fontWeight: '700', fontSize: 15 }}>Subscribe Now</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

/** 🔐 Lock Icon */
type LockIconProps = {
  size?: number;
  tintColor?: string;
  background?: string;
  style?: object;
};

export const LockIcon = ({
  size = 22,
  tintColor = '#000',
  background = '#EEF3FB',
  style,
}: LockIconProps) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: background,
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Image
      source={require('../icons/lock.png')}
      style={[
        { width: size * 0.6, height: size * 0.6, tintColor, resizeMode: 'contain' },
        style,
      ]}
    />
  </View>
);

export default PaywallCard;
