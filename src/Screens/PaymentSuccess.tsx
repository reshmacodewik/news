// src/Screens/PaymentSuccess.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { styles } from '../style/PaymentSuccess';
// reuse your styles or create new

const PaymentSuccess: React.FC = () => {
  const navigation = useNavigation();

  return (
    <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
        🎉 Payment Successful!
      </Text>
      <Text style={{ fontSize: 16, color: '#555', marginBottom: 32 }}>
        Your subscription is now active.
      </Text>
      <TouchableOpacity
        style={styles.ctaBtn}
        onPress={() => navigation.navigate('Home' as never)}
      >
        <Text style={styles.ctaText}>Go to Home</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PaymentSuccess;
