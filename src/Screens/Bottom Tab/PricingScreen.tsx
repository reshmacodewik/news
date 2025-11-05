
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
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { getApiWithOutQuery } from '../../Utils/api/common';
import {
  API_SUBSCRIPTION_PLANS,
  API_GET_USER_ACTIVE_PLAN,
} from '../../Utils/api/APIConstant';

import Header from '../../Components/Header';
import { navigate } from '../../Navigators/utils';
import { styles } from '../../style/PricingStyles';
import { useAuth } from '../Auth/AuthContext';
import PaymentStatusModal from '../../Components/PaymentStatusModal';
import { useTheme } from '../../context/ThemeContext';
import PremiumOnlyScreen from './PremiumOnlyScreen';

const scale = (size: number) => (Dimensions.get('window').width / 375) * size;

const LOGO = require('../../icons/logoblack.png');
const AVATAR = require('../../icons/user.png');
const CHECK = require('../../icons/checkBlue.png');
const DOT = require('../../icons/dot.png');

type Cadence = 'weekly' | 'monthly' | 'annual' | 'yearly';
type Plan = {
  _id: string;
  name: string;
  price?: Partial<Record<Cadence, number>>;
  description?: Partial<Record<Cadence, string>>;
  features?: Partial<Record<Cadence, string[]>>;
};

const ACTIVE_KEY = (uid: string) => `activePlan_${uid}`;
const ACTIVE_CYCLE_KEY = (uid: string) => `activePlanCycle_${uid}`;

const toId = (v: any): string | undefined => {
  if (!v) return undefined;
  try {
    return String((v as any)?._id ?? v);
  } catch {
    return undefined;
  }
};

type Tier = 'free' | 'standard' | 'premium';
const detectTierFromName = (name?: string): Tier => {
  const n = (name || '').toLowerCase();
  if (n.includes('premium')) return 'premium';
  if (n.includes('standard')) return 'standard';
  if (n.includes('free') || n.includes('starter')) return 'free';
  return 'standard';
};
const tierRank: Record<Tier, number> = { free: 0, standard: 1, premium: 2 };

const normalizeCadence = (
  c?: string | null,
): 'weekly' | 'monthly' | 'annual' | null => {
  if (!c) return null;
  const v = String(c).toLowerCase();
  if (v.startsWith('week')) return 'weekly';
  if (v.startsWith('month')) return 'monthly';
  if (v.startsWith('year') || v === 'annual') return 'annual';
  return null;
};

/** NEW: cadence ordering for lock rules */
const cycleRank: Record<'weekly' | 'monthly' | 'annual', number> = {
  weekly: 0,
  monthly: 1,
  annual: 2,
};

/** NEW: determines if a candidate (cycle,tier) is <= active (cycle,tier) */
const isLowerOrEqualPlan = (
  candidateCycle: 'weekly' | 'monthly' | 'annual',
  candidateTier: Tier,
  activeCycle: 'weekly' | 'monthly' | 'annual' | null,
  activeTier: Tier | null,
) => {
  if (!activeCycle || !activeTier) return false; // nothing active yet
  const cC = cycleRank[candidateCycle];
  const cA = cycleRank[activeCycle];
  if (cC < cA) return true; // lower cadence (e.g., weekly < monthly)
  if (cC > cA) return false; // higher cadence (e.g., annual > monthly)
  // same cadence -> lower OR equal tier is locked (equal shows Activated)
  return tierRank[candidateTier] <= tierRank[activeTier];
};

