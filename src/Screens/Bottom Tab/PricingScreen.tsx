import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
  Linking,
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
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const scale = (size: number) => (Dimensions.get('window').width / 375) * size;

const LOGO = require('../../icons/logoblack.png');
const AVATAR = require('../../icons/user.png');
const CHECK = require('../../icons/checkBlue.png');
const DOT = require('../../icons/dot.png');
const PricingScreen: React.FC = () => {
  const [selectedCadence, setSelectedCadence] = useState<
    'weekly' | 'monthly' | 'annual'
  >('monthly');
  const insets = useSafeAreaInsets();
  const { session } = useAuth();

  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const { theme, colors } = useTheme();
  const userId =
    (session as any)?.user?.id || (session as any)?.user?._id || null;
  const appState = useRef(AppState.currentState);
  console.log('hello', userId);

  // ✅ Fetch subscription plans
  const { data: plans, isLoading } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const res = await getApiWithOutQuery({ url: API_SUBSCRIPTION_PLANS });
      console.log('🟦 Plans Response:', res?.data);
      return res?.data || [];
    },
  });

  // ✅ Find the most expensive plan
  const mostExpensive =
    Array.isArray(plans) && plans.length
      ? plans.reduce((prev, curr) =>
          (curr.price?.[selectedCadence] || 0) >
          (prev.price?.[selectedCadence] || 0)
            ? curr
            : prev,
        )
      : null;

  // ✅ Handle subscribe click
 const loadActivePlan = async () => {
  if (!userId) return;
  try {
    console.log('hello', userId);
    const stored = await AsyncStorage.getItem(`activePlan_${userId}`);
    console.log('🔹 Loaded from AsyncStorage:', `activePlan_${userId}`, '=>', stored);

    if (stored) {
      setActivePlanId(stored);
      console.log('✅ Active plan set to:', stored);
    } else {
      setActivePlanId(null);
      console.log('⚪ No plan found for user');
    }
  } catch (error) {
    console.error('Error loading active plan:', error);
  }
};

