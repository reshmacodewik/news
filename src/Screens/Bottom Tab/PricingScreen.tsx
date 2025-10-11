import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { useQuery } from '@tanstack/react-query';
import { getApiWithOutQuery } from '../../Utils/api/common';
import { API_SUBSCRIPTION_PLANS } from '../../Utils/api/APIConstant';
import Header from '../../Components/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigate } from '../../Navigators/utils';
import { styles } from '../../style/PricingStyles';
import { useAuth } from '../Auth/AuthContext';

const scale = (size: number) => (Dimensions.get('window').width / 375) * size;

// Dummy icons
const LOGO = require('../../icons/logoblack.png');
const AVATAR = require('../../icons/user.png');
const CHECK = require('../../icons/checkBlue.png');
const DOT = require('../../icons/dot.png');

type Plan = {
  _id: string;
  name: string;
  description: string;
  price: { monthly: number; yearly: number };
  features: string[];
  highlight?: boolean;
};

const SUCCESS_URL_KEYWORD = 'thank-you'; // replace with your Lemon Squeezy success redirect
const CANCEL_URL_KEYWORD = 'cancel'; // optional

const PricingScreen: React.FC = () => {
  const selectedCadence: 'monthly' | 'yearly' = 'monthly';
  const insets = useSafeAreaInsets();
 const {  session } = useAuth();
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  // Fetch subscription plans
  const { data, isLoading } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const res = await getApiWithOutQuery({ url: API_SUBSCRIPTION_PLANS });
      return res.data as Plan[];
    },
  });

  const mostExpensive =
    Array.isArray(data) && data.length
      ? data.reduce(
          (prev, curr) =>
            curr.price[selectedCadence] > prev.price[selectedCadence]
              ? curr
              : prev,
          data[0],
        )
      : null;

  // Handle subscription click
  const handleSubscribe = async (planId: string) => {
    try {
      setLoadingPlan(planId);

      const billingCycle = selectedCadence;
      //const sessionData = await AsyncStorage.getItem('userSession');
      const userId = session?.user?.id;
        console.log('userId:', userId);

      //   Alert.alert('Debug subscription fields:', {
      //   planId,
      //   billingCycle,
      //   userId,
      // });

      if (!planId || !billingCycle || !userId) {
        Alert.alert('Error', 'Missing required fields for subscription');
        return;
      }

      const bodyData = { planId, userId, billingCycle };

      const res = await fetch(
        'http://192.168.1.36:9991/api/billing/create-checkout',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyData),
        },
      );

      const json = await res.json();
      console.log('Checkout API response:', json);

      if (!res.ok || !json?.data?.checkoutUrl) {
        throw new Error(json?.error || 'Failed to create checkout');
      }

      const url = json.data.checkoutUrl;
      console.log('Opening WebView checkout URL:', url);

      // Open inside WebView
      setCheckoutUrl(url);
    } catch (e) {
      console.error('Error creating checkout:', e);
      Alert.alert('Error', 'Failed to create checkout.');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ height: insets.top }} />
      <Header
        logoSource={LOGO}
        avatarSource={AVATAR}
        guestRoute="More"
        authRoute="More"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + scale(28) }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Subscription Plans</Text>

        {Array.isArray(data) && data.length > 0 ? (
          data.map(plan => {
            const isMostPopular = plan._id === mostExpensive?._id;

            return (
              <View
                key={plan._id}
                style={[
                  styles.planCard,
                  plan.highlight && styles.planCardHighlight,
                  isMostPopular && { borderColor: '#2260B2', borderWidth: 3 },
                ]}
              >
                {isMostPopular && (
                  <View style={styles.ribbon}>
                    <Text style={styles.ribbonText}>MOST POPULAR PLAN</Text>
                  </View>
                )}

                <View style={styles.innerCard}>
                  <Text style={styles.planTitle}>{plan.name}</Text>
                  <Text style={styles.planSubtitle}>{plan.description}</Text>

                  <View style={styles.priceRow}>
                    <Text style={styles.price}>
                      ${plan.price[selectedCadence] ?? 0}
                    </Text>
                    <Text style={styles.cadence}>/{selectedCadence}</Text>
                  </View>

                  <View style={{ marginTop: scale(12) }}>
                    {plan.features.map((feature, i) => (
                      <View key={i} style={styles.featureRow}>
                        <Image
                          source={i === 0 ? CHECK : DOT}
                          style={[
                            styles.featureIcon,
                            i === 0 && styles.featureIconBlue,
                          ]}
                        />
                        <Text
                          style={[
                            styles.featureText,
                            i === 0 && styles.featureTextBold,
                          ]}
                        >
                          {feature}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.ctaBtn,
                      isMostPopular && { backgroundColor: '#333333' },
                      loadingPlan === plan._id && { opacity: 0.6 },
                    ]}
                    activeOpacity={0.9}
                    disabled={loadingPlan === plan._id}
                    onPress={() => handleSubscribe(plan._id)}
                  >
                    <Text
                      style={[
                        styles.ctaText,
                        isMostPopular && { color: '#fff' },
                      ]}
                    >
                      {loadingPlan === plan._id
                        ? 'Processing...'
                        : 'Subscribe Now'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        ) : !isLoading ? (
          <Text style={{ textAlign: 'center', marginTop: 20 }}>
            No plans available.
          </Text>
        ) : null}

        {/* WebView Modal */}
        <Modal
          visible={!!checkoutUrl}
          animationType="slide"
          onRequestClose={() => setCheckoutUrl(null)}
        >
          <TouchableOpacity
            onPress={() => setCheckoutUrl(null)}
            style={{ padding: 16, backgroundColor: '#000' }}
          >
            <Text style={{ color: '#fff' }}>Close</Text>
          </TouchableOpacity>

          {checkoutUrl && (
            <WebView
              source={{ uri: checkoutUrl }}
              originWhitelist={['*']}
              javaScriptEnabled
              domStorageEnabled
              startInLoadingState
              setSupportMultipleWindows={false}
              onNavigationStateChange={navState => {
                console.log('WebView URL:', navState.url);

                if (navState.url.includes(SUCCESS_URL_KEYWORD)) {
                  setCheckoutUrl(null);
                  navigate('PaymentSuccess' as never);
                } else if (navState.url.includes(CANCEL_URL_KEYWORD)) {
                  setCheckoutUrl(null);
                  Alert.alert('Payment canceled', 'Please try again.');
                }
              }}
              onError={syntheticEvent => {
                const { nativeEvent } = syntheticEvent;
                console.warn('WebView error: ', nativeEvent);
              }}
              onHttpError={syntheticEvent => {
                const { nativeEvent } = syntheticEvent;
                console.warn('WebView HTTP error: ', nativeEvent);
              }}
              renderLoading={() => (
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <ActivityIndicator size="large" color="#2260B2" />
                  <Text style={{ marginTop: 8 }}>Loading...</Text>
                </View>
              )}
            />
          )}
        </Modal>
      </ScrollView>
    </View>
  );
};

export default PricingScreen;