const PricingScreen: React.FC = () => {
  if (Platform.OS === 'ios') {
    return <PremiumOnlyScreen />;
  }
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const { session } = useAuth();

  const [selectedCadence, setSelectedCadence] = useState<
    'weekly' | 'monthly' | 'annual'
  >('monthly');

  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<
    'pending' | 'completed' | 'failed' | null
  >(null);

  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [hasSyncedFromServer, setHasSyncedFromServer] = useState(false);
  const [showPremiumNow, setShowPremiumNow] = useState(false);

  const [activeBillingCycleLocal, setActiveBillingCycleLocal] = useState<
    'weekly' | 'monthly' | 'annual' | null
  >(null);

  const appState = useRef(AppState.currentState);
  const pendingPlanIdRef = useRef<string | null>(null);
  const pendingCycleRef = useRef<'weekly' | 'monthly' | 'annual' | null>(null);

  const userId =
    (session as any)?.user?.id || (session as any)?.user?._id || null;

  /* ---------------------------- fetch: plans list --------------------------- */
  const { data: plans = [], isLoading } = useQuery<Plan[]>({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const res = await getApiWithOutQuery({ url: API_SUBSCRIPTION_PLANS });
      const raw = res?.data ?? res;
      const list = raw?.data ?? raw?.plans ?? raw?.items ?? raw;
      return Array.isArray(list) ? (list as Plan[]) : [];
    },
    staleTime: 60_000,
    refetchOnMount: 'always',
  });

  /* ------------------------ fetch: server active plan ----------------------- */
  const { data: activePlanData, isFetching: activeLoading } = useQuery({
    queryKey: ['active-plan', userId],
    enabled: !!userId && !!session?.accessToken,
    refetchOnMount: 'always',
    queryFn: async () => {
      const res = await fetch(
        `https://api.arcalisnews.com/api${API_GET_USER_ACTIVE_PLAN}`,
        { headers: { Authorization: `Bearer ${session?.accessToken}` } },
      );
      const json = await res.json();
      return json?.data ?? null;
    },
  });

  // Server truth for "Activated"
  const serverActivePlanId: string | null =
    activePlanData?.active === true &&
    activePlanData?.subscription?.status === 'active' &&
    activePlanData?.subscription?.paymentStatus === 'completed'
      ? (toId(activePlanData?.plan) ?? null)
      : null;

  const serverActiveBillingCycle: 'weekly' | 'monthly' | 'annual' | null =
    normalizeCadence(
      activePlanData?.subscription?.billingCycle ||
        activePlanData?.billingCycle ||
        activePlanData?.activeInfo?.billingCycle ||
        null,
    );

  const serverActiveTier: Tier | null = serverActivePlanId
    ? detectTierFromName(activePlanData?.plan?.name)
    : null;

  // ✅ Are we actively on a paid plan (not free)?
  const isPremiumActive = !!serverActivePlanId && serverActiveTier !== 'free';

  // Sync server-active plan to local state + storage; mark sync done
  useEffect(() => {
    if (!userId) return;
    if (serverActivePlanId) {
      setActivePlanId(serverActivePlanId);
      AsyncStorage.setItem(ACTIVE_KEY(userId), serverActivePlanId).catch(
        () => {},
      );
    }
    if (serverActiveBillingCycle) {
      setActiveBillingCycleLocal(serverActiveBillingCycle);
      AsyncStorage.setItem(
        ACTIVE_CYCLE_KEY(userId),
        serverActiveBillingCycle,
      ).catch(() => {});
    }
    if (activePlanData != null) setHasSyncedFromServer(true);
  }, [serverActivePlanId, serverActiveBillingCycle, activePlanData, userId]);

  // Local fallback (offline / first paint)
  const loadLocalState = useCallback(async () => {
    if (!userId) return;
    try {
      const [storedPlan, storedCycle] = await Promise.all([
        AsyncStorage.getItem(ACTIVE_KEY(userId)),
        AsyncStorage.getItem(ACTIVE_CYCLE_KEY(userId)),
      ]);
      setActivePlanId(storedPlan ?? null);
      setActiveBillingCycleLocal(normalizeCadence(storedCycle) as any);
    } catch {}
  }, [userId]);

  useEffect(() => {
    if (userId) loadLocalState();
  }, [userId, loadLocalState]);

  useEffect(() => {
    if (userId && session?.accessToken) {
      queryClient.invalidateQueries({ queryKey: ['active-plan', userId] });
    }
  }, [userId, session?.accessToken, queryClient]);

  useFocusEffect(
    React.useCallback(() => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ['active-plan', userId] });
      }
    }, [userId, queryClient]),
  );

  /* ------------------------------ subscribe flow --------------------------- */
