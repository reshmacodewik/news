// components/PaywallCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

type Props = {
  mode: 'login' | 'premium';
  onSignIn: () => void;
  onViewPlans?: () => void;
};

const BLUE = '#2260B2';
const BLUE_DARK = '#1d56a3';
const BORDER = '#E5E7EB';
const TEXT = '#111827';
const MUTED = '#6B7280';
const CARD_BG = '#FFFFFF';
const BADGE_BG = '#EEF3FB';

const PaywallCard: React.FC<Props> = ({ mode, onSignIn, onViewPlans }) => {
  const isLogin = mode === 'login';

  return (
    <View
      style={{
        marginHorizontal: 16,
        marginTop: 12,
        padding: 16,
        backgroundColor: CARD_BG,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: BORDER,
      }}
    >
      {/* Badge */}
      <View
        style={{
          alignSelf: 'center',
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 10,
          paddingVertical: 6,
          borderRadius: 999,
          backgroundColor: BADGE_BG,
          marginBottom: 12,
        }}
      >
        <LockIcon />
        <Text style={{ marginLeft: 6, fontSize: 12, fontWeight: '700', color: TEXT }}>
          Premium content
        </Text>
      </View>

      {/* Title + copy */}
      <Text
        style={{
          fontSize: 16,
          lineHeight: 22,
          fontWeight: '700',
          color: TEXT,
          textAlign: 'center',
          marginBottom: 6,
        }}
      >
        {isLogin ? 'Sign in required' : 'Subscribe to continue'}
      </Text>
      <Text
        style={{
          fontSize: 13,
          lineHeight: 18,
          color: MUTED,
          textAlign: 'center',
          marginBottom: 14,
        }}
      >
        {isLogin
          ? 'Please sign in to read this article.'
          : 'Become a member to unlock this article and more.'}
      </Text>

      {/* Primary CTA */}
      <TouchableOpacity
        onPress={onSignIn}
        activeOpacity={0.85}
        style={{
          height: 44,
          borderRadius: 10,
          backgroundColor: BLUE,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: isLogin ? 2 : 10,
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Sign In</Text>
      </TouchableOpacity>

      {/* Secondary CTA (only for premium) */}
      {!isLogin && (
        <TouchableOpacity
          onPress={onViewPlans}
          activeOpacity={0.85}
          style={{
            height: 44,
            borderRadius: 10,
            borderWidth: 1.5,
            borderColor: BLUE,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: BLUE, fontWeight: '700', fontSize: 15 }}>View Plans</Text>
        </TouchableOpacity>
      )}

      {/* tiny reassurance line */}
      <Text
        style={{
          marginTop: 10,
          fontSize: 11,
          textAlign: 'center',
          color: MUTED,
        }}
      >
        Secure sign-in • Cancel anytime
      </Text>
    </View>
  );
};

/** tiny inline lock icon (no deps) */
const LockIcon = () => (
  <View
    style={{
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: '#DBE7FB',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <View
      style={{
        width: 9,
        height: 7,
        borderWidth: 1.6,
        borderColor: '#184A8F',
        borderRadius: 2,
        borderTopLeftRadius: 2,
        borderTopRightRadius: 2,
        borderBottomLeftRadius: 2,
        borderBottomRightRadius: 2,
      }}
    />
    <View
      style={{
        position: 'absolute',
        top: 3,
        width: 8,
        height: 5,
        borderTopLeftRadius: 6,
        borderTopRightRadius: 6,
        borderWidth: 1.6,
        borderBottomWidth: 0,
        borderColor: '#184A8F',
      }}
    />
  </View>
);

export default PaywallCard;
