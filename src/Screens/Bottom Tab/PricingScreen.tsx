import React, { useState, useEffect, useRef } from 'react';
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
  Linking,
  Platform,
  AppState,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { getApiWithOutQuery } from '../../Utils/api/common';
import { API_SUBSCRIPTION_PLANS } from '../../Utils/api/APIConstant';
import Header from '../../Components/Header';
import { navigate } from '../../Navigators/utils';
import { styles } from '../../style/PricingStyles';
import { useAuth } from '../Auth/AuthContext';
import PaymentStatusModal from '../../Components/PaymentStatusModal';

const scale = (size: number) => (Dimensions.get('window').width / 375) * size;

const LOGO = require('../../icons/logoblack.png');
const AVATAR = require('../../icons/user.png');
const CHECK = require('../../icons/checkBlue.png');
const DOT = require('../../icons/dot.png');

const PricingScreen: React.FC = () => {
  const [selectedCadence, setSelectedCadence] = useState<'monthly' | 'annual' | 'weekly'>(
    'monthly',
  );

  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  // ✅ Fetch subscription plans
  const { data, isLoading } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const res = await getApiWithOutQuery({ url: API_SUBSCRIPTION_PLANS });
      console.log('Plans response:', res.data);
      return res.data;
    },
  });

  const mostExpensive =
    Array.isArray(data) && data.length
      ? data.reduce((prev, curr) =>
          curr.price[selectedCadence] > prev.price[selectedCadence]
            ? curr
            : prev,
        )
      : null;

  // ✅ Helper with timeout
  const fetchWithTimeout = (url: string, options: any, timeout = 15000) =>
    Promise.race([
      fetch(url, options),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Network timeout')), timeout),
      ),
    ]);

  const handleSubscribe = async (planId: string) => {
    try {
      const billingCycle = selectedCadence;
      const userId =
        (session as any)?.user?.id ||
        (session as any)?.user?._id ||
        (session as any)?.user?.userId;
      const token = session?.accessToken;

      // 🔒 If not logged in → show alert
      if (!token || !userId) {
        Alert.alert(
          'Please log in',
          'You need to log in to subscribe to a plan.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Login',
              onPress: () => navigate('Login', {} as any),
            },
          ],
          { cancelable: true },
        );
        return;
      }

      if (!planId || !billingCycle || !userId) {
        Alert.alert('Error', 'Missing required fields for subscription');
        return;
      }

      setLoadingPlan(planId);

      const res = await fetch(
        `https://api.arcalisnews.com/api/billing/create-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Authorization: `Bearer ${token}`, // uncomment if your API requires auth
          },
          body: JSON.stringify({
            planId,
            userId,
            billingCycle,
          }),
        },
      );

      const json = await res.json();

      if (!res.ok || !json?.data?.checkoutUrl) {
        throw new Error(json?.error || 'Failed to create checkout');
      }

      let url = String(json.data.checkoutUrl || '').trim();
      const trxId = json.data.transactionId;

      if (!/^https?:\/\//i.test(url)) {
        url = `https://${url}`;
      }

      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        setTransactionId(trxId);
        setShowStatusModal(true);
      } else {
      }
    } catch (e) {
      console.error('Error creating checkout:', e);
    } finally {
      setLoadingPlan(null);
    }
  };

  // ✅ Place this at the top of the component (after other useStates)
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      async nextAppState => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
          console.log(
            'App returned to foreground — checking payment status...',
          );
          if (transactionId) {
            try {
              const res = await fetch(
                `https://api.arcalisnews.com/api/billing/billing-check/${transactionId}`,
              );
              const json = await res.json();
              const status = json?.data?.paymentStatus;
              console.log('status on resume:', status);

              if (status === 'completed') setPaymentStatus('completed');
              else if (status === 'failed') setPaymentStatus('failed');
              else setPaymentStatus('pending');
            } catch (err) {
              console.error('Error checking payment on resume:', err);
            }
          }
        }
        appState.current = nextAppState;
      },
    );

    return () => subscription.remove();
  }, [transactionId]);

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
        {/* Billing cycle toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              selectedCadence === 'monthly' && styles.toggleButtonActive,
            ]}
            onPress={() => setSelectedCadence('monthly')}
          >
            <Text
              style={[
                styles.toggleText,
                selectedCadence === 'monthly' && styles.toggleTextActive,
              ]}
            >
              Monthly
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleButton,
              selectedCadence === 'annual' && styles.toggleButtonActive,
            ]}
            onPress={() => setSelectedCadence('annual')}
          >
            <Text
              style={[
                styles.toggleText,
                selectedCadence === 'annual' && styles.toggleTextActive,
              ]}
            >
              Annual
            </Text>
          </TouchableOpacity>
             <TouchableOpacity
            style={[
              styles.toggleButton,
              selectedCadence === 'weekly' && styles.toggleButtonActive,
            ]}
            onPress={() => setSelectedCadence('weekly')}
          >
            <Text
              style={[
                styles.toggleText,
                selectedCadence === 'weekly' && styles.toggleTextActive,
              ]}
            >
             Weekly
            </Text>
          </TouchableOpacity>
        </View>

        {/* Save 15% text */}
        {selectedCadence === 'annual' && (
          <Text style={styles.discountText}>
            🎉 Save 15% with annual subscription
          </Text>
        )}

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
                    <Text style={styles.cadence}>/ {selectedCadence}</Text>
                  </View>

                  <View style={{ marginTop: scale(12) }}>
                    {Array.isArray(plan.features) && plan.features.length > 0 ? (
                      plan.features.map((feature: any, i: number) => (
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
                      ))
                    ) : null}
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

        <PaymentStatusModal
          visible={showStatusModal}
          status={
            paymentStatus === 'pending' ||
            paymentStatus === 'completed' ||
            paymentStatus === 'failed'
              ? paymentStatus
              : null
          }
          onClose={() => setShowStatusModal(false)}
        />
      </ScrollView>
    </View>
  );
};

export default PricingScreen;