const handleSubscribe = async (planId: string) => {
  try {
    const token = session?.accessToken;

    // 👇 translate UI cadence → API cadence
    type ApiCycle = 'weekly' | 'monthly' | 'yearly';
    const apiBillingCycle: ApiCycle =
      selectedCadence === 'annual' ? 'yearly' : selectedCadence;

    if (!token || !userId) {
      Alert.alert('Please log in', 'You need to log in to subscribe.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => navigate('Login', {} as any) },
      ]);
      return;
    }

    setLoadingPlan(planId);
    pendingPlanIdRef.current = planId;
    // keep local state as 'annual' for your UI/locks
    pendingCycleRef.current = selectedCadence;

    const res = await fetch(`http://192.168.1.36:9991/api/billing/create-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        planId,
        userId,
        billingCycle: apiBillingCycle, // ✅ send yearly/monthly/weekly
      }),
    });

    const json = await res.json();
    if (!res.ok || !json?.data?.checkoutUrl) {
      queryClient.invalidateQueries({ queryKey: ['active-plan', userId] });
      throw new Error(json?.error || 'Failed to create checkout');
    }

    setTransactionId(json.data.transactionId);
    await Linking.openURL(json.data.checkoutUrl);
    setPaymentStatus('pending');
    setShowStatusModal(true);
  } catch (e: any) {
    Alert.alert('Error', e?.message || 'Something went wrong.');
  } finally {
    setLoadingPlan(null);
  }
};


  // Confirm payment when app returns to foreground
  useEffect(() => {
    const sub = AppState.addEventListener('change', async nextState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextState === 'active' &&
        transactionId
      ) {
        try {
          const res = await fetch(
            `https://api.arcalisnews.com/api/billing/billing-check/${transactionId}`,
          );
          const json = await res.json();
          const status = json?.data?.paymentStatus;

          if (status === 'completed') {
            const purchasedPlanId = pendingPlanIdRef.current;
            const purchasedCycle = pendingCycleRef.current;

            if (userId && purchasedPlanId) {
              await AsyncStorage.setItem(ACTIVE_KEY(userId), purchasedPlanId);
              setActivePlanId(purchasedPlanId);
            }
            if (userId && purchasedCycle) {
              await AsyncStorage.setItem(
                ACTIVE_CYCLE_KEY(userId),
                purchasedCycle,
              );
              setActiveBillingCycleLocal(purchasedCycle);
            }

            queryClient.invalidateQueries({
              queryKey: ['active-plan', userId],
            });
            setPaymentStatus('completed');

            // ✅ immediately swap to premium-only UI without navigation
            setShowPremiumNow(true);
          } else if (status === 'failed') {
            setPaymentStatus('failed');
          } else {
            setPaymentStatus('pending');
          }
          setShowStatusModal(true);
        } catch {}
      }
      appState.current = nextState;
    });
    return () => sub.remove();
  }, [transactionId, userId, queryClient]);
