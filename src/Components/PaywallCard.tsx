import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';

type Props = {
  mode: 'login' | 'premium' | 'register';
  token?: string; // 👈 new optional prop
  onSignIn?: () => void;
  onSubscribe: () => void;
};

const PaywallCard: React.FC<Props> = ({
  mode,
  token,
  onSignIn,
  onSubscribe,
}) => {
   const isLogin = mode === 'login';
  const isRegister = mode === 'register';
    const isLoggedIn = !!token;

  const badgeText =
    mode === 'premium'
      ? 'Premium Content'
      : mode === 'register'
      ? 'Login Required'
      : 'Premium Content';
 // 👈 detect login

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        backgroundColor: '#F9FAFB',
      }}
    >
      <View
        style={{
          width: '100%',
          backgroundColor: '#FFFFFF',
          borderRadius: 14,
          borderWidth: 1,
          borderColor: '#E5E7EB',
          paddingVertical: 12,
          paddingHorizontal: 18,
          shadowColor: '#000',
          shadowOpacity: 0.05,
          marginTop: 40,
          elevation: 2,
        }}
      >
        {/* 🔒 Lock Badge */}
        <View
          style={{
            alignSelf: 'center',
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 999,
            backgroundColor: '#EEF3FB',
            marginBottom: 16,
          }}
        >
          <LockIcon />
          <Text
            style={{
              marginLeft: 6,
              fontSize: 12,
              fontWeight: '700',
              color: '#111827',
            }}
          >
            {badgeText}
          </Text>
        </View>

        {/* 🖼️ Logo */}
        <View style={{ alignSelf: 'center', marginBottom: 12 }}>
          <Image
            source={require('../icons/logo1.png')}
            style={{
              width: 300,
              height: 60,
              resizeMode: 'contain',
              alignSelf: 'center',
            }}
          />
        </View>

        {/* Text */}
        <Text
          style={{
            textAlign: 'center',
            color: '#111827',
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
            color: '#6B7280',
            fontSize: 13,
            lineHeight: 18,
            marginBottom: 20,
          }}
        >
           {isLogin
            ? 'Sign in to your account to continue.'
            : isRegister
            ? 'Please sign in to continue reading.'
            : 'Become a member to unlock this article and more.'}
        </Text>

        {/* Buttons */}
        <View style={{ marginTop: 2, flexDirection: 'row', flex: 1,width:'100%',gap: 10 }}>
         {((mode === 'login' || mode === 'premium' || mode === 'register') &&
            !isLoggedIn) && (
            <TouchableOpacity
              onPress={onSignIn}
              activeOpacity={0.85}
              style={{
                height: 46,
                width: mode === 'register' ? '60%' : '48%',
                marginHorizontal: mode === 'register' ? 80 : 0,
                borderRadius: 10,
                backgroundColor: '#2260B2',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 15 }}
              >
                Sign In
              </Text>
            </TouchableOpacity>
          )}

          {/* Always show Subscribe Now */}
           {mode !== 'register' && (
          <TouchableOpacity
            onPress={onSubscribe}
            activeOpacity={0.85}
            style={{
              height: 46,
              width: isLogin && !isLoggedIn ? '48%' : '48%',
              marginHorizontal: isLogin && !isLoggedIn ? 0 : 100,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#2260B2',
              alignItems: 'center',
              justifyContent: 'center',

              marginBottom: 12,
            }}
          >
            <Text
              style={{
                color: '#2260B2',
                fontWeight: '700',
                fontSize: 15,
              }}
            >
              Subscribe Now
            </Text>
          </TouchableOpacity>
             )}
        </View>
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
      source={require('../icons/lock.png')} // 👈 update this path
      style={[
        {
          width: size * 0.6,
          height: size * 0.6,
          tintColor: tintColor,
          resizeMode: 'contain',
        },
        style,
      ]}
    />
  </View>
);

export default PaywallCard;