// ✅ Load saved plan on mount or when user logs in
useEffect(() => {
  if (userId) {
    loadActivePlan();
  }
}, [userId]);

  // ✅ Handle subscribe click
  const handleSubscribe = async (planId: string) => {
    try {
      const billingCycle = selectedCadence;
      const token = session?.accessToken;

      if (!token || !userId) {
        Alert.alert('Please log in', 'You need to log in to subscribe.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => navigate('Login', {} as any) },
        ]);
        return;
      }

      setLoadingPlan(planId);

      const res = await fetch(
        `http://192.168.1.36:9991/api/billing/create-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ planId, userId, billingCycle }),
        },
      );

      const json = await res.json();
      if (!res.ok || !json?.data?.checkoutUrl) {
        throw new Error(json?.error || 'Failed to create checkout');
      }

      const { checkoutUrl, transactionId } = json.data;
      setTransactionId(transactionId);

      // ✅ Save plan for this specific user
      await AsyncStorage.setItem(`activePlan_${userId}`, planId);
      console.log('✅ Saved plan:', planId, 'for user:', userId);
      await loadActivePlan(); // recheck immediately

      setActivePlanId(planId);

      await Linking.openURL(checkoutUrl);
      setPaymentStatus('pending');
      setShowStatusModal(true);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Something went wrong.');
    } finally {
      setLoadingPlan(null);
    }
  };

  // ✅ Check payment status on resume

  useEffect(() => {
    const sub = AppState.addEventListener('change', async nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        if (transactionId) {
          try {
            console.log('🔄 Checking payment for:', transactionId);
            const res = await fetch(
              `http://192.168.1.36:9991/api/billing/billing-check/${transactionId}`,
            );
            const json = await res.json();
            const status = json?.data?.paymentStatus;

            console.log('✅ Payment check:', status);

            if (status === 'completed') setPaymentStatus('completed');
            else if (status === 'failed') setPaymentStatus('failed');
            else setPaymentStatus('pending');

            setShowStatusModal(true);
          } catch (err) {
            console.error('Error checking payment:', err);
          }
        }
      }
      appState.current = nextAppState;
    });

    return () => sub.remove();
  }, [transactionId]);
  useEffect(() => {
    if (plans && plans.length > 0 && !activePlanId) {
      const freePlan = plans.find((p: { name: string }) =>
        /free|starter/i.test(p.name || ''),
      );
      if (freePlan) setActivePlanId(freePlan._id);
    }
  }, [plans, activePlanId]);

  useEffect(() => {
    const loadActivePlan = async () => {
      const storedPlanId = await AsyncStorage.getItem('activePlanId');
      if (storedPlanId) {
        setActivePlanId(storedPlanId);
      }
    };
    loadActivePlan();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ height: insets.top }} />
      <Header
        logoSource={LOGO}
        avatarSource={AVATAR}
        guestRoute="More"
        authRoute="More"
      />

      <ScrollView
        style={[styles.scroll, { backgroundColor: colors.background }]}
        contentContainerStyle={{ paddingBottom: insets.bottom + scale(35) }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.pageTitle, { color: colors.text }]}>
          Subscription Plans
        </Text>

        {/* TOGGLE */}
        <View
          style={[styles.toggleContainer, { backgroundColor: colors.card }]}
        >
          {['weekly', 'monthly', 'annual'].map(cadence => (
            <TouchableOpacity
              key={cadence}
              style={[
                styles.toggleButton,
                selectedCadence === cadence && styles.toggleButtonActive,
              ]}
              onPress={() => setSelectedCadence(cadence as any)}
            >
              <Text
                style={[
                  styles.toggleText,
                  { color: colors.headingtext },
                  selectedCadence === cadence && styles.toggleTextActive,
                ]}
              >
                {cadence === 'annual'
                  ? 'Yearly'
                  : cadence.charAt(0).toUpperCase() + cadence.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedCadence === 'annual' && (
          <Text style={[styles.discountText, { color: colors.text }]}>
            🎉 Save 15% with yearly subscription
          </Text>
        )}

        {/* PLANS */}
        {isLoading ? (
          <ActivityIndicator
            style={{ marginTop: 30 }}
            size="large"
            color="#2260B2"
          />
        ) : Array.isArray(plans) && plans.length > 0 ? (
          plans.map(plan => {
            const price =
              plan.price?.[selectedCadence] ??
              plan.price?.yearly ??
              plan.price?.annual ??
              0;
            const description =
              plan.description?.[selectedCadence] ??
              plan.description?.yearly ??
              plan.description?.annual ??
              plan.description?.monthly ??
              'No description available';
            const features =
              plan.features?.[selectedCadence] ??
              plan.features?.yearly ??
              plan.features?.annual ??
              plan.features?.monthly ??
              [];

            const isMostPopular = plan._id === mostExpensive?._id;
            const isFree = price === 0;

            return (
              <View
                key={plan._id}
                style={[
                  styles.planCard,
                  isMostPopular && { borderColor: '#2260B2', borderWidth: 3 },
                ]}
              >
                {isMostPopular && (
                  <View style={styles.ribbon}>
                    <Text style={styles.ribbonText}>MOST POPULAR PLAN</Text>
                  </View>
                )}

                <View
                  style={[styles.innerCard, { backgroundColor: colors.card }]}
                >
                  <Text
                    style={[styles.planTitle, { color: colors.headingtext }]}
                  >
                    {plan.name}
                  </Text>
                  <Text style={[styles.planSubtitle, { color: colors.text }]}>
                    {description}
                  </Text>

                  <View
                    style={[styles.priceRow, { backgroundColor: colors.card }]}
                  >
                    <Text style={[styles.price, { color: colors.headingtext }]}>
                      {isFree ? 'Free' : `$${price}`}
                    </Text>
                    {!isFree && (
                      <Text style={[styles.cadence, { color: colors.text }]}>
                        /{' '}
                        {selectedCadence === 'annual'
                          ? 'yearly'
                          : selectedCadence}
                      </Text>
                    )}
                  </View>

                  {/* FEATURES */}
                  <View style={{ marginTop: scale(12) }}>
                    {Array.isArray(features) && features.length > 0 ? (
                      features.map((feature: string, i: number) => (
                        <View key={i} style={styles.featureRow}>
                          <Image
                            source={i === 0 ? CHECK : DOT}
                            style={[
                              styles.featureIcon,
                              i === 0 && styles.featureIconBlue,
                            ]}
                          />
                          <Text
                            style={[styles.featureText, { color: colors.text }]}
                          >
                            {feature}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <Text
                        style={[styles.featureText, { color: colors.text }]}
                      >
                        No features listed
                      </Text>
                    )}
                  </View>

                  {(() => {
                    const currentPlanId = session?.user?.planId ?? null;
                    const userHasPlan = !!currentPlanId;

                    const isFree =
                      plan.price?.monthly === 0 ||
                      plan.price?.yearly === 0 ||
                      plan.price?.annual === 0;

                    let buttonText = 'Subscribe Now';

                    if (plan.name?.toLowerCase().includes('premium')) {
                      buttonText = 'Go Premium';
                    }

                    if (userHasPlan) {
                      console.log(plan._id);
                      if (plan._id === currentPlanId) {
                        // ✅ User’s currently active plan
                        buttonText = 'Activated';
                      } else if (isFree) {
                        // ✅ Free plan should show "Free" (not activated)
                        buttonText = 'Free';
                      } else {
                        // ✅ Other paid plans should still say "Subscribe Now"
                        buttonText = 'Subscribe Now';
                      }
                    } else if (!userHasPlan && isFree) {
                      // ✅ User with no plan → free plan becomes active
                      buttonText = 'Activated';
                    }

                    // Disable only if loading or active plan
                    const isDisabled =
                      loadingPlan === plan._id ||
                      (userHasPlan && plan._id === currentPlanId);

                    return (
                      <TouchableOpacity
                        style={[
                          styles.subscribeButton,
                          activePlanId === plan._id && {
                            backgroundColor: '#aaa',
                          }, // gray for active
                          activePlanId &&
                            activePlanId !== plan._id && { opacity: 0.6 }, // dim other plans
                        ]}
                        onPress={() => handleSubscribe(plan._id)}
                      >
                        <Text style={styles.buttonText}>
                          {activePlanId === plan._id
                            ? 'Activated' // Active purchased plan
                            : plan.name.toLowerCase().includes('free')
                              ? 'Free' // Free plan only says Free
                              : plan.name.toLowerCase().includes('premium')
                                ? 'Go Premium' // Premium plan CTA
                                : 'Subscribe'}
                        </Text>
                      </TouchableOpacity>
                    );
                  })()}
                </View>
              </View>
            );
          })
        ) : (
          <Text style={{ textAlign: 'center', marginTop: 20 }}>
            No plans available.
          </Text>
        )}

        {transactionId && (
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
        )}
      </ScrollView>
    </View>
  );
};

export default PricingScreen;