useEffect(() => {
  if (!userId || !hasSyncedFromServer) return;

  const planExistsOnServerList = plans.some(
    p => String(p._id) === String(serverActivePlanId || '')
  );

  // If server has NO active plan, or the referenced plan doesn't exist anymore,
  // clear local fallbacks so UI won't show "Activated".
  if (!serverActivePlanId || !planExistsOnServerList) {
    setActivePlanId(null);
    setActiveBillingCycleLocal(null);
    AsyncStorage.removeItem(ACTIVE_KEY(userId)).catch(() => {});
    AsyncStorage.removeItem(ACTIVE_CYCLE_KEY(userId)).catch(() => {});
  }
}, [userId, hasSyncedFromServer, serverActivePlanId, plans]);

  // Free fallback only AFTER server-sync attempt (prevents overriding paid)
  useEffect(() => {
    if (!hasSyncedFromServer) return;
    if (!plans.length || activePlanId) return;
    const free = plans.find(
      p =>
        p.price?.monthly === 0 ||
        p.price?.yearly === 0 ||
        p.price?.annual === 0 ||
        p.price?.weekly === 0,
    );
    if (free) setActivePlanId(free._id);
  }, [hasSyncedFromServer, plans, activePlanId]);

  const mostExpensive = plans.length
    ? plans.reduce((prev, curr) =>
        (curr.price?.[selectedCadence] ?? 0) >
        (prev.price?.[selectedCadence] ?? 0)
          ? curr
          : prev,
      )
    : null;

  const activeTier: Tier | null =
    serverActiveTier ??
    (activePlanId
      ? detectTierFromName(
          plans.find(p => String(p._id) === String(activePlanId))?.name,
        )
      : null);

  const activeBillingCycle: 'weekly' | 'monthly' | 'annual' | null =
    serverActiveBillingCycle ?? activeBillingCycleLocal ?? null;

  /* ----------------- ⛳️ EARLY RETURN / REDIRECT LOGIC ----------------- */

  if (isPremiumActive || showPremiumNow) {
    return <PremiumOnlyScreen />;
  }

  /* -------------------------- PRICING UI (default) ------------------------- */

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

        {/* cadence switch */}
        <View
          style={[styles.toggleContainer, { backgroundColor: colors.card }]}
        >
          {['weekly', 'monthly', 'annual'].map(cadence => {
            return (
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
            );
          })}
        </View>

        {selectedCadence === 'annual' && (
          <Text style={[styles.discountText, { color: colors.text }]}>
            🎉 Save 15% with yearly subscription
          </Text>
        )}

        {/* plans */}
        {isLoading ? (
          <ActivityIndicator
            style={{ marginTop: 30 }}
            size="large"
            color="#2260B2"
          />
        ) : plans.length > 0 ? (
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

            // Active “id” and “cycle” from server/local
            const currentActiveId = hasSyncedFromServer
              ? serverActivePlanId
              : activePlanId;
            const activeCycle = activeBillingCycle; // 'weekly' | 'monthly' | 'annual' | null
            const activeTierSafe = activeTier; // 'free' | 'standard' | 'premium' | null

            // This plan’s “tier” (by name) and the UI-selected cycle
            const thisTier = detectTierFromName(plan.name);
            const thisCycle = selectedCadence;

            // Show “Activated” only when both plan id AND cycle match the active
            const isActivatedHere =
              String(currentActiveId || '') === String(plan._id) &&
              !!activeCycle &&
              activeCycle === thisCycle;

            // Lock anything that is lower-or-equal than the active pair
            const lowerOrEqualLocked = isLowerOrEqualPlan(
              thisCycle,
              thisTier,
              activeCycle,
              activeTierSafe,
            );

            // FINAL disable rule (no UI/class changes)
            const disableButton =
              isActivatedHere ||
              lowerOrEqualLocked ||
              isFree ||
              loadingPlan === plan._id;

            const buttonText = isActivatedHere
              ? 'Activated'
              : lowerOrEqualLocked
                ? isFree
                  ? 'Free'
                  : 'Subscribe'
                : isFree
                  ? 'Free'
                  : 'Subscribe';

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

                  {/* features */}
                  <View style={{ marginTop: scale(12) }}>
                    {features.length > 0 ? (
                      features.map((feature, i) => (
                        <View
                          key={`${plan._id}_f_${i}`}
                          style={styles.featureRow}
                        >
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

                  {/* CTA */}
                  <TouchableOpacity
                    style={[
                      styles.subscribeButton,
                      (isActivatedHere || lowerOrEqualLocked) && {
                        backgroundColor: '#aaa',
                      },
                    ]}
                    disabled={disableButton}
                    onPress={() => handleSubscribe(plan._id)}
                  >
                    <Text style={styles.buttonText}>{buttonText}</Text>
                  </TouchableOpacity>
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
            status={paymentStatus}
            onClose={() => setShowStatusModal(false)}
          />
        )}
      </ScrollView>
    </View>
  );
};

export default PricingScreen;
