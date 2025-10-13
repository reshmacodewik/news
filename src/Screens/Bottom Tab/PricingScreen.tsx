import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { getApiWithOutQuery } from '../../Utils/api/common';
import { API_SUBSCRIPTION_PLANS } from '../../Utils/api/APIConstant';
import Header from '../../Components/Header';
import { navigate } from '../../Navigators/utils';
import { styles } from '../../style/PricingStyles';
import { useAuth } from '../Auth/AuthContext';

const scale = (size: number) => (Dimensions.get('window').width / 375) * size;

const LOGO = require('../../icons/logoblack.png');
const AVATAR = require('../../icons/user.png');
const CHECK = require('../../icons/checkBlue.png');
const DOT = require('../../icons/dot.png');

const getApiBaseUrl = () => {
  if (Platform.OS === 'android') return 'http://10.0.2.2:9991'; // Android Emulator
  if (Platform.OS === 'ios') return 'http://localhost:9991'; // iOS Simulator
  return 'http://192.168.1.36:9991'; // Physical device (replace with your machine’s IP)
};

const API_BASE = getApiBaseUrl();

const PricingScreen: React.FC = () => {
  const selectedCadence: 'monthly' | 'yearly' = 'monthly';
  const insets = useSafeAreaInsets();
  const { session } = useAuth();

  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const[paymentStatus,setPaymentStatus]=useState<string | null >(null);

  // ✅ Fetch subscription plans
  const { data, isLoading } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const res = await getApiWithOutQuery({ url: API_SUBSCRIPTION_PLANS });
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

  // ✅ Handle Subscribe
  const handleSubscribe = async (planId: string) => {
    try {
      setLoadingPlan(planId);

      const billingCycle = selectedCadence;
      const userId = session?.user?.id;

      if (!planId || !billingCycle || !userId) {
        Alert.alert('Error', 'Missing required fields for subscription');
        return;
      }

      const res = await fetch(
        `http://192.168.1.36:9991/api/billing/create-checkout`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            planId,
            userId,
            billingCycle,
            variantId: 624004,
          }),
        },
      );

      const json = await res.json();

      if (!res.ok || !json?.data?.checkoutUrl) {
        throw new Error(json?.error || 'Failed to create checkout');
      }

      let url = json.data.checkoutUrl.trim();
      const trxId = json.data.transactionId;

      // ✅ Ensure valid URL format
      if (!/^https?:\/\//i.test(url)) {
        url = `https://${url}`;
      }

      // ✅ Open in external browser
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        setTransactionId(trxId);
        setShowStatusModal(true);
      } else {
        Alert.alert('Error', 'Cannot open link. Please try again.');
      }
    } catch (e) {
      console.error('Error creating checkout:', e);
      Alert.alert('Error', 'Failed to open checkout. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  };

  // ✅ Poll billing status
  // ✅ Payment polling effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (transactionId && showStatusModal) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(
            `http://192.168.1.36:9991/api/billing/billing-check/${transactionId}`,
          );
          const json = await res.json();
          const status = json?.data?.paymentStatus;
          console.log("status",status);

          if (status === 'completed') {
            setPaymentStatus('completed');
            clearInterval(interval);
          } else if (status === 'failed') {
            setPaymentStatus('failed');
            clearInterval(interval);
          } else {
            setPaymentStatus('pending');
          }
        } catch (e) {
          console.error('Error checking billing:', e);
        }
      }, 3000);
    }

    return () => clearInterval(interval);
  }, [transactionId, showStatusModal]);

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
                    {plan.features.map(
                      (
                        feature:
                          | string
                          | number
                          | bigint
                          | boolean
                          | React.ReactElement<
                              unknown,
                              string | React.JSXElementConstructor<any>
                            >
                          | Iterable<React.ReactNode>
                          | React.ReactPortal
                          | Promise<
                              | string
                              | number
                              | bigint
                              | boolean
                              | React.ReactPortal
                              | React.ReactElement<
                                  unknown,
                                  string | React.JSXElementConstructor<any>
                                >
                              | Iterable<React.ReactNode>
                              | null
                              | undefined
                            >
                          | null
                          | undefined,
                        i: React.Key | null | undefined,
                      ) => (
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
                      ),
                    )}
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

        {/* ✅ Payment Status Modal */}
        {/* ✅ Payment Status Modal */}
        {showStatusModal && (
          <Modal transparent>
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0,0,0,0.5)',
              }}
            >
              <View
                style={{
                  backgroundColor: '#fff',
                  padding: 24,
                  borderRadius: 12,
                  alignItems: 'center',
                  width: '80%',
                }}
              >
                {paymentStatus === 'pending' && (
                  <>
                    <ActivityIndicator size="large" color="#2260B2" />
                    <Text style={{ marginTop: 10, fontSize: 16 }}>
                      Waiting for payment...
                    </Text>
                  </>
                )}

                {paymentStatus === 'completed' && (
                  <>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: 'green',
                      }}
                    >
                      Payment Successful 🎉
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setShowStatusModal(false);
                        navigate('PaymentSuccess' as never);
                      }}
                    >
                      <Text style={{ marginTop: 16, color: '#2260B2' }}>
                        Continue
                      </Text>
                    </TouchableOpacity>
                  </>
                )}

                {paymentStatus === 'failed' && (
                  <>
                    <Text
                      style={{ fontSize: 18, fontWeight: 'bold', color: 'red' }}
                    >
                      Payment Failed ❌
                    </Text>
                    <TouchableOpacity onPress={() => setShowStatusModal(false)}>
                      <Text style={{ marginTop: 16, color: 'red' }}>Close</Text>
                    </TouchableOpacity>
                  </>
                )}

                {paymentStatus === 'pending' && (
                  <TouchableOpacity onPress={() => setShowStatusModal(false)}>
                    <Text style={{ marginTop: 10, color: 'red' }}>Cancel</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </Modal>
        )}
      </ScrollView>
    </View>
  );
};

export default PricingScreen;
